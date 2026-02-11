'use client';
import '../globals.css';
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Predictions from '../components/petal/predictions';

export default function PredictPage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Chainlink Oracles</span>
        <h1>Prediction Markets</h1>
        <p>Bid higher or lower on 8 crypto pairs. Correct predictions earn PETAL, WEED, and ETH. Losers still earn WEED.</p>
      </div>

      {isConnected ? (
        <div className="pageCard">
          <Predictions />
        </div>
      ) : (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to place predictions on crypto prices.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      )}
    </div>
  );
}
