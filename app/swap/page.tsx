'use client';
import '../globals.css';
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import SwapCoins from '../components/petal/swapCoins';
import Data from '../data.json';

export default function SwapPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Bonding Curve</span>
        <h1>Trade PETAL</h1>
        <p>Buy and sell PETAL on the automated bonding curve. Price increases with demand — early participants benefit most.</p>
      </div>

      {isConnected ? (
        <div className="pageCard">
          <SwapCoins tokenAddress={Data.petalToken} factoryAddress={Data.petalFactory} />
        </div>
      ) : (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to trade on the PETAL bonding curve.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      )}
    </div>
  );
}
