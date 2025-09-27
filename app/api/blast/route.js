// app/api/blast/route.js

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch('https://base-mainnet.public.blastapi.io/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
  console.error('Error fetching from Blast API:', error);
  return new Response(JSON.stringify({ error: 'Error fetching from Blast API' }), {
    status: 500,
  });
}
}
