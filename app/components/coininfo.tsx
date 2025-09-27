'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {readContracts, watchBlockNumber} from '@wagmi/core';
import {ethers} from 'ethers';
import {Abi, Address, parseUnits} from 'viem';
import Data from '../data.json';
import factory from '../abis/factory.json';
import uniswapRouter from '../abis/uniswapRouter.json';
import {config} from './wagmiConfig';

export default function CoinInfo(){

  const [tokenPrice, setTokenPrice] = useState(0);
  const [petalLaunched, setPetalLaunched] = useState(false);
  const [ethIn, setEthIn] = useState(0);

   useEffect(() => {
  let unsub: (() => void) | null = null;

  async function init() {
    try {
      const data = await readContracts(config, {
        contracts: [
          {
            address: Data.petalFactory as Address,
            abi: factory.abi as Abi,
            functionName: "tokenLaunched",
            args: [Data.petalToken as Address],
          },
          {
            address: Data.petalFactory as Address,
            abi: factory.abi as Abi,
            functionName: "bondingCurves",
            args: [Data.petalToken as Address],
          },
          {
            address: Data.uniswapRouter as Address,
            abi: uniswapRouter.abi as Abi,
            functionName: "getAmountsOut",
            args: [parseUnits("1", 18), [Data.petalToken, Data.WETH]],
          },
        ],
        allowFailure: true,
      });

      const petalLaunched_ = data[0]?.result as boolean;
      const petalCurve_ = data[1]?.result as bigint[];
      const petalEthPrice_ = data[2]?.result as bigint[];

      setPetalLaunched(petalLaunched_);

      if (petalLaunched_) {
        setTokenPrice(Number(petalEthPrice_?.[1] ?? 0n));
      } else {
        setTokenPrice(Number(petalCurve_?.[6] ?? 0n));
        setEthIn(Number(petalCurve_?.[2] ?? 0n));
      }
    } catch (err) {
      console.error("readContracts failed:", err);
    }
  }

  // 1️⃣ Run once on mount
  init();

  // 2️⃣ Subscribe to new blocks and re-run
  unsub = watchBlockNumber(config, {
    listen: true,
    onBlockNumber: () => {
      void init();
    },
  });

  // 3️⃣ Clean up subscription on unmount
  return () => {
    if (unsub) unsub();
  };
}, [config, Data.petalFactory, Data.petalToken, Data.uniswapRouter]);

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