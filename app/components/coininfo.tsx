'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {ethers} from 'ethers';
import Data from '../data.json';
import factory from '../abis/factory.json';
import uniswapRouter from '../abis/uniswapRouter.json';

export default function CoinInfo(){

  const [tokenPrice, setTokenPrice] = useState(0);
  const provider = new ethers.JsonRpcProvider('https://base-mainnet.infura.io/v3/cc877a2fcbd848a89360422e704227d3');
  const factoryContract = new ethers.Contract(Data.petalFactory, factory.abi, provider);
  const uniswapRouterContract = new ethers.Contract(Data.uniswapRouter, uniswapRouter.abi, provider);
  const [petalLaunched, setPetalLaunched] = useState(0);
  const [ethIn, setEthIn] = useState(0);

    useEffect(() =>{
    async function init(){
     try{
  const petalLaunchedPromise =  factoryContract.tokenLaunched(Data.petalToken);
  const petalCurvePromise = factoryContract.bondingCurves(Data.petalToken);
  const [
    petalLaunched_,
    petalCurve_
  ] = await Promise.all([
    petalLaunchedPromise,
    petalCurvePromise
  ]);
  setPetalLaunched(petalLaunched_);
  if(petalLaunched_){
  const petalEthPricePromise = await uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[Data.petalToken,Data.WETH]);
  setTokenPrice(petalEthPricePromise[1]);
  }else{
  setTokenPrice(petalCurve_[6]);
  setEthIn(Number(petalCurve_[2]));
  }
  }catch{};
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