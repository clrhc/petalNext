import React from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

export default function Wallet() {
  const { address, isConnected } = useAppKitAccount();

  const truncated = address
    ? address.length > 20
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address.slice(0, 4) + '...' + address.slice(-4)
    : '';

  return (
    <>
      {isConnected ? (
        <div>
          <p>{truncated}</p>
        </div>
      ) : (
        <div>
          <p>Connect Wallet</p>
        </div>
      )}
    </>
  );
}
