import { NextResponse } from 'next/server';

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { signedTransaction, requestId } = await request.json();

    if (!signedTransaction || !requestId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (JUPITER_API_KEY) headers['x-api-key'] = JUPITER_API_KEY;

    const res = await fetch('https://api.jup.ag/ultra/v1/execute', {
      method: 'POST',
      headers,
      body: JSON.stringify({ signedTransaction, requestId }),
    });

    const data = await res.json();

    if (!res.ok || data.status === 'Failed') {
      return NextResponse.json(
        { error: data.error || 'Execution failed', status: data.status },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signature: data.signature,
      status: data.status || 'Success',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
