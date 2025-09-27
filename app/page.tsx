'use client';
import './globals.css';
import React,{useState, useEffect} from 'react';
import {useAccount} from "wagmi";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAppKit } from "@reown/appkit/react";
import Referral from './components/referral';
import Swaps from './components/swaps';
import Memes from './components/memes';
import Predictions from './components/predictions';
import Rewards from './components/rewards';
import NavBar from './components/navbar';
import CoinInfo from './components/coininfo';
import petalLogo from './assets/img/petal.png';



export default function Home() {

useEffect(() => {
  async function fetchData() {
    await fetch('/api/blast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1
      }),
    });
  }
  fetchData();
}, []);

  const { setFrameReady, isFrameReady } = useMiniKit();
  const {open} = useAppKit();
  const { isConnected } = useAccount();
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState(0);

   useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);


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
    <span style={{ display: tab === 0 ? 'block' : 'none' }}><Referral /></span>
    <span style={{ display: tab === 1 ? 'block' : 'none' }}><Swaps /></span>
    <span style={{ display: tab === 2 ? 'block' : 'none' }}><Memes /></span>
    <span style={{ display: tab === 3 ? 'block' : 'none' }}><Predictions /></span>
    <span style={{ display: tab === 4 ? 'block' : 'none' }}><Rewards /></span>
    </div>
    </>:
    <></>}
       {isMobile && <>
      <CoinInfo /></>}
  </div>
      </header>
      <footer>
      </footer>
	</>	
	);
	}