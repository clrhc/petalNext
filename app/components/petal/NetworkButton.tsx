'use client';

import { useNetwork } from '../../hooks/useNetwork';
import { useAppKit } from '@reown/appkit/react';

export default function NetworkButton() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  if (!isConnected) return null;

  const label = isSolana ? 'Solana' : 'Base';
  const dotClass = isSolana ? 'networkDot networkDot--solana' : 'networkDot networkDot--base';

  return (
    <button className="networkButton" onClick={() => open({ view: 'Networks' })}>
      <span className={dotClass} />
      {label}
    </button>
  );
}
