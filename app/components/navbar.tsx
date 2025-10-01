'use client';
import '../globals.css';
import Image from 'next/image';
import React,{useState, useEffect} from 'react';
import {readContracts, watchBlockNumber} from '@wagmi/core';
import {Abi, Address} from 'viem';
import {useAccount} from "wagmi";
import {config} from './wagmiConfig';
import { useAppKit } from "@reown/appkit/react";
import referral from '../abis/referral.json';
import Wallet from '../wallet';
import Data from '../data.json';
import petalLogo from '../assets/img/petal.png';
import xpCoin from '../assets/img/xpCoin.png';

  export default function NavBar(){

  const { address, isConnected } = useAccount();
  const {open} = useAppKit();
  const [userInfo, setUserInfo] = useState<[number, number, string, string, string]>([0, 0, '', '', '']);
  const [hoverWallet, setHoverWallet] = useState(false);

    useEffect(() => {
  if (!isConnected || !address) return;

  let unwatch: (() => void) | null = null;
  let running = false; // prevent overlapping calls

  const init = async () => {
    if (running) return;
    running = true;
    try {
      const data = await readContracts(config, {
        contracts: [
          {
            address: Data.referralAddress as Address,
            abi: referral.abi as Abi,
            functionName: 'userInfo',
            args: [address as Address],
          },
        ],
        allowFailure: false, // returns raw decoded values
      });

      const userInfo_ = data[0] as [bigint, bigint, string, string];

      setUserInfo([
        Number(userInfo_[0]),
        Number(userInfo_[1]),
        String(userInfo_[2]),
        String(userInfo_[3]),
        String(address),
      ]);
    } catch {
      // optional: console.error(err);
    } finally {
      running = false;
    }
  };

  // initial load
  void init();

  // refresh on every new block
  unwatch = watchBlockNumber(config, {
    onBlockNumber: () => {
      void init();
    },
    onError: () => {},
    // If you want polling instead of WS, uncomment:
    // poll: true,
    // pollingInterval: 4000,
  });

  // cleanup
  return () => {
    if (unwatch) unwatch();
  };
}, [isConnected, address, config, Data.referralAddress]);

useEffect(() => {
  const displayStat = document.getElementById('displayStat');
  const walletSpan = document.getElementById('walletSpan');

  if (!walletSpan) return;

  if (userInfo.length === 5 && address === userInfo[3]) {
    if (!displayStat) return;

    if (hoverWallet) {
      displayStat.style.display = 'initial';
      walletSpan.style.borderBottom = 'transparent';
      walletSpan.style.borderBottomLeftRadius = '0px';
      walletSpan.style.borderBottomRightRadius = '0px';
    } else {
      displayStat.style.display = 'none';
      displayStat.style.border = '2px solid rgba(0, 255, 255, 0.8)';
      displayStat.style.borderTop = 'transparent';
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.1)';
      walletSpan.style.borderBottomLeftRadius = '12px';
      walletSpan.style.borderBottomRightRadius = '12px';
    }
  } else {
    if (hoverWallet) {
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.8)';
    } else {
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.1)';
      walletSpan.style.borderBottomLeftRadius = '12px';
      walletSpan.style.borderBottomRightRadius = '12px';
    }
  }
}, [userInfo, address, hoverWallet]);

   return(
    <>
    {isConnected ? <>{userInfo.length === 5 ? <>
  {userInfo[4] !== address && <><div id="loading-bar"></div></>}
  </>:<>
  <div id="loading-bar"></div>
  </>}</>:<></>}
  <div className="nav"><span className="logoSpan"><Image alt="petalLogo" className="logo" width="45" src={petalLogo} /><h2 className="logoText">PETAL</h2></span>{userInfo.length === 5 && address === userInfo[3] ? <><span className="xpNav"><p>{userInfo[1]}</p><Image alt="xpCoin" width="30" src={xpCoin} /></span></>:<></>}<span className="walletButtons pointer" id="walletSpan" onClick={() => open()} onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><Wallet /></span>
    {userInfo.length === 5 && address === userInfo[3] ? <><span className="userStats" id="displayStat" onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><p>ID:
    {userInfo[0] < 10 && " 00"}
    {userInfo[0] >= 10 && <>{userInfo[0] < 100 ? <>{String(" 0")}</>:<></>}</>}
    {userInfo[0]}</p>
    <p>Ref: {userInfo[2]}</p></span>
    </>:<></>}</div>
    </>
    );
  }