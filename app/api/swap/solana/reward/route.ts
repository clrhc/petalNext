import { NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { kv } from '@vercel/kv';
import bs58 from 'bs58';
import Data from '../../../../data.json';

const PETAL_MINT = new PublicKey(Data.solanaToken);
const WEED_MINT_ADDR = process.env.SOLANA_WEED_MINT || Data.solanaWeed;
const WEED_MULTIPLIER = 3;
const WEED_DECIMALS = 6;
// In-memory dedup as fast first layer (KV is the durable layer)
const processedTxs = new Set<string>();

function getMintAuthority(): Keypair {
  const raw = process.env.SOLANA_MINT_AUTHORITY_PRIVATE_KEY;
  if (!raw) throw new Error('SOLANA_MINT_AUTHORITY_PRIVATE_KEY not configured');
  return Keypair.fromSecretKey(bs58.decode(raw));
}

function getConnection(): Connection {
  const rpc = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpc, 'confirmed');
}

/**
 * Wait for a transaction to reach confirmed status, retrying up to maxAttempts.
 */
async function waitForConfirmation(
  connection: Connection,
  txSignature: string,
  maxAttempts = 4,
  delayMs = 3000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await connection.getSignatureStatus(txSignature);
    const value = status?.value;
    if (value?.confirmationStatus === 'confirmed' || value?.confirmationStatus === 'finalized') {
      return;
    }
    if (i < maxAttempts - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

/**
 * Parse a confirmed transaction to find the PETAL received AND the user's
 * post-tx PETAL balance. Returns null if the tx is not a valid PETAL buy.
 */
async function verifyPetalBuy(
  connection: Connection,
  txSignature: string,
  userWallet: PublicKey,
): Promise<{ received: bigint; postBalance: bigint } | null> {
  // Wait for confirmation before fetching parsed transaction
  await waitForConfirmation(connection, txSignature);

  const tx = await connection.getParsedTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  });

  if (!tx || tx.meta?.err) return null;

  const pre = tx.meta?.preTokenBalances ?? [];
  const post = tx.meta?.postTokenBalances ?? [];

  const userAddr = userWallet.toBase58();
  const petalMint = PETAL_MINT.toBase58();

  let preAmount = BigInt(0);
  let postAmount = BigInt(0);

  for (const b of pre) {
    if (b.mint === petalMint && b.owner === userAddr) {
      preAmount = BigInt(b.uiTokenAmount.amount);
    }
  }

  for (const b of post) {
    if (b.mint === petalMint && b.owner === userAddr) {
      postAmount = BigInt(b.uiTokenAmount.amount);
    }
  }

  const received = postAmount - preAmount;
  if (received <= BigInt(0)) return null;

  return { received, postBalance: postAmount };
}

/** Serialize any error into a loggable string — handles Solana's nested error shapes */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorToString(err: any): string {
  if (!err) return 'unknown error (falsy)';
  const parts: string[] = [];
  if (err.message) parts.push(`message: ${err.message}`);
  if (err.code) parts.push(`code: ${err.code}`);
  if (err.logs) parts.push(`logs: ${JSON.stringify(err.logs)}`);
  if (err.data?.logs) parts.push(`data.logs: ${JSON.stringify(err.data.logs)}`);
  if (err.data && !err.data.logs) parts.push(`data: ${JSON.stringify(err.data)}`);
  if (parts.length === 0) {
    try { return JSON.stringify(err); } catch { return String(err); }
  }
  return parts.join(' | ');
}

/**
 * Core reward logic — extracted so both POST (immediate) and GET (retry) can use it.
 * Returns the JSON response payload or throws.
 */
async function processReward(txSignature: string, userWallet: string) {
  console.log('[reward] START txSignature:', txSignature, 'wallet:', userWallet);

  // --- Dedup: memory first, then KV ---
  if (processedTxs.has(txSignature)) {
    console.log('[reward] SKIP — in-memory dedup hit');
    return { alreadyClaimed: true };
  }

  const txKey = `weed:tx:${txSignature}`;
  const alreadyProcessed = await kv.get(txKey);
  if (alreadyProcessed) {
    processedTxs.add(txSignature);
    console.log('[reward] SKIP — KV dedup hit');
    return { alreadyClaimed: true };
  }

  const connection = getConnection();
  const userPubkey = new PublicKey(userWallet);

  // --- Verify the swap on-chain ---
  console.log('[reward] verifying PETAL buy on-chain...');
  const result = await verifyPetalBuy(connection, txSignature, userPubkey);
  if (result === null) {
    console.log('[reward] SKIP — not a valid PETAL buy or not confirmed');
    return { notABuy: true };
  }
  console.log('[reward] verified — received:', result.received.toString(), 'postBalance:', result.postBalance.toString());

  // --- Net-positive high water mark ---
  const basisKey = `weed:basis:${userWallet}`;
  const storedBasis = await kv.get<string>(basisKey);
  const previousBasis = storedBasis ? BigInt(storedBasis) : BigInt(0);
  console.log('[reward] previousBasis:', previousBasis.toString());

  const eligible = result.postBalance - previousBasis;
  if (eligible <= BigInt(0)) {
    await kv.set(txKey, '1', { ex: 60 * 60 * 24 * 30 });
    processedTxs.add(txSignature);
    console.log('[reward] SKIP — no net-new PETAL (eligible:', eligible.toString(), ')');
    return { noNewPetal: true };
  }

  const rewardablePetal = eligible < result.received ? eligible : result.received;
  const weedAmountRaw = rewardablePetal * BigInt(WEED_MULTIPLIER);

  let mintAuthority: Keypair;
  try {
    mintAuthority = getMintAuthority();
  } catch (e) {
    console.error('[reward] FAIL getMintAuthority:', errorToString(e));
    throw e;
  }
  const weedMint = new PublicKey(WEED_MINT_ADDR);

  console.log('[reward] minting', weedAmountRaw.toString(), 'raw WEED (',
    Number(weedAmountRaw) / Math.pow(10, WEED_DECIMALS), 'UI) to', userWallet,
    '| authority:', mintAuthority.publicKey.toBase58(),
    '| weedMint:', weedMint.toBase58());

  // Get or create user's WEED associated token account
  let userAta;
  try {
    userAta = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      weedMint,
      userPubkey,
    );
    console.log('[reward] ATA:', userAta.address.toBase58());
  } catch (e) {
    console.error('[reward] FAIL getOrCreateAssociatedTokenAccount:', errorToString(e));
    throw e;
  }

  // Mint WEED to user — use Number() to avoid bigint-buffer serialization
  // issues in Vercel serverless (safe since WEED amounts won't exceed MAX_SAFE_INTEGER)
  let mintSig: string;
  try {
    mintSig = await mintTo(
      connection,
      mintAuthority,
      weedMint,
      userAta.address,
      mintAuthority,
      Number(weedAmountRaw),
    );
    console.log('[reward] SUCCESS mintTo sig:', mintSig);
  } catch (e) {
    console.error('[reward] FAIL mintTo:', errorToString(e));
    throw e;
  }

  // Update KV: mark tx processed + raise high water mark
  const newBasis = previousBasis + rewardablePetal;
  await Promise.all([
    kv.set(txKey, '1', { ex: 60 * 60 * 24 * 30 }),
    kv.set(basisKey, newBasis.toString()),
  ]);
  processedTxs.add(txSignature);

  // Remove from pending if it was there
  const pendingKey = `weed:pending:${userWallet}`;
  const pendingList = await kv.get<string[]>(pendingKey);
  if (pendingList && pendingList.includes(txSignature)) {
    const updated = pendingList.filter(s => s !== txSignature);
    if (updated.length > 0) {
      await kv.set(pendingKey, updated, { ex: 60 * 60 * 24 * 7 });
    } else {
      await kv.del(pendingKey);
    }
  }

  const weedAmountUI = Number(weedAmountRaw) / Math.pow(10, WEED_DECIMALS);
  console.log('[reward] DONE — rewarded', weedAmountUI, 'WEED');

  return {
    mintSignature: mintSig,
    weedAmount: weedAmountRaw.toString(),
    weedAmountUI,
  };
}

export async function POST(request: Request) {
  try {
    const { txSignature, userWallet } = await request.json();

    if (!txSignature || !userWallet) {
      return NextResponse.json({ error: 'Missing txSignature or userWallet' }, { status: 400 });
    }

    if (!WEED_MINT_ADDR) {
      return NextResponse.json({ error: 'WEED token not configured' }, { status: 503 });
    }

    // Store as pending in KV so it can be retried if user leaves
    const pendingKey = `weed:pending:${userWallet}`;
    const pendingList = (await kv.get<string[]>(pendingKey)) || [];
    if (!pendingList.includes(txSignature)) {
      await kv.set(pendingKey, [...pendingList, txSignature], { ex: 60 * 60 * 24 * 7 }); // 7 day TTL
    }

    const result = await processReward(txSignature, userWallet);

    if (result.alreadyClaimed) {
      return NextResponse.json({ error: 'Reward already claimed for this transaction' }, { status: 409 });
    }
    if (result.notABuy) {
      return NextResponse.json(
        { error: 'Transaction is not a valid PETAL buy or has not confirmed' },
        { status: 400 },
      );
    }
    if (result.noNewPetal) {
      return NextResponse.json({ error: 'No net-new PETAL to reward' }, { status: 200 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[reward] POST CATCH:', errorToString(err));
    if (err instanceof Error && err.stack) console.error('[reward] stack:', err.stack);
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET — check and process any pending rewards for a wallet.
 * Called on page load so rewards are never lost if user left before minting.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userWallet = searchParams.get('wallet');

    if (!userWallet) {
      return NextResponse.json({ error: 'Missing wallet param' }, { status: 400 });
    }
    if (!WEED_MINT_ADDR) {
      return NextResponse.json({ error: 'WEED token not configured' }, { status: 503 });
    }

    const pendingKey = `weed:pending:${userWallet}`;
    const pendingList = await kv.get<string[]>(pendingKey);

    if (!pendingList || pendingList.length === 0) {
      return NextResponse.json({ pending: 0, results: [] });
    }

    const results = [];
    for (const sig of pendingList) {
      try {
        const result = await processReward(sig, userWallet);
        if (result.mintSignature) {
          results.push({ txSignature: sig, ...result });
        }
      } catch (e) {
        console.error('[reward] pending retry failed for', sig, ':', errorToString(e));
        // Keep in pending for next retry
      }
    }

    return NextResponse.json({ pending: pendingList.length, results });
  } catch (err: unknown) {
    console.error('[reward] GET CATCH:', errorToString(err));
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
