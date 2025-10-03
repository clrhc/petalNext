'use client';
import '../../globals.css';
import React,{useState, useEffect} from 'react';
import {readContracts, watchBlockNumber} from '@wagmi/core';
import {ethers} from 'ethers';
import {Abi, Address, parseUnits} from 'viem';
import Data from '../../data.json';
import factory from '../../abis/factory.json';
import uniswapRouter from '../../abis/uniswapRouter.json';
import {config} from '../config/wagmiConfig';

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
            functionName: 'tokenLaunched',
            args: [Data.petalToken as Address],
          },
          {
            address: Data.petalFactory as Address,
            abi: factory.abi as Abi,
            functionName: 'bondingCurves',
            args: [Data.petalToken as Address],
          },
          {
            address: Data.uniswapRouter as Address,
            abi: uniswapRouter.abi as Abi,
            functionName: 'getAmountsOut',
            args: [parseUnits('1', 18), [Data.petalToken as Address, Data.WETH as Address]],
          },
        ],
        allowFailure: true,
      });

      const petalLaunched_ = data[0]?.status === 'success' ? (data[0].result as boolean) : false;
      const petalCurve_    = data[1]?.status === 'success' ? (data[1].result as readonly bigint[]) : undefined;
      const petalEthPrice_ = data[2]?.status === 'success' ? (data[2].result as readonly bigint[]) : undefined;

      setPetalLaunched(petalLaunched_);

      if (petalLaunched_) {
        setTokenPrice(Number(petalEthPrice_?.[1] ?? 0n));
      } else {
        setTokenPrice(Number(petalCurve_?.[6] ?? 0n));
        setEthIn(Number(petalCurve_?.[2] ?? 0n));
      }
    } catch (err) {
      console.error('readContracts failed:', err);
    }
  }


  void init();


  unsub = watchBlockNumber(config, {
    onBlockNumber: () => { void init(); },
  });


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