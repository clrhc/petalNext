/**
 * One-time script: attach Metaplex metadata to the WEED token on-chain.
 *
 * Usage:
 *   npx tsx scripts/set-weed-metadata.ts
 *
 * Requires env var:
 *   SOLANA_MINT_AUTHORITY_PRIVATE_KEY  (bs58-encoded keypair — same one used for minting)
 *   NEXT_PUBLIC_HELIUS_RPC_URL         (optional, defaults to mainnet-beta)
 */

import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from '@solana/web3.js';
import bs58 from 'bs58';
import Data from '../app/data.json';

// ---------- Config ----------
const WEED_MINT = new PublicKey(Data.solanaWeed);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const METADATA = {
  name: 'WEED',
  symbol: 'WEED',
  // Off-chain JSON that wallets/explorers fetch for image, description, etc.
  // Host this JSON somewhere (Arweave, IPFS, or any public URL) with this shape:
  // { "name": "WEED", "symbol": "WEED", "image": "https://...", "description": "..." }
  uri: 'https://petal.wtf/api/metadata/weed',
};

// ---------- Helpers ----------

function getMintAuthority(): Keypair {
  const raw = process.env.SOLANA_MINT_AUTHORITY_PRIVATE_KEY;
  if (!raw) throw new Error('Set SOLANA_MINT_AUTHORITY_PRIVATE_KEY env var');
  return Keypair.fromSecretKey(bs58.decode(raw));
}

function getConnection(): Connection {
  const rpc = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpc, 'confirmed');
}

/** Derive the metadata PDA for a given mint */
function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  );
  return pda;
}

/**
 * Build the CreateMetadataAccountV3 instruction manually.
 * This avoids pulling in the full @metaplex-foundation packages.
 *
 * Instruction layout (borsh-serialized):
 *   discriminator: u8 = 33 (CreateMetadataAccountV3)
 *   data: DataV2
 *   isMutable: bool
 *   collectionDetails: Option<CollectionDetails> = None
 */
function encodeString(s: string): Buffer {
  const buf = Buffer.alloc(4 + s.length);
  buf.writeUInt32LE(s.length, 0);
  buf.write(s, 4, 'utf-8');
  return buf;
}

function buildCreateMetadataV3Ix(
  metadataPda: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  updateAuthority: PublicKey,
  name: string,
  symbol: string,
  uri: string,
): { keys: { pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[]; data: Buffer } {
  // DataV2: name, symbol, uri, sellerFeeBasisPoints(u16), creators(Option), collection(Option), uses(Option)
  const parts: Buffer[] = [];

  // Discriminator: 33 = CreateMetadataAccountV3
  parts.push(Buffer.from([33]));

  // DataV2
  parts.push(encodeString(name));
  parts.push(encodeString(symbol));
  parts.push(encodeString(uri));
  // sellerFeeBasisPoints: u16 = 0
  const fee = Buffer.alloc(2);
  fee.writeUInt16LE(0, 0);
  parts.push(fee);
  // creators: Option<Vec<Creator>> = None
  parts.push(Buffer.from([0]));
  // collection: Option<Collection> = None
  parts.push(Buffer.from([0]));
  // uses: Option<Uses> = None
  parts.push(Buffer.from([0]));

  // isMutable: bool = true
  parts.push(Buffer.from([1]));
  // collectionDetails: Option<CollectionDetails> = None
  parts.push(Buffer.from([0]));

  const data = Buffer.concat(parts);

  const keys = [
    { pubkey: metadataPda, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: mintAuthority, isSigner: true, isWritable: false },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: updateAuthority, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return { keys, data };
}

// ---------- Main ----------

async function main() {
  if (!METADATA.uri) {
    console.error('ERROR: Set the metadata URI in this script before running.');
    console.error('Host a JSON file with { "name": "WEED", "symbol": "WEED", "image": "https://..." }');
    console.error('then paste the URL into the METADATA.uri field.');
    process.exit(1);
  }

  const connection = getConnection();
  const authority = getMintAuthority();

  console.log('Mint:', WEED_MINT.toBase58());
  console.log('Authority:', authority.publicKey.toBase58());
  console.log('Metadata:', JSON.stringify(METADATA));

  const metadataPda = findMetadataPda(WEED_MINT);
  console.log('Metadata PDA:', metadataPda.toBase58());

  // Check if metadata already exists
  const existing = await connection.getAccountInfo(metadataPda);
  if (existing) {
    console.log('Metadata account already exists! If you need to update it, use UpdateMetadataAccountV2 instead.');
    process.exit(0);
  }

  const { keys, data } = buildCreateMetadataV3Ix(
    metadataPda,
    WEED_MINT,
    authority.publicKey,
    authority.publicKey,
    authority.publicKey,
    METADATA.name,
    METADATA.symbol,
    METADATA.uri,
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const message = new TransactionMessage({
    payerKey: authority.publicKey,
    recentBlockhash: blockhash,
    instructions: [
      {
        programId: TOKEN_METADATA_PROGRAM_ID,
        keys,
        data,
      },
    ],
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign([authority]);

  console.log('Sending transaction...');
  const sig = await connection.sendTransaction(tx, { skipPreflight: false });
  console.log('Confirming...');
  await connection.confirmTransaction(sig, 'confirmed');
  console.log('Done! Metadata created.');
  console.log('Signature:', sig);
  console.log(`https://solscan.io/tx/${sig}`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
