'use client';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import petalLogo from './assets/img/petal.png';
import CoinInfo from './components/petal/coininfo';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

export default function Home() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <header>
      <div className="homeHeader">
        <span className="heading">
          <h2>PETAL PROTOCOL</h2>
          <p>
            The illiquid meme market on Base. Trade PETAL on the bonding curve,
            predict crypto prices with on-chain oracles, and earn token rewards.
          </p>
          {!isConnected ? (
            <p className="pointer" onClick={() => open()}>
              Launch App
            </p>
          ) : (
            <Link href="/swap" className="pointer" style={{ textDecoration: 'none' }}>
              Start Trading
            </Link>
          )}
          <Image alt="Petal Protocol" width={80} height={80} src={petalLogo} />
        </span>

        <div className="featureGrid">
          <div className="featureCard">
            <span className="featureIcon">&#x1F331;</span>
            <h3>Bonding Curve</h3>
            <p>PETAL trades on an automated bonding curve. Price rises with supply. No DEX listing until the curve fills at 40 ETH.</p>
          </div>
          <div className="featureCard">
            <span className="featureIcon">&#x1F52E;</span>
            <h3>Predictions</h3>
            <p>Bid higher or lower on 8 crypto pairs powered by Chainlink oracles. Win PETAL, WEED, and ETH on correct calls.</p>
          </div>
          <div className="featureCard">
            <span className="featureIcon">&#x1F680;</span>
            <h3>Meme Pools</h3>
            <p>Trade community meme tokens paired with WEED liquidity. CATGIRL, FEMBOY, CHEESE, BEETLE and more.</p>
          </div>
          <div className="featureCard">
            <span className="featureIcon">&#x1F381;</span>
            <h3>Rewards</h3>
            <p>Earn XP through referrals, claim PETAL, WEED, and VIRTUE rewards. VirtueSekai NFT holders earn bonus tokens.</p>
          </div>
        </div>

        <CoinInfo />
      </div>
    </header>
  );
}
