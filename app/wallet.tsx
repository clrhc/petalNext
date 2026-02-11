import React from 'react';
import { useAccount } from 'wagmi';

export default function Wallet() {
  const { address, isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <div>
          <p>{String(address).slice(0, 6) + '...' + String(address).slice(38, 42)}</p>
        </div>
      ) : (
        <div>
          <p>Connect Wallet</p>
        </div>
      )}
    </>
  );
}
