export async function GET() {
  const HEADER = process.env.ACCOUNT_ASSOC_HEADER as string;
  const PAYLOAD = process.env.ACCOUNT_ASSOC_PAYLOAD as string;
  const SIGNATURE = process.env.ACCOUNT_ASSOC_SIGNATURE as string;

  return Response.json({
    accountAssociation:
      {
      header: HEADER,
      payload: PAYLOAD,
      signature: SIGNATURE,},
    baseBuilder: {
      allowedAddresses: [
        "0x0870dF064d160f40c8F6c966dCa25db9326b23F4",
        "0xB1fadDeca6cBCCD536355a4eFe0E2d5517a1F04F",
      ],
    },
    miniapp: {
      version: "1",
      name: "Petal Finance",
      iconUrl: "https://i.imgur.com/cOl0Utj.png",
      homeUrl: "https://petal.wtf",
      imageUrl: "https://i.imgur.com/6fsw46l.png",
      buttonTitle: "Register Now for Free Rewards!",
      splashImageUrl: "https://i.imgur.com/pYoZQlK.png",
      webhookUrl: "https://petal.wtf/api/webhook",
      splashBackgroundColor: "#1e534c",
      subtitle: "Register Now for Free Rewards!",
      description: "V2 DeFi and Meme Markets",
      screenshotUrls: ["https://i.imgur.com/7DgS91f.png"],
      primaryCategory: "finance",
      tags: ["miniapp", "baseapp", "defi"],
      heroImageUrl: "https://i.imgur.com/cOl0Utj.png",
      tagline: "Register Now for Free Rewards!",
      ogTitle: "Petal Finance",
      ogDescription: "Register Now for Free Rewards!",
      ogImageUrl: "https://i.imgur.com/6fsw46l.png",
      noindex: "false",
    },
  });
}