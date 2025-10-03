'use client';
import './globals.css';
import Image from 'next/image';
import React,{useState, useEffect} from 'react';
import {useAccount} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import Referral from './components/petal/referral';
import Data from './data.json';
import Swaps from './components/petal/swaps';
import Memes from './components/petal/memes';
import Predictions from './components/petal/predictions';
import Rewards from './components/petal/rewards';
import NavBarPetal from './components/petal/navbar';
import NavBarVirtue from './components/virtue/navbar';
import MintPage from './components/virtue/mintPage';
import CoinInfo from './components/petal/coininfo';
import petalLogo from './assets/img/petal.png';
import virtueLogo from './assets/img/virtue.png';
import opensea from './assets/img/opensea.png';
import x from './assets/img/x.webp';
import etherscan from './assets/img/etherscan.png';
import magiceden from './assets/img/magiceden.png';
import discord from './assets/img/discord.webp';
import { sdk } from '@farcaster/miniapp-sdk';

export default function Home() {

  const {open} = useAppKit();
  const { isConnected } = useAccount();
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
        sdk.actions.ready();
    }, []);

   useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 960) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

	return(
	<>
    <div className="switcher"><Image onClick={() => setPage(0)} alt="petalLogo" width="40" className="pointer" src={petalLogo} /><br/><Image onClick={() => setPage(1)} alt="petalLogo" width="40" className="pointer"  src={virtueLogo} /></div>
      <div className={`${page === 0 ? "bgClassPetal" : "bgClassVirtue"}`}>
      <header>
      {page === 0 && <><NavBarPetal />
  <div className="homeHeader">
    <span className="heading">
    <h2>WELCOME TO PETAL FINANCE</h2>
    <p>V2 DeFi and Meme Market</p>
    {!isConnected && <><p className="pointer" onClick={() => open()}>CONNECT TO START</p></>}
    <Image alt="petalLogo" width={`${isMobile ? "50" : "100"}`} src={petalLogo} /></span>
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
  </div></>}
  {page === 1 && <>
    <NavBarVirtue />
    <MintPage />
  </>}
      </header>
      <footer>
          <span className="community"><p className="socials"><a href="https://discord.gg/TeQkftUA64" target="_blank" rel="noopener noreferrer"><Image alt="opensea" width="25" src={discord} /></a><a href="https://opensea.io/collection/virtuesekai" target="_blank" rel="noopener noreferrer"><Image alt="opensea" width="25" src={opensea} /></a><a href="https://x.com/virtuedefi" target="_blank" rel="noopener noreferrer"><Image alt="x" width="25" src={x} /></a><a href={'https://basescan.org/address/'+String(Data.petalFactory)+'#code'} target="_blank" rel="noopener noreferrer"><Image alt="basescan" width="25" src={etherscan} /></a><a href="https://magiceden.io/collections/base/0xf7805f4f52f4d9c290280dd398ac2b8b9dde6df5" target="_blank" rel="noopener noreferrer"><Image alt="magiceden" width="25" src={magiceden} /></a></p></span>
      </footer>
    </div>
	</>	
	);
	}