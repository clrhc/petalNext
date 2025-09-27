'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import Data from '../data.json';
import {ethers} from 'ethers';
import { readContracts } from '@wagmi/core';
import { config } from './wagmiConfig';
import {Abi} from 'viem';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import factory from '../abis/factory.json';
import token from '../abis/token.json';
import uniswapRouter from '../abis/uniswapRouter.json';
import uniswapFactory from '../abis/uniswapFactory.json';


export default function SwapMemes({tokenAddress}: { tokenAddress: string; }) {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [weedBalance, setWeedBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenAllowance, setTokenAllowance] = useState(0);
  const [weedAllowance, setWeedAllowance] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [sellValue, setSellValue] = useState(0);
  const [swapState, setSwapState] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const [tokenPair, setTokenPair] = useState("");
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  type Address = `0x${string}`;

  useEffect(() =>{
    async function init(){

if (isConnected) {
   try{
       const data = await readContracts(config, {
  contracts: [
    {
      address: Data.petalFactory as Address,
      abi: factory.abi as Abi,
      functionName: 'balanceOf',
      args: [address],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi as Abi,
      functionName: 'balanceOf',
      args: [address],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi as Abi,
      functionName: 'allowance',
      args: [address,Data.uniswapRouter as Address],
    },
    {
      address: Data.petalFactory as Address,
      abi: factory.abi as Abi,
      functionName: 'allowance',
      args: [address, Data.uniswapRouter as Address],
    },
    {
      address: Data.uniswapRouter as Address,
      abi: uniswapRouter.abi as Abi,
      functionName: 'getAmountsOut',
      args: [ethers.parseUnits(String(1)),[tokenAddress as Address,Data.petalFactory as Address]],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi as Abi,
      functionName: 'name',
      args: [],
    },
    {
      address: Data.uniswapFactory as Address,
      abi: uniswapFactory.abi as Abi,
      functionName: 'getPair',
      args: [tokenAddress as Address,Data.petalFactory as Address],
    },
  ],
  allowFailure: false,
});

  const [
    weedBalance_,
    tokenBalance_,
    tokenAllowance_,
    weedAllowance_,
    tokenPrice_,
    tokenName_,
    tokenPair_
  ] = data as [
  bigint,            // weedBalance_
  bigint,            // tokenBalance_
  bigint,            // tokenAllowance_
  bigint,            // weedAllowance_
  bigint[],          // tokenPrice_ (array from getAmountsOut)
  string,            // tokenName_
  Address            // tokenPair_
];
  
  setWeedBalance(weedBalance_);
  setTokenBalance(tokenBalance_);
  setWeedAllowance(weedAllowance_);
  setTokenAllowance(tokenAllowance_);
  setTokenPrice(tokenPrice_[1]);
  setTokenName(tokenName_);
  setTokenPair(String(tokenPair_));
  }catch{};
}
}

    const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });

    const approveRouter = async () => {
      if(networkId === baseId){
        await writeContract({
          abi: token.abi,
          address: tokenAddress as Address,
          functionName: 'approve',
          args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
        });
      }
    }

        const buyRouter = async () => {
  if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi,
        address: Data.uniswapRouter as Address,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(buyValue)), ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18),18), [Data.petalFactory, tokenAddress], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        });
      }
    };

     const sellRouter = async () => {
  if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi,
        address: Data.uniswapRouter as Address,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18),18), [tokenAddress, Data.petalFactory], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        });
      }
    };

  return(
  <>
<div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy {tokenName}</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell {tokenName}</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSlippage(Number(e.target.value))} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
    <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    WEED
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 WEED" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setBuyValue(Number(e.target.value))} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(weedBalance), 18)).toFixed(2)} WEED</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    {tokenName}
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder={`0 ${tokenName}`} value={String(Number(buyValue / (Number(tokenPrice) / 1e18)).toFixed(4))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(tokenBalance), 18)).toFixed(2)} {tokenName}</p>
    {buyValue > 0 ? <>
    {buyValue*10**18 > weedAllowance ? <><p onClick={() => approveRouter()} className="enterButton pointer">Approve</p></>:<><p onClick={() => buyRouter()} className="enterButton pointer">Buy</p></>}
    </>:<></>}<p style={{textAlign: 'center'}}>1 WEED = {Number(1/Number(Number(tokenPrice) / 10 ** 18)).toFixed(4)} {tokenName}</p>
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    {tokenName}
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder={`0 ${tokenName}`} onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSellValue(Number(e.target.value))} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(tokenBalance), 18)).toFixed(2)} {tokenName}</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    WEED
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 WEED" value={String(Number(sellValue * (Number(tokenPrice) / 1e18)).toFixed(4))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(weedBalance), 18)).toFixed(2)} WEED</p>
    {sellValue > 0 ? <>
    {sellValue*10**18 > tokenAllowance ? <><p onClick={() => approveRouter()} className="enterButton pointer">Approve</p></>:<><p onClick={() => sellRouter()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 {tokenName} = {Number(Number(tokenPrice) / 10 ** 18).toFixed(10)} WEED</p>
       </>}<div id="dexscreener-embed"><iframe src={`https://dexscreener.com/base/${tokenPair}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTimeframesToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`}></iframe></div>
        </> 
  );
  }