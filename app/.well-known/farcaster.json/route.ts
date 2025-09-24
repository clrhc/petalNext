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
  const URL = process.env.NEXT_PUBLIC_URL;
 
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: "Petal Finance",
      subtitle: "Petal Finance",
      description: "Petal Finance",
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      splashImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: "survivor-fun",
      ogDescription: "survivor-fun",
      ogImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
    }),
  });
}