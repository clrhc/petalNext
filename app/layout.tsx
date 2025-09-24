import type { Metadata } from "next";
import { Providers } from './providers';





/**
 * Metadata for the page
 */
export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Petal Finance",
    description:
      "Petal Finance",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
         imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
            iconUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
            splashBackgroundColor:
              "#FFF",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang='en'>
        <meta name="viewport" content="width=device-width, initial-scale=1, max-scale=1" />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
