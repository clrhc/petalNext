'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import Data from '../data.json';
import {ethers} from 'ethers';
import { readContracts } from '@wagmi/core';
import { config } from './wagmiConfig';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import factory from '../abis/factory.json';
import token from '../abis/token.json';
import uniswapRouter from '../abis/uniswapRouter.json';


export default function SwapCoins({tokenAddress, factoryAddress}: { tokenAddress: string; factoryAddress: string }) {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [tokenLaunched, setTokenLaunched] = useState(false);
  const [ethIn, setEthIn] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenAllowance, setTokenAllowance] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [sellValue, setSellValue] = useState(0);
  const [swapState, setSwapState] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const provider = new ethers.JsonRpcProvider('https://base-mainnet.public.blastapi.io');
  const uniswapRouterContract = new ethers.Contract(Data.uniswapRouter, uniswapRouter.abi, provider);
  type Address = `0x${string}`;

  useEffect(() =>{
    async function init(){

if (isConnected) {
   try{
     const data = await readContracts(config, {
  contracts: [
    {
      address: tokenAddress as Address,
      abi: token.abi,
      functionName: 'balanceOf',
      args: [address],
    },
    {
      address: factoryAddress as Address,
      abi: factory.abi,
      functionName: 'tokenLaunched',
      args: [tokenAddress as Address],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi,
      functionName: 'allowance',
      args: [address,factoryAddress as Address],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi,
      functionName: 'allowance',
      args: [address, Data.uniswapRouter as Address],
    },
    {
      address: factoryAddress as Address,
      abi: factory.abi,
      functionName: 'bondingCurves',
      args: [tokenAddress as Address],
    },
    {
      address: tokenAddress as Address,
      abi: token.abi,
      functionName: 'name',
      args: [],
    },
  ],
  allowFailure: false,
});
  const ethBalance_ = await provider.getBalance(address!);
  const [
    tokenBalance_,
    tokenLaunched_,
    tokenAllowance_,
    tokenRouterAllowance_,
    tokenCurve_,
    tokenName_
  ] = data;
  setTokenLaunched(tokenLaunched_);
  if(tokenLaunched_){
  const tokenEthPrice_ = await uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[tokenAddress,Data.WETH]);
  setTokenPrice(tokenEthPrice_[1]);
  setTokenAllowance(tokenRouterAllowance_);
  }else{
  setTokenPrice(tokenCurve_[6]);
  setEthIn(tokenCurve_[2]);
  setTokenAllowance(tokenAllowance_);
  }
  setTokenName(String(tokenName_));
  setEthBalance(Number(ethBalance_));
  setTokenBalance(tokenBalance_);
  }catch{};
}
}

    const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });

   const approveFactory = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: tokenAddress as Address,
        functionName: 'approve',
        args: [factoryAddress, ethers.parseUnits(String(100000000))],
      });
    }
  }

      const buyFactory = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: factoryAddress as Address,
        functionName: 'buy',
        args: [tokenAddress, ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18),18), address],
        value: ethers.parseUnits(String(buyValue)),
      });
    }
  }

    const sellFactory = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: factoryAddress as Address,
        functionName: 'sell',
        args: [tokenAddress, ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18),18), address],
      });
    }
  }

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

    const sellRouter = async () => {
      if(networkId === baseId){
        await writeContract({
          abi: uniswapRouter.abi,
          address: Data.uniswapRouter as Address,
          functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18),18), [tokenAddress, Data.WETH], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        })
      }
    }

      const buyRouter = async () => {
      if(networkId === baseId){
        await writeContract({
          abi: uniswapRouter.abi,
          address: Data.uniswapRouter as Address,
          functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18),18), [Data.WETH, tokenAddress], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
          value: ethers.parseUnits(String(buyValue)),
        })
      }
    }

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
    ETH
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setBuyValue(Number(e.target.value))} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
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
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder={`0 ${tokenName}`} value={String(Number(buyValue / (Number(tokenPrice) / 1e18)-((buyValue / (Number(tokenPrice) / 1e18)/100)*3)).toFixed(4))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(tokenBalance), 18)).toFixed(2)} {tokenName}</p>
    {buyValue > 0 ? <><p onClick={() => tokenLaunched ? buyRouter() : buyFactory()} className="enterButton pointer">Buy</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(tokenPrice) / 10 ** 18)).toFixed(4)} {tokenName}</p>
    <p style={{textAlign: 'center'}}>3% Tax</p>
    {!tokenLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
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
    ETH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 ETH" value={String(Number(sellValue * (Number(tokenPrice) / 1e18)-((sellValue * (Number(tokenPrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
    {sellValue > 0 ? <>
    {sellValue*10**18 > tokenAllowance ? <><p onClick={() => tokenLaunched ? approveRouter() : approveFactory()} className="enterButton pointer">Approve</p></>:<><p onClick={() => tokenLaunched ? sellRouter() : sellFactory()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 {tokenName} = {Number(Number(tokenPrice) / 10 ** 18).toFixed(10)} ETH</p>
      <p style={{textAlign: 'center'}}>3% Tax</p>
      {!tokenLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      </>}
  </> 
  );
  }
