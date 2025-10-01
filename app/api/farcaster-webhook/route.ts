import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // ✅ Verify the incoming signature if needed (recommended)
    const body = req.body
    console.log('📨 Farcaster webhook received:', body)

    // Example: Handle a cast event
    if (body.type === 'cast.created') {
      const cast = body.data
      console.log(`New cast by ${cast.author.username}: ${cast.text}`)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}