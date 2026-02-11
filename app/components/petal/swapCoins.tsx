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
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      try {
        await writeContract({
          abi: factory.abi, address: tokenAddress as Address, functionName: 'approve',
          args: [factoryAddress, ethers.parseUnits(String(100000000))],
        });
      } finally { setIsLoading(false); }
    }
  };

  const buyFactory = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: factory.abi, address: factoryAddress as Address, functionName: 'buy',
          args: [tokenAddress, ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18), 18), address],
          value: ethers.parseUnits(String(buyValue)),
        });
      } finally { setIsLoading(false); }
    }
  };

  const sellFactory = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: factory.abi, address: factoryAddress as Address, functionName: 'sell',
          args: [tokenAddress, ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18), 18), address],
        });
      } finally { setIsLoading(false); }
    }
  };

  const approveRouter = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: token.abi, address: tokenAddress as Address, functionName: 'approve',
          args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
        });
      } finally { setIsLoading(false); }
    }
  };

  const sellRouter = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
          functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18), 18), [tokenAddress, Data.WETH], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
        });
      } finally { setIsLoading(false); }
    }
  };

  const buyRouter = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
          functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18), 18), [Data.WETH, tokenAddress], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
          value: ethers.parseUnits(String(buyValue)),
        });
      } finally { setIsLoading(false); }
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

  const ethBal = Number(ethers.formatUnits(String(ethBalance), 18));
  const tokBal = Number(ethers.formatUnits(tokenBalance, 18));
  const pricePerToken = Number(tokenPrice) / 1e18;
  const bondTarget = String(tokenName).toLowerCase() === 'virtue' ? 4 : 40;
  const bondCurrent = Number(ethers.formatUnits(String(ethIn), 18));
  const bondPercent = bondTarget > 0 ? Math.min((bondCurrent / bondTarget) * 100, 100) : 0;

  return (
    <>
      {/* Buy/Sell Toggle */}
      <div className="swapTabBar" style={{ '--active-tab': swapState, '--tab-count': 2 } as React.CSSProperties}>
        <div className={`swapTabBtn ${swapState === 0 ? 'active' : ''}`} onClick={() => setSwapState(0)}>
          Buy
        </div>
        <div className={`swapTabBtn ${swapState === 1 ? 'active' : ''}`} onClick={() => setSwapState(1)}>
          Sell
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="swapSettingsBar">
        <span className="swapSettingsLabel">Slippage</span>
        <div className="swapSlipWrap">
          <input
            className="swapSlipInput"
            placeholder="1"
            {...numInputProps(slippageText, setSlippageText, setSlippage)}
          />
        </div>
      </div>

      {swapState === 0 ? (
        <div key="buy" className="panelFadeIn">
          {/* From: ETH */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>From</span>
              <span>Balance: {ethBal.toFixed(4)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input placeholder="0.0" {...numInputProps(buyText, setBuyText, setBuyValue)} />
              <div className="swapTokenBadge">ETH</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="swapArrowWrap">
            <div className="swapArrowBtn">&#8595;</div>
          </div>

          {/* To: Token */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>To (estimated)</span>
              <span>Balance: {tokBal.toFixed(2)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input
                placeholder="0.0"
                value={pricePerToken > 0 ? Number(buyValue / pricePerToken - ((buyValue / pricePerToken / 100) * 3)).toFixed(4) : '0'}
                readOnly
              />
              <div className="swapTokenBadge">{tokenName}</div>
            </div>
          </div>

          {/* Action Button */}
          {buyValue > 0 && (
            <div onClick={() => tokenLaunched ? buyRouter() : buyFactory()} className={`swapActionBtn pointer ${isLoading ? 'btn-loading' : ''}`}>
              {isLoading ? 'Processing...' : `Buy ${tokenName}`}
            </div>
          )}
        </div>
      ) : (
        <div key="sell" className="panelFadeIn">
          {/* From: Token */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>From</span>
              <span>Balance: {tokBal.toFixed(2)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input placeholder="0.0" {...numInputProps(sellText, setSellText, setSellValue)} />
              <div className="swapTokenBadge">{tokenName}</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="swapArrowWrap">
            <div className="swapArrowBtn">&#8595;</div>
          </div>

          {/* To: ETH */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>To (estimated)</span>
              <span>Balance: {ethBal.toFixed(4)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input
                placeholder="0.0"
                value={pricePerToken > 0 ? Number(sellValue * pricePerToken - ((sellValue * pricePerToken / 100) * 3)).toFixed(8) : '0'}
                readOnly
              />
              <div className="swapTokenBadge">ETH</div>
            </div>
          </div>

          {/* Action Button */}
          {sellValue > 0 && (
            <>
              {sellValue * 10 ** 18 > tokenAllowance ? (
                <div onClick={() => tokenLaunched ? approveRouter() : approveFactory()} className={`swapActionBtn pointer ${isLoading ? 'btn-loading' : ''}`}>
                  {isLoading ? 'Processing...' : `Approve ${tokenName}`}
                </div>
              ) : (
                <div onClick={() => tokenLaunched ? sellRouter() : sellFactory()} className={`swapActionBtn pointer ${isLoading ? 'btn-loading' : ''}`}>
                  {isLoading ? 'Processing...' : `Sell ${tokenName}`}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Trade Info */}
      <div className="swapInfoSection">
        <div className="swapInfoRow">
          <span>Rate</span>
          <span>
            {swapState === 0
              ? `1 ETH = ${pricePerToken > 0 ? Number(1 / pricePerToken).toFixed(4) : '—'} ${tokenName}`
              : `1 ${tokenName} = ${pricePerToken > 0 ? pricePerToken.toFixed(10) : '—'} ETH`
            }
          </span>
        </div>
        <div className="swapInfoDivider" />
        <div className="swapInfoRow">
          <span>Tax</span>
          <span><span className="taxBadge">3%</span></span>
        </div>
        <div className="swapInfoRow">
          <span>Slippage</span>
          <span>{slippage}%</span>
        </div>
      </div>

      {/* Bonding Curve Progress (pre-launch only) */}
      {!tokenLaunched && (
        <div className="swapBondProgress">
          <div className="swapBondLabel">
            <span>Bonding Curve</span>
            <span>{bondCurrent.toFixed(3)} / {bondTarget} ETH</span>
          </div>
          <div className="swapBondTrack">
            <div className="swapBondFill" style={{ width: `${bondPercent}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
