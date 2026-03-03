'use client';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { useAppKit } from "@reown/appkit/react";
import { useNetwork } from './hooks/useNetwork';
import petalLogo from './assets/img/petal.png';
import CoinInfo from './components/petal/coininfo';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

export default function Home() {
  const { open } = useAppKit();
  const { isConnected } = useNetwork();

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <header>
      <div className="homeHeader">
        {/* Decorative orbs */}
        <div className="heroOrb heroOrb1" />
        <div className="heroOrb heroOrb2" />
        <div className="heroOrb heroOrb3" />

        <span className="heading">
          <div className="heroBadge">
            <span className="heroBadgeDot" />
            Live on Base & Solana
          </div>
          <h2>The DeFi Engine<br />Built for Degens</h2>
          <p>
            Trade on autonomous bonding curves, predict crypto prices with Chainlink oracles,
            and swap across an ecosystem of meme-powered liquidity pools — on Base and Solana.
          </p>
          <div className="heroCtas">
            {!isConnected ? (
              <button className="ctaPrimary" onClick={() => open()}>
                Launch App
              </button>
            ) : (
              <Link href="/swap" className="ctaPrimary" style={{ textDecoration: 'none' }}>
                Start Trading
              </Link>
            )}
            <Link href="#features" className="ctaSecondary" style={{ textDecoration: 'none' }}>
              Explore Features
            </Link>
          </div>
          <Image alt="Petal Protocol" width={100} height={100} src={petalLogo} className="heroLogo" />
        </span>

        <div className="statsBar">
          <div className="statItem">
            <span className="statValue">2</span>
            <span className="statLabel">Chains</span>
          </div>
          <div className="statDivider" />
          <div className="statItem">
            <span className="statValue">8</span>
            <span className="statLabel">Oracle Pairs</span>
          </div>
          <div className="statDivider" />
          <div className="statItem">
            <span className="statValue">40 ETH</span>
            <span className="statLabel">Curve Target</span>
          </div>
          <div className="statDivider" />
          <div className="statItem">
            <span className="statValue">4</span>
            <span className="statLabel">Meme Pools</span>
          </div>
        </div>

        <div className="featureGrid" id="features">
          <div className="featureCard featureCard--delay1">
            <div className="featureIconWrap featureIconWrap--teal">
              <span className="featureIcon">&#x1F331;</span>
            </div>
            <h3>Bonding Curve</h3>
            <p>PETAL trades on an automated bonding curve on Base with algorithmically determined pricing. On Solana, trade PETAL via Jupiter with gas-free eligible swaps.</p>
            <Link href="/swap" className="featureLink" style={{ textDecoration: 'none' }}>
              Trade Now <span>&rarr;</span>
            </Link>
          </div>
          <div className="featureCard featureCard--delay2">
            <div className="featureIconWrap featureIconWrap--purple">
              <span className="featureIcon">&#x1F52E;</span>
            </div>
            <h3>Price Predictions</h3>
            <p>Go higher or lower on 8 crypto pairs powered by Chainlink price feeds. Correct predictions earn PETAL, WEED, and ETH from the pool.</p>
            <Link href="/predict" className="featureLink" style={{ textDecoration: 'none' }}>
              Predict Now <span>&rarr;</span>
            </Link>
          </div>
          <div className="featureCard featureCard--delay3">
            <div className="featureIconWrap featureIconWrap--green">
              <span className="featureIcon">&#x1F680;</span>
            </div>
            <h3>Meme Liquidity Pools</h3>
            <p>Trade community tokens paired with WEED liquidity. Access CATGIRL, FEMBOY, CHEESE, BEETLE, and more in dedicated meme swap pools.</p>
            <Link href="/memes" className="featureLink" style={{ textDecoration: 'none' }}>
              Swap Memes <span>&rarr;</span>
            </Link>
          </div>
          <div className="featureCard featureCard--delay4">
            <div className="featureIconWrap featureIconWrap--gold">
              <span className="featureIcon">&#x1F381;</span>
            </div>
            <h3>Referrals</h3>
            <p>Earn XP through referrals and protocol activity. Invite friends and climb the leaderboard together.</p>
            <Link href="/referral" className="featureLink" style={{ textDecoration: 'none' }}>
              Refer Friends <span>&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="howSection">
          <h2 className="sectionTitle">How It Works</h2>
          <div className="howGrid">
            <div className="howStep">
              <div className="howStepNumber">1</div>
              <h4>Connect Wallet</h4>
              <p>Link your wallet to Base or Solana to start interacting with the ecosystem.</p>
            </div>
            <div className="howStepArrow">&rarr;</div>
            <div className="howStep">
              <div className="howStepNumber">2</div>
              <h4>Trade or Predict</h4>
              <p>Buy PETAL on the bonding curve or via Jupiter, swap meme tokens, or place predictions on price movements.</p>
            </div>
            <div className="howStepArrow">&rarr;</div>
            <div className="howStep">
              <div className="howStepNumber">3</div>
              <h4>Earn Tokens</h4>
              <p>Collect PETAL, WEED, and ETH from correct predictions, referrals, and protocol activity.</p>
            </div>
          </div>
        </div>

        <CoinInfo />
      </div>
    </header>
  );
}
