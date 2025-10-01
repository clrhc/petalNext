import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { headers } from 'next/headers';
import ContextProvider from './context';

export async function generateMetadata(): Promise<Metadata> {
    return {
        other: {
        'fc:miniapp': JSON.stringify({
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
         'baseBuilder': JSON.stringify({
          allowedAddresses: ["0x0870dF064d160f40c8F6c966dCa25db9326b23F4"],
        }),
         'accountAssociation': JSON.stringify({
          header: "eyJmaWQiOjI5MzE5NCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDY4Yjk3RDg5ODk0OUE2NzgxZDc3OUU0Y0U1NEVDRjQyQTJhM2NCNWQifQ",
          payload: "eyJkb21haW4iOiIifQ",
          signature: "DoUssDrbzR1HEYW4Y8EIlBF7jeKyZEcaDowwlr9pKF8qxMul5t1jE6F6AkWt+H420xYKOucS3qSBYfs+RqNBSRw="
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
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}
