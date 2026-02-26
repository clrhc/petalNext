'use client';
import '../globals.css';
import { useNetwork } from '../hooks/useNetwork';
import { useAppKit } from "@reown/appkit/react";
import Rewards from '../components/petal/rewards';
import SolanaComingSoon from '../components/petal/SolanaComingSoon';

export default function RewardsPage() {
  const { isConnected, isSolana } = useNetwork();
  const { open } = useAppKit();

  return (
    <div className="pageContainer">
      <div className="pageTitle">
        <span className="pageBadge">Token Rewards</span>
        <h1>Claim Rewards</h1>
        <p>Earn PETAL, WEED, and VIRTUE from referrals and VirtueSekai NFT holdings. Rewards accumulate automatically.</p>
        <p className="pageDisclaimer">Rewards are only available for Base network mints of VirtueSekai NFT.</p>
      </div>

      {!isConnected ? (
        <div className="connectPrompt">
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to view and claim your rewards.</p>
          <span className="connectBtn" onClick={() => open()}>Connect Wallet</span>
        </div>
      ) : isSolana ? (
        <SolanaComingSoon featureName="Rewards claiming" />
      ) : (
        <div className="pageCard">
          <Rewards />
        </div>
      )}
    </div>
  );
}
