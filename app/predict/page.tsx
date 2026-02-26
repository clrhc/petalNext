'use client';
import '../globals.css';
import { useNetwork } from '../hooks/useNetwork';
import { useAppKit } from "@reown/appkit/react";
import Predictions from '../components/petal/predictions';
import SolanaComingSoon from '../components/petal/SolanaComingSoon';

export default function PredictPage() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Chainlink Oracles</span>
        <h1>Prediction Markets</h1>
        <p>Bid higher or lower on 8 crypto pairs. Correct predictions earn PETAL, WEED, and ETH. Losers still earn WEED.</p>
      </div>

      {!isConnected ? (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to place predictions on crypto prices.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      ) : isSolana ? (
        <SolanaComingSoon featureName="Prediction Markets" />
      ) : (
        <Predictions />
      )}
    </div>
  );
}
