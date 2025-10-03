import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from 'next/headers';
import ContextProvider from './context';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Petal Finance',
        description: 'V2 DeFi and Meme Markets',
        icons: {
    icon: [
    { url: "/favicon.ico" },
    ],
    shortcut: [{ url: "/logo16.png" },{ url: "/logo32.png" },],
    apple: [{ url: "/logo.png" },],
    other: [{ rel: "android-chrome", url: "/logo192.png" },{ rel: "android-chrome", url: "/logo512.png" },],
    },
    openGraph: {
    title: "Petal Finance",
    description: "Gamified DeFi, bonding curves, XP rewards & more 🌸",
    url: "https://www.petal.wtf",
    siteName: "Petal Finance",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 627,
        alt: "Petal Finance",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petal Finance",
    description: "Gamified DeFi, bonding curves, XP rewards & more 🌸",
    images: ["/thumbnail.png"],
  },
        other: {
        'fc:miniapp': JSON.stringify({
            version: 'next',
            imageUrl: 'https://i.imgur.com/6fsw46l.png',
            button: {
                title: `Launch Petal Finance`,
                action: {
                    type: 'launch_miniapp',
                    name: 'Petal Finance',
                    url: 'https://petal.wtf',
                    splashImageUrl: "https://i.imgur.com/pYoZQlK.png",
                    splashBackgroundColor: "#1e534c",
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
    </ContextProvider>
  )
}
