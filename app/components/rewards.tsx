'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import Data from '../data.json';
import {ethers} from 'ethers';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import rewards from '../abis/rewards.json';
import nft from '../abis/nft.json';

 export default function Rewards(){

     const { address, isConnected } = useAccount();
     const [baseId] = useState(8453);
     const networkId = useChainId();
     const { writeContract } = useWriteContract();
     const provider = new ethers.JsonRpcProvider('https://base.drpc.org');
     const [rewardsAvailable, setRewardsAvailable] = useState(0);
     const [nftBalance, setNftBalance] = useState(0);
     const rewardsContract = new ethers.Contract(Data.petalRewards, rewards.abi, provider);
     const sekaiContract = new ethers.Contract(Data.virtueNFT, nft.abi, provider);
     type Address = `0x${string}`;

     useEffect(() =>{
    async function init(){
     if(isConnected){
  try{
  const nftBalancePromise  = sekaiContract.balanceOf(address);
  const rewardsPromise = rewardsContract.checkRewards(address);
    const [
    nftBalance_,
    rewards_
  ] = await Promise.all([
    nftBalancePromise,
    rewardsPromise
  ]);

  setNftBalance(Number(nftBalance_));
  setRewardsAvailable(Number(rewards_));}catch{};
}
}

    const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });


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