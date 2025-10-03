'use client'
import React,{useState, useEffect} from 'react';
import '../../virtue.css';
import Image from 'next/image';
import Data from '../../data.json';
import {ethers} from 'ethers';
import { useAppKit } from "@reown/appkit/react";
import { readContracts, watchBlockNumber, getBalance } from '@wagmi/core';
import { type Address, type Abi, formatUnits } from 'viem';
import { config } from '../config/wagmiConfig';
import nft from '../../abis/nft.json';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import vDay from '../../assets/img/SekaiVDay.png';
import heartBG from '../../assets/img/heartBG.png';
import loadingGif from '../../assets/img/loading.gif';

 export default function MintPage(){

  const {open} = useAppKit();
  const { address, isConnected } = useAccount();
  const [totalSupply, setTotalSupply] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [errorMade, setErrorMade] = useState(false);
  const [mintLive, setMintLive] = useState(false);
  const [sliderValue, setSliderValue] = useState(3);
  const [claimed, setClaimed] = useState(0);
  const [baseId] = useState(8453);
  const networkId = useChainId();
  const { data: hash, writeContract, isPending } = useWriteContract();

useEffect(() => {

  let unwatch: (() => void) | null = null;
  let running = false;

  const init = async () => {
    if (running) return;
    running = true;

    try {
      const pub = await readContracts(config, {
        allowFailure: true,
        contracts: [
          {
            address: Data.virtueNFT as Address,
            abi: nft.abi as Abi,
            functionName: 'isMintLive',
          },
          {
            address: Data.virtueNFT as Address,
            abi: nft.abi as Abi,
            functionName: 'publicMints',
          },
          {
            address: Data.virtueNFT as Address,
            abi: nft.abi as Abi,
            functionName: 'minted',
          },
        ],
      });

      const mintLive_ =
        pub[0]?.status === 'success' ? Boolean(pub[0].result as boolean) : false;

      const publicMints_ =
        pub[1]?.status === 'success'
          ? Number(pub[1].result as bigint)
          : pub[2]?.status === 'success'
          ? Number(pub[2].result as bigint)
          : 0;

      setMintLive(mintLive_);
      setTotalSupply(publicMints_);

      if (isConnected && address) {
        const user = await readContracts(config, {
          allowFailure: true,
          contracts: [
            {
              address:  Data.virtueNFT as Address,
              abi: nft.abi as Abi,
              functionName: 'claims',
              args: [address as Address],
            },
          ],
        });

        const claimsCount =
          user[0]?.status === 'success' ? Number(user[0].result as bigint) : 0;

        const bal = await getBalance(config, {
          address: address as Address,
        });
        const userEth = Number(formatUnits(bal.value, 18)).toFixed(4);

        setClaimed(claimsCount);
        setUserBalance(userEth);
      } else {
        setClaimed(0);
        setUserBalance('0.0000');
      }
    } catch (err) {
      console.error('reads failed:', err);
    } finally {
      running = false;
    }
  };

  void init();

  unwatch = watchBlockNumber(config, {
    onBlockNumber: () => { void init(); },
    onError: () => {},
  });

  return () => {
    if (unwatch) unwatch();
  };
}, [
  config,
  Data.virtueNFT,       
  nft?.abi,             
  Boolean(isConnected),  
  address ?? null,   
]);

  const mintNFT = async () => {
    setErrorMade(false);
    if(networkId === baseId){
    try{
     await writeContract({ 
          address: Data.virtueNFT as Address,
          abi: nft.abi as Abi,
          functionName: 'paidMint',
          args: [sliderValue],
          value: ethers.parseUnits(String(0.004*sliderValue), 18),
       });}catch(error){if(error){setErrorMade(true);}};
    }}

 return(
 <>
   <div className="virtueHeader">
        <h2>VirtueSekai Mint</h2>
        <h3>Join the Virtue ecosystem combining art and finance,</h3>
        <h3>each NFT comes with 30,000 Tokens of Virtue!</h3>
        <h3>Claimable on launch of our DeFi systems that give back to the community!</h3>
  <Image alt="succubus" width="300" src={vDay} />
        {mintLive ? <><h3 style={{color: 'green'}}>MINT IS LIVE</h3></>:<><h3 style={{color: 'red'}}>MINT NOT LIVE</h3></>}
        <h3>Retry or Set Gas Higher If There is a Mint Issue</h3>
        <h3>0.004 ETH each</h3>
        <h3>WL: 4555 / 4555</h3>
        <h3>Public: {totalSupply} / 1000</h3>
        <div className="slidecontainer">
        {isConnected ? <>{claimed < 30 ? <><p>Mint Quantity</p>
  <input type="range" min="1" max="30" className="slider" value={sliderValue} onChange={(e) => setSliderValue(e.target.value)} />
  <p>{sliderValue} {sliderValue < 2 ? <>Mint</>:<>Mints</>} for {Number(sliderValue * 0.004).toFixed(3)} ETH</p></>:<></>}
  {isPending ? <><p className="mintButton" style={{ backgroundImage: `url(${heartBG.src})` }}><Image alt="loading" width="30" src={loadingGif} /></p></>:<>{claimed < 30 ? <><p onClick={() => mintNFT()}className="mintButton" style={{ backgroundImage: `url(${heartBG.src})` }}>MINT</p></>:<><p>Mint Limit Reached For This Wallet</p></>}</>}
  {hash ? <><p className="txLink"><a href={'https://basescan.org/tx/'+String(hash)} target="_blank" rel="noopener noreferrer">YOUR MINT TRANSACTION CAN BE FOUND HERE</a></p></>:<></>}
  {errorMade ? <><p className="errorText">YOUR TX MAY OF RAN OUT OF GAS OR BEEN CANCELLED</p></>:<></>}
  <p>You&apos;ve Claimed {claimed} of 30 For This Wallet</p>
  <p>Balance: {userBalance} ETH</p>
</>:<>
  <p className="mintButton" style={{ backgroundImage: `url(${heartBG.src})` }} onClick={() => open()}>CONNECT</p>
</>}</div>
</div>
</>
);
}