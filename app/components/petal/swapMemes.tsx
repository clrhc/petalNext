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
import uniswapFactory from '../../abis/uniswapFactory.json';


export default function SwapMemes({ tokenAddress }: { tokenAddress: string; }) {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [weedBalance, setWeedBalance] = useState<bigint>(0n);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [tokenAllowance, setTokenAllowance] = useState(0);
  const [weedAllowance, setWeedAllowance] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [sellValue, setSellValue] = useState(0);
  const [slippageText, setSlippageText] = useState("1");
  const [buyText, setBuyText] = useState("0");
  const [sellText, setSellText] = useState("0");
  const [swapState, setSwapState] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const [tokenPair, setTokenPair] = useState("");
  const networkId = useChainId();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isConnected || !address) return;

    type AmountsOut2 = readonly [bigint, bigint];

    let unwatch: (() => void) | null = null;
    let running = false;

    const init = async () => {
      if (running) return;
      running = true;

      try {
        const data = await readContracts(config, {
          contracts: [
            { address: Data.petalFactory as Address, abi: factory.abi as Abi, functionName: 'balanceOf', args: [address as Address] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: 'balanceOf', args: [address as Address] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: 'allowance', args: [address as Address, Data.uniswapRouter as Address] },
            { address: Data.petalFactory as Address, abi: factory.abi as Abi, functionName: 'allowance', args: [address as Address, Data.uniswapRouter as Address] },
            { address: Data.uniswapRouter as Address, abi: uniswapRouter.abi as Abi, functionName: 'getAmountsOut', args: [parseUnits('1', 18), [tokenAddress as Address, Data.petalFactory as Address]] },
            { address: tokenAddress as Address, abi: token.abi as Abi, functionName: 'name' },
            { address: Data.uniswapFactory as Address, abi: uniswapFactory.abi as Abi, functionName: 'getPair', args: [tokenAddress as Address, Data.petalFactory as Address] },
          ],
          allowFailure: false,
        });

        const [weedBalance_, tokenBalance_, tokenAllowance_, weedAllowance_, tokenPriceTuple_, tokenName_, tokenPair_] = data as [
          bigint, bigint, bigint, bigint, AmountsOut2, string, Address
        ];

        setWeedBalance(weedBalance_);
        setTokenBalance(tokenBalance_);
        setWeedAllowance(Number(weedAllowance_));
        setTokenAllowance(Number(tokenAllowance_));

        if (tokenPriceTuple_?.[1] && tokenPriceTuple_[1] > 0n) setTokenPrice(Number(tokenPriceTuple_[1]));
        if (tokenName_ && tokenName_.length > 0) setTokenName(tokenName_);
        if (tokenPair_ && tokenPair_.toLowerCase() !== '0x0000000000000000000000000000000000000000') setTokenPair(String(tokenPair_));
      } catch {
      } finally {
        running = false;
      }
    };

    void init();

    unwatch = watchBlockNumber(config, {
      onBlockNumber: () => { void init(); },
      onError: () => {},
    });

    return () => { if (unwatch) unwatch(); };
  }, [isConnected, address, config, tokenAddress, Data.petalFactory, Data.uniswapRouter, Data.uniswapFactory]);

  const approveRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: token.abi, address: tokenAddress as Address, functionName: 'approve',
        args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
      });
    }
  };

  const approveWeed = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: token.abi, address: Data.petalFactory as Address, functionName: 'approve',
        args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
      });
    }
  };

  const buyRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(buyValue)), ethers.parseUnits((buyValue / (Number(tokenPrice) / 1e18) - (((buyValue / (Number(tokenPrice) / 1e18)) / 100) * slippage)).toFixed(18), 18), [Data.petalFactory, tokenAddress], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
      });
    }
  };

  const sellRouter = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi, address: Data.uniswapRouter as Address,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(tokenPrice) / 1e18) - ((sellValue * (Number(tokenPrice) / 1e18) / 100) * slippage)).toFixed(18), 18), [tokenAddress, Data.petalFactory], address, String(Number((Date.now() / 1000) + 10000).toFixed(0))],
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

  const weedBal = Number(ethers.formatUnits(weedBalance, 18));
  const tokBal = Number(ethers.formatUnits(tokenBalance, 18));
  const pricePerToken = Number(tokenPrice) / 1e18;

  return (
    <>
      {/* Buy/Sell Toggle */}
      <div className="swapTabBar">
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
        <>
          {/* From: WEED */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>From</span>
              <span>Balance: {weedBal.toFixed(2)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input placeholder="0.0" {...numInputProps(buyText, setBuyText, setBuyValue)} />
              <div className="swapTokenBadge">WEED</div>
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
                value={pricePerToken > 0 ? Number(buyValue / pricePerToken).toFixed(4) : '0'}
                readOnly
              />
              <div className="swapTokenBadge">{tokenName}</div>
            </div>
          </div>

          {/* Action Button */}
          {buyValue > 0 && (
            <>
              {buyValue * 10 ** 18 > weedAllowance ? (
                <div onClick={() => approveWeed()} className="swapActionBtn pointer">
                  Approve WEED
                </div>
              ) : (
                <div onClick={() => buyRouter()} className="swapActionBtn pointer">
                  Buy {tokenName}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
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

          {/* To: WEED */}
          <div className="swapTokenGroup">
            <div className="swapTokenGroupLabel">
              <span>To (estimated)</span>
              <span>Balance: {weedBal.toFixed(2)}</span>
            </div>
            <div className="swapTokenInputRow">
              <input
                placeholder="0.0"
                value={pricePerToken > 0 ? Number(sellValue * pricePerToken).toFixed(4) : '0'}
                readOnly
              />
              <div className="swapTokenBadge">WEED</div>
            </div>
          </div>

          {/* Action Button */}
          {sellValue > 0 && (
            <>
              {sellValue * 10 ** 18 > tokenAllowance ? (
                <div onClick={() => approveRouter()} className="swapActionBtn pointer">
                  Approve {tokenName}
                </div>
              ) : (
                <div onClick={() => sellRouter()} className="swapActionBtn pointer">
                  Sell {tokenName}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Trade Info */}
      <div className="swapInfoSection">
        <div className="swapInfoRow">
          <span>Rate</span>
          <span>
            {swapState === 0
              ? `1 WEED = ${pricePerToken > 0 ? Number(1 / pricePerToken).toFixed(4) : '—'} ${tokenName}`
              : `1 ${tokenName} = ${pricePerToken > 0 ? pricePerToken.toFixed(10) : '—'} WEED`
            }
          </span>
        </div>
        <div className="swapInfoDivider" />
        <div className="swapInfoRow">
          <span>Slippage</span>
          <span>{slippage}%</span>
        </div>
      </div>

      {/* Chart */}
      {tokenPair && (
        <div id="dexscreener-embed">
          <iframe src={`https://dexscreener.com/base/${tokenPair}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTimeframesToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`} />
        </div>
      )}
    </>
  );
}
