function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = 'https://petal.wtf' as string;
return Response.json({
     "accountAssociation": {
    "header": "",
    "payload": "",
    "signature": ""
  },
   "baseBuilder": {
    "allowedAddresses": ["0x0870dF064d160f40c8F6c966dCa25db9326b23F4"],
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
    "screenshotUrls": ["https://i.imgur.com/7DgS91f.png"],
  },
});
}