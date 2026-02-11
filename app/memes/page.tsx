'use client';
import '../globals.css';
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Memes from '../components/petal/memes';

export default function MemesPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Meme Pools</span>
        <h1>Meme Market</h1>
        <p>Trade community meme tokens paired with WEED liquidity. Swap in and out of illiquid meme pools on Base.</p>
      </div>

      {isConnected ? (
        <Memes />
      ) : (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to trade meme tokens.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      )}
    </div>
  );
}
