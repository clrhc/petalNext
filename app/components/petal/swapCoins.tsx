'use client';
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import Data from '../../data.json';
import { ethers } from 'ethers';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { Abi, Address, parseUnits } from 'viem';
import { useAccount, useChainId, useWriteContract } from "wagmi";
import factory from '../../abis/factory.json';
import token from '../../abis/token.json';
import uniswapRouter from '../../abis/uniswapRouter.json';


export default function SwapCoins({ tokenAddress, factoryAddress }: { tokenAddress: string; factoryAddress: string }) {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [tokenLaunched, setTokenLaunched] = useState(false);
  const [ethIn, setEthIn] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [tokenAllowance, setTokenAllowance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [buyValue, setBuyValue] = useState(0);
  const [sellValue, setSellValue] = useState(0);
  const [slippageText, setSlippageText] = useState("1");
  const [buyText, setBuyText] = useState("0");
  const [sellText, setSellText] = useState("0");
  const [swapState, setSwapState] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const provider = new ethers.JsonRpcProvider(
    'https://base-mainnet.public.blastapi.io',
    { chainId: 8453, name: 'base' }
  );

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
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: "balanceOf", args: [address as Address] },
            { address: factoryAddress as Address, abi: factory.abi as Abi, functionName: "tokenLaunched", args: [tokenAddress as Address] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: "allowance", args: [address as Address, factoryAddress as Address] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: "allowance", args: [address as Address, Data.uniswapRouter as Address] },
            { address: factoryAddress as Address, abi: factory.abi as Abi, functionName: "bondingCurves", args: [tokenAddress as Address] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: "name" },
            { address: Data.uniswapRouter as Address, abi: uniswapRouter.abi as Abi, functionName: "getAmountsOut", args: [parseUnits("1", 18), [tokenAddress as Address, Data.WETH as Address]] },
          ],
          allowFailure: true,
        });

        const tokenBalance_ = data[0]?.status === "success" ? (data[0].result as bigint) : 0n;
        const tokenLaunched_ = data[1]?.status === "success" ? (data[1].result as boolean) : false;
        const tokenAllowance_ = data[2]?.status === "success" ? (data[2].result as bigint) : 0n;
        const tokenRouterAllowance_ = data[3]?.status === "success" ? (data[3].result as bigint) : 0n;
        const curveRaw = data[4]?.status === "success" ? data[4].result : undefined;
        const tokenName_ = data[5]?.status === "success" ? (data[5].result as string) : "";
        const amounts = data[6]?.status === "success" ? (data[6].result as readonly bigint[]) : [];

        let spot = 0n;
        let ethInVal = 0n;
        if (curveRaw && Array.isArray(curveRaw) && curveRaw.length >= 7) {
          spot = curveRaw[6] as bigint;
          ethInVal = curveRaw[2] as bigint;
        }

        const ethBalance_ = await provider.getBalance(address!);

        setTokenLaunched(tokenLaunched_);

        if (tokenLaunched_) {
          if (amounts?.[1] && amounts[1] > 0n) setTokenPrice(Number(amounts[1]));
          setTokenAllowance(Number(tokenRouterAllowance_));
        } else {
          if (spot > 0n) setTokenPrice(Number(spot));
          if (ethInVal > 0n) setEthIn(Number(ethInVal));
          setTokenAllowance(Number(tokenAllowance_));
        }

        setTokenName(tokenName_);
        setEthBalance(Number(ethBalance_));
        setTokenBalance(tokenBalance_);
      } catch (err) {
        console.error("readContracts failed:", err);
      } finally {
        running = false;
      }
    };

    void init();

    unwatch = watchBlockNumber(config, {
      onBlockNumber: () => { void init(); },
    });

    return () => { if (unwatch) unwatch(); };
  }, [isConnected, address, config, tokenAddress, factoryAddress, Data.uniswapRouter, Data.WETH]);

  const approveFactory = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: factory.abi, address: tokenAddress as Address, functionName: 'approve',
        args: [factoryAddress, ethers.parseUnits(String(100000000))],
      });
    }
  };

  const buyFactory = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: factory.abi, address: factoryAddress as Address, functionName: 'buy',
        args: [tokenAddress, ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18), 18), address],
        value: ethers.parseUnits(String(buyValue)),
      });
    }
  };

  const sellFactory = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: factory.abi, address: factoryAddress as Address, functionName: 'sell',
        args: [tokenAddress, ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18), 18), address],
      });
    }
  };

  const approveRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: token.abi, address: tokenAddress as Address, functionName: 'approve',
        args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
      });
    }
  };

  const sellRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
        functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18), 18), [tokenAddress, Data.WETH], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
      });
    }
  };

  const buyRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
        functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18), 18), [Data.WETH, tokenAddress], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
        value: ethers.parseUnits(String(buyValue)),
      });
    }
  };

  const numInputProps = (text: string, setText: (v: string) => void, setNum: (v: number) => void) => ({
    type: "text" as const,
    inputMode: "decimal" as const,
    pattern: "^\\d*\\.?\\d*$",
    onWheel: (e: React.WheelEvent<HTMLInputElement>) => (e.target as HTMLInputElement).blur(),
    value: text,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!/^\d*\.?\d*$/.test(v)) return;
      setText(v);
      setNum(v === "" || v === "." ? 0 : Number(v));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isDigit = /^[0-9]$/.test(e.key);
      const isNonZero = /^[1-9]$/.test(e.key);
      const isDot = e.key === ".";
      const nav = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);
      if (isDot && (text === "0" || text === "")) return;
      if (isNonZero && text === "0") { e.preventDefault(); setText(e.key); setNum(Number(e.key)); return; }
      if (e.key === "0" && text === "0") { e.preventDefault(); return; }
      if (!isDigit && !isDot && !nav) e.preventDefault();
    },
    onBlur: () => { if (text === "" || text === ".") { setText("0"); setNum(0); } },
  });

  return (
    <>
      {/* Buy/Sell Toggle + Slippage */}
      <div className="swapButtons">
        <p className={swapState === 0 ? "tealActive" : ""} onClick={() => setSwapState(0)}>
          Buy {tokenName}
        </p>
        <p className={swapState === 1 ? "tealActive" : ""} onClick={() => setSwapState(1)}>
          Sell {tokenName}
        </p>
      </div>

      {/* Slippage Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slippage</span>
        <div style={{ position: 'relative' }}>
          <input
            className="inputText slipBox outlineTeal"
            placeholder="1"
            {...numInputProps(slippageText, setSlippageText, setSlippage)}
          />
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>

      {swapState === 0 ? (
        <>
          {/* Buy: ETH Input */}
          <div style={{ position: 'relative' }}>
            <span className="inputAfter" style={{ position: 'absolute', fontSize: '0.9rem', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>ETH</span>
            <input className="inputBox inputText userText outlineTeal" placeholder="0 ETH" {...numInputProps(buyText, setBuyText, setBuyValue)} />
          </div>
          <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>

          {/* Buy: Token Output */}
          <div style={{ position: 'relative' }}>
            <span className="inputAfter" style={{ position: 'absolute', right: '16px', fontSize: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>{tokenName}</span>
            <input className="inputBox inputText newText outlineTeal" placeholder={`0 ${tokenName}`} value={String(Number(buyValue / (Number(tokenPrice) / 1e18) - ((buyValue / (Number(tokenPrice) / 1e18) / 100) * 3)).toFixed(4))} type="number" readOnly />
          </div>
          <p className="rightSide">Balance: {Number(ethers.formatUnits(tokenBalance, 18)).toFixed(2)} {tokenName}</p>

          {buyValue > 0 && (
            <p onClick={() => tokenLaunched ? buyRouter() : buyFactory()} className="enterButton pointer">Buy</p>
          )}

          <p className="infoText">1 ETH = {Number(1 / Number(Number(tokenPrice) / 10 ** 18)).toFixed(4)} {tokenName}</p>
          <p className="infoText"><span className="taxBadge">3% Tax</span></p>
          {!tokenLaunched && (
            <p className="infoText" style={{ marginTop: '8px' }}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / {String(tokenName).toLowerCase() === 'virtue' ? '4 ETH' : '40 ETH'}</p>
          )}
        </>
      ) : (
        <>
          {/* Sell: Token Input */}
          <div style={{ position: 'relative' }}>
            <span className="inputAfter" style={{ position: 'absolute', fontSize: '0.9rem', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>{tokenName}</span>
            <input className="inputBox inputText userText outlineTeal" placeholder={`0 ${tokenName}`} {...numInputProps(sellText, setSellText, setSellValue)} />
          </div>
          <p className="rightSide">Balance: {Number(ethers.formatUnits(tokenBalance, 18)).toFixed(2)} {tokenName}</p>

          {/* Sell: ETH Output */}
          <div style={{ position: 'relative' }}>
            <span className="inputAfter" style={{ position: 'absolute', right: '16px', fontSize: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>ETH</span>
            <input className="inputBox inputText newText outlineTeal" placeholder="0 ETH" value={String(Number(sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3)).toFixed(8))} type="number" readOnly />
          </div>
          <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>

          {sellValue > 0 && (
            <>
              {sellValue * 10 ** 18 > tokenAllowance ? (
                <p onClick={() => tokenLaunched ? approveRouter() : approveFactory()} className="enterButton pointer">Approve</p>
              ) : (
                <p onClick={() => tokenLaunched ? sellRouter() : sellFactory()} className="enterButton pointer">Sell</p>
              )}
            </>
          )}

          <p className="infoText">1 {tokenName} = {Number(Number(tokenPrice) / 10 ** 18).toFixed(10)} ETH</p>
          <p className="infoText"><span className="taxBadge">3% Tax</span></p>
          {!tokenLaunched && (
            <p className="infoText" style={{ marginTop: '8px' }}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / {String(tokenName).toLowerCase() === 'virtue' ? '4 ETH' : '40 ETH'}</p>
          )}
        </>
      )}
    </>
  );
}
