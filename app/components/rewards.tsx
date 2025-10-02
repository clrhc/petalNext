'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import Data from '../data.json';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from './wagmiConfig';
import {Abi, Address} from 'viem';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import rewards from '../abis/rewards.json';
import nft from '../abis/nft.json';

 export default function Rewards(){

     const { address, isConnected } = useAccount();
     const [baseId] = useState(8453);
     const networkId = useChainId();
     const { writeContract } = useWriteContract();
     const [rewardsAvailable, setRewardsAvailable] = useState(0);
     const [nftBalance, setNftBalance] = useState(0);

useEffect(() => {
  if (!isConnected || !address) return;

  let unwatch: (() => void) | null = null;
  let running = false; 

  const init = async () => {
    if (running) return;
    running = true;
    try {
      const data = await readContracts(config, {
        contracts: [
          {
            address: Data.virtueNFT as Address,
            abi: nft.abi as Abi,
            functionName: 'balanceOf',
            args: [address as Address],
          },
          {
            address: Data.petalRewards as Address,
            abi: rewards.abi as Abi,
            functionName: 'checkRewards',
            args: [address as Address],
          },
        ],
        allowFailure: false,
      });

      const [nftBalance_, rewards_] = data as [bigint, bigint];

      setNftBalance(Number(nftBalance_));
      setRewardsAvailable(Number(rewards_));
    } catch {
    } finally {
      running = false;
    }
  };

  void init();

  unwatch = watchBlockNumber(config, {
    onBlockNumber: () => { void init(); },
  });

  return () => {
    if (unwatch) unwatch();
  };
}, [isConnected, address, config, Data.virtueNFT, Data.petalRewards]);


   const claimRewards = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: rewards.abi,
        address: Data.petalRewards as Address,
        functionName: 'claimRewards',
      });
    }
  }

 return(
 <>
 <div className="refInfo">
      <h3>Collect XP for future rewards!</h3>
      <h3>Limited Mints available at <a className="virtueLink" href="https://virtue.wtf" rel="noopener noreferrer" target="_blank" >Virtue.wtf</a></h3>
      <h3>Number of VirtueSekai Owned: {nftBalance}</h3>
      <h3>Rewards available:</h3>
      <h3>{rewardsAvailable} PETAL</h3>
      <h3>{rewardsAvailable*30} WEED</h3>
      <h3>{rewardsAvailable*30} VIRTUE</h3>
      <p onClick={() => claimRewards()} className="enterButton pointer">Claim</p>
      <p>1000 PETAL, 30K WEED, 30K VIRTUE per unclaimed NFT</p>
    </div>
</>
);
}