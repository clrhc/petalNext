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
    "name": "Petal Finance",
    "version": "1",
    "iconUrl": "https://i.imgur.com/cOl0Utj.png",
    "homeUrl": "https://petal.wtf",
    "imageUrl": "https://i.imgur.com/6fsw46l.png",
    "buttonTitle": "Register Now for Free Rewards!",
    "splashImageUrl": "https://i.imgur.com/pYoZQlK.png",
    "splashBackgroundColor": "#1e534c",
    "subtitle": "Register Now for Free Rewards!",
    "description": "V2 DeFi and Meme Markets",
    "screenshotUrls": [
      "https://i.imgur.com/7DgS91f.png"
    ],
    "primaryCategory": "finance",
    "tags": [
      "miniapp",
      "baseapp",
      "defi"
    ],
    "heroImageUrl": "https://i.imgur.com/cOl0Utj.png",
    "tagline": "Register Now for Free Rewards!",
    "ogTitle": "Petal Finance",
    "ogDescription": "Register Now for Free Rewards!",
    "ogImageUrl": "https://i.imgur.com/6fsw46l.png"
  },
});
}