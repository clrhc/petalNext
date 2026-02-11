'use client';
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { Abi, Address } from 'viem';
import { useAccount, useChainId, useWriteContract } from "wagmi";
import prediction from '../../abis/prediction.json';
import dataFeed from '../../abis/dataFeed.json';

export default function PredCoins({ contractAddress, dataFeedAddress, view }: { contractAddress: string; dataFeedAddress: string; view: 'bid' | 'position' }) {

  type CurrentBid = {
    roundId: string;
    priceBid: string;
    priceBidTime: string;
    higher: boolean;
    amountBid: string;
  };

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [ethBalance, setEthBalance] = useState(0);
  const [checkBid, setCheckBid] = useState(0);
  const [userBid, setUserBid] = useState<CurrentBid>({ roundId: '0', priceBid: '0', priceBidTime: '0', higher: false, amountBid: '0' });
  const [epoch, setEpoch] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [roundAnswer, setRoundAnswer] = useState(0);
  const [previousAnswer, setPreviousAnswer] = useState(0);
  const [bidValue, setBidValue] = useState(0);
  const [bidText, setBidText] = useState("0");
  const [bidState, setBidState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const provider = new ethers.JsonRpcProvider(
    'https://base-mainnet.public.blastapi.io',
    { chainId: 8453, name: 'base' }
  );

  useEffect(() => {
    if (!isConnected || !address) return;

    type ChainlinkRoundData = readonly [bigint, bigint, bigint, bigint, bigint] & {
      roundId: bigint; answer: bigint; startedAt: bigint; updatedAt: bigint; answeredInRound: bigint;
    };

    const isChainlinkRoundData = (x: unknown): x is ChainlinkRoundData => {
      if (x === null || (typeof x !== 'object' && !Array.isArray(x))) return false;
      const o = x as Record<string | number, unknown>;
      return typeof o['answer'] === 'bigint' || (Array.isArray(x) && typeof o[0] === 'bigint' && typeof o[1] === 'bigint' && typeof o[2] === 'bigint' && typeof o[3] === 'bigint' && typeof o[4] === 'bigint');
    };

    const extractAnswer = (o: unknown): bigint => {
      if (isChainlinkRoundData(o)) {
        return typeof (o as { answer?: bigint }).answer === 'bigint' ? (o as { answer: bigint }).answer : o[1];
      }
      return 0n;
    };

    let unwatch: (() => void) | null = null;
    let running = false;

    const init = async () => {
      if (running) return;
      running = true;

      try {
        const primary = await readContracts(config, {
          contracts: [
            { address: contractAddress as Address, abi: prediction.abi as Abi, functionName: 'checkBid', args: [address as Address] },
            { address: contractAddress as Address, abi: prediction.abi as Abi, functionName: 'userBid', args: [address as Address] },
            { address: contractAddress as Address, abi: prediction.abi as Abi, functionName: 'epochCheck' },
            { address: dataFeedAddress as Address, abi: dataFeed.abi as Abi, functionName: 'latestAnswer' },
            { address: dataFeedAddress as Address, abi: dataFeed.abi as Abi, functionName: 'latestRound' },
          ],
          allowFailure: true,
        });

        const checkBid_ok = primary[0]?.status === 'success';
        const userBid_ok = primary[1]?.status === 'success';
        const epoch_ok = primary[2]?.status === 'success';
        const answer_ok = primary[3]?.status === 'success';
        const round_ok = primary[4]?.status === 'success';

        const checkBid_ = checkBid_ok ? (primary[0].result as bigint) : 0n;
        const userBid_ = userBid_ok ? (primary[1].result as [bigint, bigint, bigint, boolean, bigint]) : undefined;
        const epoch_ = epoch_ok ? (primary[2].result as bigint) : 0n;
        const answer_ = answer_ok ? (primary[3].result as bigint) : 0n;
        const round_ = round_ok ? (primary[4].result as bigint) : 0n;

        try {
          if (typeof provider?.getBalance === 'function') {
            const ethBalance_ = await provider.getBalance(address!);
            setEthBalance(Number(ethBalance_));
          }
        } catch {}

        if (checkBid_ok && checkBid_ > 0n && userBid_ok && epoch_ok) {
          const targetRoundId = userBid_![0] + epoch_;
          const follow = await readContracts(config, {
            contracts: [{ address: dataFeedAddress as Address, abi: dataFeed.abi as Abi, functionName: 'getRoundData', args: [targetRoundId] }],
            allowFailure: true,
          });
          if (follow[0]?.status === 'success') {
            const ans = extractAnswer(follow[0].result as unknown);
            if (ans > 0n) setRoundAnswer(Number(ans));
          }
        } else if (round_ok && epoch_ok) {
          const prevRoundId = round_ - epoch_;
          const prev = await readContracts(config, {
            contracts: [{ address: dataFeedAddress as Address, abi: dataFeed.abi as Abi, functionName: 'getRoundData', args: [prevRoundId] }],
            allowFailure: true,
          });
          if (prev[0]?.status === 'success') {
            const ans = extractAnswer(prev[0].result as unknown);
            if (ans > 0n) setPreviousAnswer(Number(ans));
          }
        }

        if (checkBid_ok) setCheckBid(Number(checkBid_));
        if (userBid_ok && userBid_) {
          setUserBid({
            roundId: userBid_[0].toString(), priceBid: userBid_[1].toString(),
            priceBidTime: userBid_[2].toString(), higher: userBid_[3], amountBid: userBid_[4].toString(),
          });
        }
        if (epoch_ok) setEpoch(Number(epoch_));
        if (answer_ok) setAnswer(Number(answer_));
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
  }, [isConnected, address, config, contractAddress, dataFeedAddress]);

  const bidPrediction = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: prediction.abi, address: contractAddress as Address, functionName: 'bid',
          args: [ethers.parseUnits(String(bidValue)), bidState],
          value: ethers.parseUnits(String(bidValue)),
        });
      } finally { setIsLoading(false); }
    }
  };

  const resolveBid = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: prediction.abi, address: contractAddress as Address, functionName: 'resolveBid',
        });
      } finally { setIsLoading(false); }
    }
  };

  const numInputProps = {
    type: "text" as const,
    inputMode: "decimal" as const,
    pattern: "^\\d*\\.?\\d*$",
    onWheel: (e: React.WheelEvent<HTMLInputElement>) => (e.target as HTMLInputElement).blur(),
    value: bidText,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!/^\d*\.?\d*$/.test(v)) return;
      setBidText(v);
      setBidValue(v === '' || v === '.' ? 0 : Number(v));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isDigit = /^[0-9]$/.test(e.key);
      const isNonZero = /^[1-9]$/.test(e.key);
      const isDot = e.key === '.';
      const nav = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
      if (isDot && (bidText === '0' || bidText === '')) return;
      if (isNonZero && bidText === '0') { e.preventDefault(); setBidText(e.key); setBidValue(Number(e.key)); return; }
      if (e.key === '0' && bidText === '0') { e.preventDefault(); return; }
      if (!isDigit && !isDot && !nav) e.preventDefault();
    },
    onBlur: () => { if (bidText === '' || bidText === '.') { setBidText('0'); setBidValue(0); } },
  };

  const hasActiveBid = Number(userBid?.roundId) > 0;

  /* ──── "Your Bid" tab view ──── */
  if (view === 'position') {
    if (!hasActiveBid) {
      return (
        <div className="predEmptyState">
          <div className="predEmptyIcon">--</div>
          <p className="predEmptyTitle">No Active Bid</p>
          <p className="predEmptyDesc">
            You don&apos;t have an active prediction. Go to the Markets tab to place a bid on a crypto pair.
          </p>
        </div>
      );
    }

    return (
      <div className="predActiveBid">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span className={`predBidDirection ${userBid.higher ? 'higher' : 'lower'}`}>
            BID {userBid.higher ? 'HIGHER' : 'LOWER'}
          </span>
        </div>

        <div className="bidPrice">
          <span><p>Bid Price</p></span>
          <span><h2>${Number(ethers.formatUnits(String(userBid.priceBid), 8)).toFixed(3)}</h2></span>
        </div>
        <div className="bidPrice">
          <span><p>Result</p></span>
          <span>
            <h2>{checkBid === 0 ? 'PENDING' : '$' + Number(ethers.formatUnits(String(roundAnswer), 8)).toFixed(3)}</h2>
          </span>
        </div>

        <div className="winnings">
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>WINNINGS</p>
          <p style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>
            {Number(Number(ethers.formatUnits(userBid.amountBid, 18)) / Number(Number(2000000000000) / 10 ** 18) * 3).toFixed(2)} WEED
          </p>
          {checkBid === 1 && (
            <>
              <p style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
                {Number(Number(ethers.formatUnits(userBid.amountBid, 18)) / Number(Number(2000000000000) / 10 ** 18) * 1).toFixed(2)} PETAL
              </p>
              <p style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
                {Number(ethers.formatUnits(userBid.amountBid, 18)).toFixed(4)} ETH
              </p>
            </>
          )}
        </div>

        {checkBid > 0 && (
          <p onClick={() => resolveBid()} className={`enterButton pointer ${isLoading ? 'btn-loading' : ''}`}>{isLoading ? 'Processing...' : 'Resolve Bid'}</p>
        )}
      </div>
    );
  }

  /* ──── "Markets" tab bid view ──── */

  // If user has an active bid, show it inline instead of the bid form
  if (hasActiveBid) {
    return (
      <>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span className={`predBidDirection ${userBid.higher ? 'higher' : 'lower'}`}>
            BID {userBid.higher ? 'HIGHER' : 'LOWER'}
          </span>
        </div>

        <div className="bidPrice">
          <span><p>Bid Price</p></span>
          <span><h2>${Number(ethers.formatUnits(String(userBid.priceBid), 8)).toFixed(3)}</h2></span>
        </div>
        <div className="bidPrice">
          <span><p>Result</p></span>
          <span>
            <h2>{checkBid === 0 ? 'PENDING' : '$' + Number(ethers.formatUnits(String(roundAnswer), 8)).toFixed(3)}</h2>
          </span>
        </div>

        <div className="winnings">
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>WINNINGS</p>
          <p style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>
            {Number(Number(ethers.formatUnits(userBid.amountBid, 18)) / Number(Number(2000000000000) / 10 ** 18) * 3).toFixed(2)} WEED
          </p>
          {checkBid === 1 && (
            <>
              <p style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
                {Number(Number(ethers.formatUnits(userBid.amountBid, 18)) / Number(Number(2000000000000) / 10 ** 18) * 1).toFixed(2)} PETAL
              </p>
              <p style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
                {Number(ethers.formatUnits(userBid.amountBid, 18)).toFixed(4)} ETH
              </p>
            </>
          )}
        </div>

        {checkBid > 0 && (
          <p onClick={() => resolveBid()} className={`enterButton pointer ${isLoading ? 'btn-loading' : ''}`}>{isLoading ? 'Processing...' : 'Resolve Bid'}</p>
        )}
      </>
    );
  }

  return (
    <>
      {/* Price Display Cards */}
      <div className="predPriceDisplay">
        <div className="predPriceCard">
          <p className="predPriceLabel">Previous Price</p>
          <h2 className="predPriceValue">${Number(ethers.formatUnits(String(previousAnswer), 8)).toFixed(2)}</h2>
        </div>
        <div className="predPriceCard current">
          <p className="predPriceLabel">Current Price</p>
          <h2 className="predPriceValue">${Number(ethers.formatUnits(String(answer), 8)).toFixed(2)}</h2>
        </div>
      </div>

      {/* Bid Input */}
      <div style={{ position: 'relative' }}>
        <span className="inputAfter">ETH</span>
        <input className="inputBox inputText userText outlineTeal" placeholder="0 ETH" {...numInputProps} />
      </div>
      <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(6)} ETH</p>

      {/* Direction Buttons */}
      <div className="predDirectionBtns">
        <div
          className={`btnHigher ${bidState ? 'active' : ''}`}
          onClick={() => setBidState(true)}
        >
          HIGHER
        </div>
        <div
          className={`btnLower ${!bidState ? 'active' : ''}`}
          onClick={() => setBidState(false)}
        >
          LOWER
        </div>
      </div>

      <p className="infoText">Next price check in {epoch} epoch(s)</p>

      {bidValue > 0 && (
        <p onClick={() => bidPrediction()} className={`enterButton pointer ${isLoading ? 'btn-loading' : ''}`} style={{ marginTop: '16px' }}>{isLoading ? 'Processing...' : 'Place Bid'}</p>
      )}

      {/* Rewards Info */}
      <div className="predRewardsBox">
        <p className="infoText" style={{ marginBottom: '4px' }}>1 ETH = {Number(1 / Number(Number(2000000000000) / 10 ** 18) * 1).toFixed(2)} PETAL</p>
        <p className="infoText" style={{ marginBottom: '8px' }}>1 ETH = {Number(1 / Number(Number(2000000000000) / 10 ** 18) * 3).toFixed(2)} WEED</p>
        <p className="infoText"><span className="taxBadge">3% Tax</span></p>
        <div className="predRewardBadges">
          <span className="predWinBadge">Win = PETAL + WEED + ETH</span>
          <span className="predLossBadge">Loss = WEED only</span>
        </div>
      </div>
    </>
  );
}
