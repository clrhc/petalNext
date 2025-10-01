import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { headers } from 'next/headers';
import ContextProvider from './context';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Petal Finance',
        description: 'V2 DeFi and Meme Markets',
        other: {
        'fc:frame': JSON.stringify({
            version: 'next',
            imageUrl: 'https://i.imgur.com/6fsw46l.png',
            button: {
                title: `Petal Finance`,
                action: {
                    type: 'launch_miniapp',
                    name: 'Petal Finance',
                    url: 'https://petal.wtf',
                    iconUrl: "https://i.imgur.com/cOl0Utj.png",
                    splashImageUrl: 'https://i.imgur.com/pYoZQlK.png',
                    splashBackgroundColor: '#1e534c',
                    subtitle: "Register Now for Free Rewards!",
                    description: "V2 DeFi and Meme Markets",
                    homeUrl: "https://petal.wtf",
                    buttonTitle: "Register Now for Free Rewards!",
                    screenshotUrls: ["https://i.imgur.com/7DgS91f.png"],
                    primaryCategory: "finance",
                    tags: ["miniapp","baseapp","defi"],
                    heroImageUrl: "https://i.imgur.com/cOl0Utj.png",
                    tagline: "Register Now for Free Rewards!",
                    ogTitle: "Petal Finance",
                    ogDescription: "Register Now for Free Rewards!",
                    ogImageUrl: "https://i.imgur.com/6fsw46l.png"
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
        <SafeArea>{children}</SafeArea>
      </body>
    </html>
    </ContextProvider>
  )
}
