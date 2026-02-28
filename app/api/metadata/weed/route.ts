import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'WEED',
    symbol: 'WEED',
    description: 'Petal Protocol reward token. Earned 3x for every net-new PETAL purchase.',
    image: 'https://i.imgur.com/hNkINnM.png',
  });
}
