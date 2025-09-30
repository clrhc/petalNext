function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
const URL = 'https://petal.wtf' as string;
return Response.json({
  "accountAssociation": {
    "header": "eyJmaWQiOjI5MzE5NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEI1MzFERENDMUZjRjk4QkM4M0ZhMTc0OGZCZDdCNTI5QTZFMTc3Y2MifQ",
    "payload": "eyJkb21haW4iOiJwZXRhbC53dGYifQ",
    "signature": "MHhkZTE5MGIzZDM1OWRlNjA2NDc0MWEwMTkxNDA0NTNjYmRkZjNmNDRkMDQxODdjOTBjNTExNDY1NzdmMTY1MGJhMDQ2ZTY0NjZiY2QyNWY2MWEzY2RhNWNlZTE1ZDNmOGFiZGI1YjIwNjlmNDhhY2YyYjNmNWM0OWNkMjgwYWIwNTFj"
  },
   "baseBuilder": {
    "allowedAddresses": ["0x0870df064d160f40c8f6c966dca25db9326b23f4"],
  },
   "miniapp": {
    "version": "1",
    "name": "Petal Finance",
    "homeUrl": "https://petal.wtf",
    "iconUrl": "https://i.imgur.com/cOl0Utj.png",
    "splashImageUrl": "https://i.imgur.com/pYoZQlK.png",
    "splashBackgroundColor": "#1e534c",
    "webhookUrl": "https://petal.wtf/api/webhook",
    "subtitle": "V2 DeFi and Meme Markets",
    "description": "Register Now for Free Rewards!",
    "primaryCategory": "finance",
    "tags": ["miniapp", "baseapp", "DeFi"],
    "heroImageUrl": "https://i.imgur.com/cOl0Utj.png",
    "tagline": "Register Now for Free Rewards!",
    "ogTitle": "Petal Finance",
    "ogDescription": "Register Now for Free Rewards!",
    "ogImageUrl": "https://i.imgur.com/6fsw46l.png",
    "noindex": true
  },
  "frame": withValidProperties({
    "name": "Petal Finance",
    "version": "1",
    "iconUrl": "https://i.imgur.com/cOl0Utj.png",
    "homeUrl": "https://petal.wtf",
    "imageUrl": "https://i.imgur.com/6fsw46l.png",
    "splashImageUrl": "https://i.imgur.com/pYoZQlK.png",
    "splashBackgroundColor": "#1e534c",
    "webhookUrl": "https://petal.wtf/api/webhook",
    "subtitle": "V2 DeFi and Meme Markets",
    "description": "Register Now for Free Rewards!",
    "primaryCategory": "finance"
  }),
});
}