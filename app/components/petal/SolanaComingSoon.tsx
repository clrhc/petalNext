'use client';

import { useAppKit } from '@reown/appkit/react';

export default function SolanaComingSoon({ featureName }: { featureName: string }) {
  const { open } = useAppKit();

  return (
    <div className="solanaComingSoon">
      <h2>Coming Soon on Solana</h2>
      <p>{featureName} is currently available on Base only. Solana support is on the way.</p>
      <span className="connectBtn" onClick={() => open({ view: 'Networks' })}>
        Switch Network
      </span>
    </div>
  );
}
