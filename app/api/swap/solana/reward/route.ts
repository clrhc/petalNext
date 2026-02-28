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
 * Parse a confirmed transaction to find the PETAL received AND the user's
 * post-tx PETAL balance. Returns null if the tx is not a valid PETAL buy.
 */
async function verifyPetalBuy(
  connection: Connection,
  txSignature: string,
  userWallet: PublicKey,
): Promise<{ received: bigint; postBalance: bigint } | null> {
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

export async function POST(request: Request) {
  try {
    const { txSignature, userWallet } = await request.json();

    if (!txSignature || !userWallet) {
      return NextResponse.json({ error: 'Missing txSignature or userWallet' }, { status: 400 });
    }

    if (!WEED_MINT_ADDR) {
      return NextResponse.json({ error: 'WEED token not configured' }, { status: 503 });
    }

    // --- Dedup: memory first, then KV ---
    if (processedTxs.has(txSignature)) {
      return NextResponse.json({ error: 'Reward already claimed for this transaction' }, { status: 409 });
    }

    const txKey = `weed:tx:${txSignature}`;
    const alreadyProcessed = await kv.get(txKey);
    if (alreadyProcessed) {
      processedTxs.add(txSignature);
      return NextResponse.json({ error: 'Reward already claimed for this transaction' }, { status: 409 });
    }

    const connection = getConnection();
    const userPubkey = new PublicKey(userWallet);

    // --- Verify the swap on-chain ---
    const result = await verifyPetalBuy(connection, txSignature, userPubkey);
    if (result === null) {
      return NextResponse.json(
        { error: 'Transaction is not a valid PETAL buy or has not confirmed' },
        { status: 400 },
      );
    }

    // --- Net-positive high water mark ---
    // Only reward PETAL above the user's previously rewarded basis.
    // E.g. buy 100 (basis 0→100, reward 100), sell 50, buy 60 (balance 110,
    // basis 100 → reward 10). Prevents gaming via buy-sell-rebuy cycles.
    const basisKey = `weed:basis:${userWallet}`;
    const storedBasis = await kv.get<string>(basisKey);
    const previousBasis = storedBasis ? BigInt(storedBasis) : BigInt(0);

    const eligible = result.postBalance - previousBasis;
    if (eligible <= BigInt(0)) {
      // User's balance is still at or below their previously rewarded watermark
      // Mark tx as processed so they can't retry
      await kv.set(txKey, '1', { ex: 60 * 60 * 24 * 30 }); // 30 day TTL
      processedTxs.add(txSignature);
      return NextResponse.json({ error: 'No net-new PETAL to reward' }, { status: 200 });
    }

    // Cap eligible at the actual received amount (shouldn't exceed, but be safe)
    const rewardablePetal = eligible < result.received ? eligible : result.received;
    const weedAmountRaw = rewardablePetal * BigInt(WEED_MULTIPLIER);

    const mintAuthority = getMintAuthority();
    const weedMint = new PublicKey(WEED_MINT_ADDR);

    // Get or create user's WEED associated token account
    const userAta = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      weedMint,
      userPubkey,
    );

    // Mint WEED to user
    const mintSig = await mintTo(
      connection,
      mintAuthority,
      weedMint,
      userAta.address,
      mintAuthority,
      weedAmountRaw,
    );

    // Update KV: mark tx processed + raise high water mark
    const newBasis = previousBasis + rewardablePetal;
    await Promise.all([
      kv.set(txKey, '1', { ex: 60 * 60 * 24 * 30 }),
      kv.set(basisKey, newBasis.toString()),
    ]);
    processedTxs.add(txSignature);

    const weedAmountUI = Number(weedAmountRaw) / Math.pow(10, WEED_DECIMALS);

    return NextResponse.json({
      mintSignature: mintSig,
      weedAmount: weedAmountRaw.toString(),
      weedAmountUI,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('Reward mint error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
