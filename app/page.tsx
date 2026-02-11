'use client';
import './globals.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Referral from './components/petal/referral';
import Data from './data.json';
import Swaps from './components/petal/swaps';
import Memes from './components/petal/memes';
import Predictions from './components/petal/predictions';
import Rewards from './components/petal/rewards';
import petalLogo from './assets/img/petal.png';
import NavBarPetal from './components/petal/navbar';
import CoinInfo from './components/petal/coininfo';
import opensea from './assets/img/opensea.png';
import x from './assets/img/x.webp';
import etherscan from './assets/img/etherscan.png';
import magiceden from './assets/img/magiceden.png';
import discord from './assets/img/discord.webp';
import { sdk } from '@farcaster/miniapp-sdk';

const TAB_LABELS = ['Referral', 'Swap', 'Memes', 'Predict', 'Rewards'] as const;

export default function Home() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const [tab, setTab] = useState(1);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      {/* Floating particles background */}
      <div className="particlesBg">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      <header>
        <NavBarPetal />

        <div className="homeHeader">
          {/* Hero Section */}
          <span className="heading">
            <h2>PETAL PROTOCOL</h2>
            <p>
              Trade illiquid meme coins through bonding curve pools, predict crypto prices
              with on-chain markets, and earn rewards — all powered by PETAL liquidity on Base.
            </p>
            {!isConnected && (
              <p className="pointer" onClick={() => open()}>
                Launch App
              </p>
            )}
            <Image alt="Petal Protocol" width={80} height={80} src={petalLogo} />
          </span>

          {/* Feature Cards - always visible */}
          <div className="featureGrid">
            <div className="featureCard">
              <span className="featureIcon">&#x1F331;</span>
              <h3>Bonding Curve DEX</h3>
              <p>Buy and sell PETAL through an automated bonding curve. Price increases with demand — early buyers benefit most.</p>
            </div>
            <div className="featureCard">
              <span className="featureIcon">&#x1F52E;</span>
              <h3>Prediction Markets</h3>
              <p>Bid on 8 crypto pairs powered by Chainlink oracles. Predict higher or lower — win PETAL, WEED, and ETH.</p>
            </div>
            <div className="featureCard">
              <span className="featureIcon">&#x1F680;</span>
              <h3>Meme Pools</h3>
              <p>Trade illiquid meme tokens in pools launched using PETAL as base liquidity. CATGIRL, FEMBOY, and more.</p>
            </div>
          </div>

          {/* Protocol Info */}
          <CoinInfo />

          {/* App Interface */}
          {isConnected && (
            <>
              <div className="menuButtons">
                {TAB_LABELS.map((label, i) => (
                  <p
                    key={label}
                    className={tab === i ? "tealActive botBor" : ""}
                    onClick={() => setTab(i)}
                  >
                    {label}
                  </p>
                ))}
              </div>

              <div className="refDiv">
                {tab === 0 && <Referral />}
                {tab === 1 && <Swaps />}
                {tab === 2 && <Memes />}
                {tab === 3 && <Predictions />}
                {tab === 4 && <Rewards />}
              </div>
            </>
          )}
        </div>
      </header>

      <footer>
        <span className="community">
          <p className="socials">
            <a href="https://discord.gg/TeQkftUA64" target="_blank" rel="noopener noreferrer">
              <Image alt="Discord" width={22} src={discord} />
            </a>
            <a href="https://opensea.io/collection/virtuesekai" target="_blank" rel="noopener noreferrer">
              <Image alt="OpenSea" width={22} src={opensea} />
            </a>
            <a href="https://x.com/virtuedefi" target="_blank" rel="noopener noreferrer">
              <Image alt="X" width={22} src={x} />
            </a>
            <a href={'https://basescan.org/address/' + String(Data.petalFactory) + '#code'} target="_blank" rel="noopener noreferrer">
              <Image alt="Basescan" width={22} src={etherscan} />
            </a>
            <a href="https://magiceden.io/collections/base/0xf7805f4f52f4d9c290280dd398ac2b8b9dde6df5" target="_blank" rel="noopener noreferrer">
              <Image alt="Magic Eden" width={22} src={magiceden} />
            </a>
          </p>
        </span>
      </footer>
    </>
  );
}
