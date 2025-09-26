'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {useAccount} from "wagmi";
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
  const provider = new ethers.JsonRpcProvider('https://base.drpc.org');
  const referralContract = new ethers.Contract(Data.referralAddress, referral.abi, provider);
  const [hoverWallet, setHoverWallet] = useState(false);

    useEffect(() =>{
    async function init(){

if (isConnected) {
    try{
  const userInfo_       = await referralContract.userInfo(address);
    setUserInfo([
    Number(userInfo_[0]),
    Number(userInfo_[1]),
    String(userInfo_[2]),
    String(userInfo_[3]),
    String(address),
  ]);}catch{};

}
}
const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });

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
  <div className="nav"><span className="logoSpan"><img alt="petalLogo" className="logo" src={petalLogo.src} /><h2 className="logoText">PETAL</h2></span>{userInfo.length === 5 && address === userInfo[3] ? <><span className="xpNav"><p>{userInfo[1]}</p><img alt="xpCoin" src={xpCoin.src} /></span></>:<></>}<span className="walletButtons pointer" id="walletSpan" onClick={() => open()} onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><Wallet /></span>
    {userInfo.length === 5 && address === userInfo[3] ? <><span className="userStats" id="displayStat" onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><p>ID:
    {userInfo[0] < 10 && " 00"}
    {userInfo[0] >= 10 && <>{userInfo[0] < 100 ? <>{String(" 0")}</>:<></>}</>}
    {userInfo[0]}</p>
    <p>Ref: {userInfo[2]}</p></span>
    </>:<></>}</div>
    </>
    );
  }