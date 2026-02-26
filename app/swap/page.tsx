'use client';
import '../globals.css';
import { useNetwork } from '../hooks/useNetwork';
import { useAppKit } from "@reown/appkit/react";
import SwapCoins from '../components/petal/swapCoins';
import SwapSolana from '../components/petal/swapSolana';
import Data from '../data.json';

export default function SwapPage() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">{isSolana ? 'Jupiter Swap' : 'Bonding Curve'}</span>
        <h1>Trade PETAL</h1>
        <p>
          {isSolana
            ? 'Buy and sell PETAL on Solana via Jupiter. Eligible swaps require no SOL for gas — fees are covered from swap output.'
            : 'Buy and sell PETAL on the automated bonding curve. Price increases with demand — early participants benefit most.'}
        </p>
      </div>

      {!isConnected ? (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to trade on the PETAL bonding curve.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      ) : isSolana ? (
        <div className="pageCard">
          <SwapSolana />
        </div>
      ) : (
        <div className="pageCard">
          <SwapCoins tokenAddress={Data.petalToken} factoryAddress={Data.petalFactory} />
        </div>
      )}
    </div>
  );
}
