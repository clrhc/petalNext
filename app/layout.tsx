import type { Metadata } from "next";
import { Providers } from './providers';

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
                    splashImageUrl: 'https://i.imgur.com/pYoZQlK.png',
                    splashBackgroundColor: '#1e534c',
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
