'use client';
import './globals.css';
import React,{useState, useEffect} from 'react';
import {useAccount} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Referral from './components/referral';
import Data from './data.json';
import Swaps from './components/swaps';
import Memes from './components/memes';
import Predictions from './components/predictions';
import Rewards from './components/rewards';
import NavBar from './components/navbar';
import CoinInfo from './components/coininfo';
import petalLogo from './assets/img/petal.png';
import opensea from './assets/img/opensea.png';
import x from './assets/img/x.webp';
import etherscan from './assets/img/etherscan.png';
import magiceden from './assets/img/magiceden.png';
import discord from './assets/img/discord.webp';
import { sdk } from '@farcaster/miniapp-sdk';

export default function Home() {

    useEffect(() => {
        sdk.actions.ready();
    }, []);

  const {open} = useAppKit();
  const { isConnected } = useAccount();
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState(0);



   useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 960) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Set the initial value based on the current window size
    handleResize();

    // Add the event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


	return(
	<>
      <header>
      <NavBar />
  <div className="homeHeader">
    <span className="heading">
    <h2>WELCOME TO PETAL FINANCE</h2>
    <p>V2 DeFi and Meme Market</p>
    {!isConnected && <><p className="pointer" onClick={() => open()}>CONNECT TO START</p></>}
    <img alt="petalLogo" src={petalLogo.src} /></span>
      {!isMobile && <>
      <CoinInfo /></>}
    {isConnected ? <>
    <div className="menuButtons">
      <p className={`${tab === 0 && "tealActive botBor"}`} onClick={() => setTab(0)}>Referral</p>
      <p className={`${tab === 1 && "tealActive botBor"}`}  onClick={() => setTab(1)}>Swap</p>
      <p className={`${tab === 2 && "tealActive botBor"}`}  onClick={() => setTab(2)}>Memes</p>
      <p className={`${tab === 3 && "tealActive botBor"}`}  onClick={() => setTab(3)}>Prediction</p>
      <p className={`${tab === 4 && "tealActive botBor"}`}  onClick={() => setTab(4)}>Rewards</p></div>
    <div className="refDiv">
    {tab === 0 && <><Referral /></>}
    {tab === 1 && <><Swaps /></>}
    {tab === 2 && <><Memes /></>}
    {tab === 3 && <><Predictions /></>}
    {tab === 4 && <><Rewards /></>}
    </div>
    </>:
    <></>}
       {isMobile && <>
      <CoinInfo /></>}
  </div>
      </header>
      <footer>
          <span className="community"><p className="socials"><a href="https://discord.gg/TeQkftUA64" target="_blank" rel="noopener noreferrer"><img alt="opensea" width="25" src={discord.src} /></a><a href="https://opensea.io/collection/virtuesekai" target="_blank" rel="noopener noreferrer"><img alt="opensea" width="25" src={opensea.src} /></a><a href="https://x.com/virtuedefi" target="_blank" rel="noopener noreferrer"><img alt="x" width="25" src={x.src} /></a><a href={'https://basescan.org/address/'+String(Data.petalFactory)+'#code'} target="_blank" rel="noopener noreferrer"><img alt="basescan" width="25" src={etherscan.src} /></a><a href="https://magiceden.io/collections/base/0xf7805f4f52f4d9c290280dd398ac2b8b9dde6df5" target="_blank" rel="noopener noreferrer"><img alt="magiceden" width="25" src={magiceden.src} /></a></p></span>
      </footer>
	</>	
	);
	}