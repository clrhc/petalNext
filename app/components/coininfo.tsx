'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {readContracts} from '@wagmi/core';
import {ethers} from 'ethers';
import {Abi} from 'viem';
import Data from '../data.json';
import factory from '../abis/factory.json';
import uniswapRouter from '../abis/uniswapRouter.json';
import {config} from './wagmiConfig';

export default function CoinInfo(){

  const [tokenPrice, setTokenPrice] = useState(0);
  const provider = new ethers.JsonRpcProvider('https://base-mainnet.public.blastapi.io');
  const uniswapRouterContract = new ethers.Contract(Data.uniswapRouter, uniswapRouter.abi, provider);
  const [petalLaunched, setPetalLaunched] = useState(false);
  const [ethIn, setEthIn] = useState(0);
  type Address = `0x${string}`;

    useEffect(() =>{
    async function init(){
     try{
  const data = await readContracts(config, {
  contracts: [
    {
      address: Data.petalFactory as Address,
      abi: factory.abi as Abi,
      functionName: 'tokenLaunched',
      args: [Data.petalToken as Address],
    },
    {
      address: Data.petalFactory as Address,
      abi: factory.abi as Abi,
      functionName: 'bondingCurves',
      args: [Data.petalToken as Address],
    },
  ],
  allowFailure: false,
});

const [petalLaunched_, petalCurve_] = data;
  setPetalLaunched(petalLaunched_);
  if(petalLaunched_){
  const petalEthPricePromise = await uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[Data.petalToken,Data.WETH]);
  setTokenPrice(petalEthPricePromise[1]);
  }else{
  setTokenPrice(petalCurve_[6]);
  setEthIn(Number(petalCurve_[2]));
  }
  }catch{}
}
const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
});

return(
 <div className="coinInfo">
      <p>Price: {Number(Number(tokenPrice) / 10 ** 18).toFixed(10)} ETH</p>
      {!petalLaunched && <><p>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      <p>Fees go to airdrops prior to bond and WEED liquidity on bonding of PETAL</p>
      <p>Airdrop eligibility is based on PETAL held + volume on meme markets</p>
      <p>Collect WEED to use on our meme markets - based on net positive buys to the PETAL bonding curve</p>
      <p>WEED multiplier 3x of your net PETAL buys</p>
      <p>3% global tax on everything except meme markets</p>
 </div>
 );
}