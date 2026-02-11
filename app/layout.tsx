import type { Metadata } from "next";
import { headers } from 'next/headers';
import ContextProvider from './context';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Petal Protocol',
        description: 'The DeFi Protocol for Meme Markets — Bonding Curves, Prediction Markets & Liquidity Pools on Base',
        icons: {
    icon: [
    { url: "/favicon.ico" },
    ],
    shortcut: [{ url: "/logo16.png" },{ url: "/logo32.png" },],
    apple: [{ url: "/logo.png" },],
    other: [{ rel: "android-chrome", url: "/logo192.png" },{ rel: "android-chrome", url: "/logo512.png" },],
    },
    openGraph: {
    title: "Petal Protocol",
    description: "The DeFi Protocol for Meme Markets — Bonding Curves, Prediction Markets & Liquidity Pools on Base",
    url: "https://www.petal.wtf",
    siteName: "Petal Protocol",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 627,
        alt: "Petal Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petal Protocol",
    description: "The DeFi Protocol for Meme Markets — Bonding Curves, Prediction Markets & Liquidity Pools on Base",
    images: ["/thumbnail.png"],
  },
        other: {
        'fc:miniapp': JSON.stringify({
            version: 'next',
            imageUrl: 'https://i.imgur.com/6fsw46l.png',
            button: {
                title: `Launch Petal Protocol`,
                action: {
                    type: 'launch_miniapp',
                    name: 'Petal Protocol',
                    url: 'https://petal.wtf',
                    splashImageUrl: "https://i.imgur.com/pYoZQlK.png",
                    splashBackgroundColor: "#040d0d",
                },
            },
        }),
        },
    };
    }


export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <ContextProvider cookies={cookies}>
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
    </ContextProvider>
  )
}
