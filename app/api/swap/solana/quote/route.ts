import { NextResponse } from 'next/server';

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { inputMint, outputMint, amount, userPublicKey, slippageBps = 300 } = await request.json();

    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (JUPITER_API_KEY) headers['x-api-key'] = JUPITER_API_KEY;

    // Try Ultra API first (gasless for swaps >= ~$10)
    try {
      const ultraUrl = `https://api.jup.ag/ultra/v1/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&taker=${userPublicKey}`;
      const ultraRes = await fetch(ultraUrl, { headers });

      if (ultraRes.ok) {
        const ultraData = await ultraRes.json();
        if (ultraData.transaction) {
          return NextResponse.json({
            transaction: ultraData.transaction,
            outAmount: ultraData.outAmount,
            priceImpactPct: ultraData.priceImpactPct || '0',
            requestId: ultraData.requestId,
            isUltra: true,
            gasless: ultraData.gasless === true,
            feeBps: ultraData.feeBps ?? 0,
          });
        }
      }
    } catch {
      // Ultra not available, fall through to regular
    }

    // Regular Jupiter API
    const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    const quoteRes = await fetch(quoteUrl, { headers });

    if (!quoteRes.ok) {
      return NextResponse.json({ error: 'No route available' }, { status: 404 });
    }

    const quoteData = await quoteRes.json();

    const swapRes = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      }),
    });

    if (!swapRes.ok) {
      return NextResponse.json({ error: 'Failed to build transaction' }, { status: 500 });
    }

    const swapData = await swapRes.json();

    return NextResponse.json({
      transaction: swapData.swapTransaction,
      outAmount: quoteData.outAmount,
      priceImpactPct: quoteData.priceImpactPct || '0',
      isUltra: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
