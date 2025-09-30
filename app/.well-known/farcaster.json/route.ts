function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = 'https://petal.wtf' as string;
return Response.json({
     "accountAssociation": {
    "header": "eyJmaWQiOjI5MzE5NCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDY4Yjk3RDg5ODk0OUE2NzgxZDc3OUU0Y0U1NEVDRjQyQTJhM2NCNWQifQ",
    "payload": "eyJkb21haW4iOiJwZXRhbC53dGYifQ",
    "signature": "MkOBH0JNqtwLM6h/CQlq2GpFp5LgnDIEGacEaEKm9s0DTIMkaoutuO6HHYNlcyp0pkFHmxt7xjp0KtbuVQkAHhs="
  },
   "baseBuilder": {
    "allowedAddresses": [""],
  },
    "miniapp": {
    "version": "1",
    "name": "Petal Finance",
    "homeUrl": "https://petal.wtf",
    "iconUrl": "https://i.imgur.com/cOl0Utj.png",
    "splashImageUrl": "https://i.imgur.com/pYoZQlK.png",
    "splashBackgroundColor": "#1e534c",
    "webhookUrl": "https://petal.wtf/api/webhook",
    "subtitle": "Register Now for Free Rewards!",
    "description": "V2 DeFi and Meme Markets",
    "primaryCategory": "finance",
    "tags": ["miniapp", "baseapp", "DeFi"],
    "heroImageUrl": "https://i.imgur.com/cOl0Utj.png",
    "tagline": "Register Now for Free Rewards!",
    "ogTitle": "Petal Finance",
    "ogDescription": "Register Now for Free Rewards!",
    "ogImageUrl": "https://i.imgur.com/6fsw46l.png",
    "noindex": false,
    "screenshotUrls": ["https://i.imgur.com/7DgS91f.png"],
  },
});
}