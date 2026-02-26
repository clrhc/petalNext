'use client';
import '../globals.css';
import { useNetwork } from '../hooks/useNetwork';
import { useAppKit } from "@reown/appkit/react";
import Memes from '../components/petal/memes';
import SolanaComingSoon from '../components/petal/SolanaComingSoon';

export default function MemesPage() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Meme Pools</span>
        <h1>Meme Market</h1>
        <p>Trade community meme tokens paired with WEED liquidity. Swap in and out of illiquid meme pools on Base.</p>
      </div>

      {!isConnected ? (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to trade meme tokens.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      ) : isSolana ? (
        <SolanaComingSoon featureName="Meme Market trading" />
      ) : (
        <Memes />
      )}
    </div>
  );
}
