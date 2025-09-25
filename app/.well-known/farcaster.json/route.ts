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
  "frame": withValidProperties({
    "name": "Petal Finance",
    "version": "1",
    "iconUrl": "https://petal.wtf/icon.png",
    "homeUrl": "https://petal.wtf",
    "imageUrl": "https://petal.wtf/image.png",
    "splashImageUrl": "https://petal.wtf/splash.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://petal.wtf/api/webhook",
    "subtitle": "V2 DeFi and Meme Markets",
    "description": "Register Now for Free Rewards!",
    "primaryCategory": "finance"
  }),
});
}