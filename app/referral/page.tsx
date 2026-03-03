'use client';
import '../globals.css';
import { useNetwork } from '../hooks/useNetwork';
import { useAppKit } from "@reown/appkit/react";
import Referral from '../components/petal/referral';
import SolanaComingSoon from '../components/petal/SolanaComingSoon';

export default function ReferralPage() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Earn XP</span>
        <h1>Referral Program</h1>
        <p>Register with a referral code and invite others. Earn XP, PETAL, WEED, and VIRTUE for every sign-up.</p>
      </div>

      {!isConnected ? (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to register and start earning referral XP.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      ) : isSolana ? (
        <SolanaComingSoon featureName="Referral Program" />
      ) : (
        <div className="pageCard">
          <Referral />
        </div>
      )}
    </div>
  );
}
