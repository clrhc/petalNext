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

export default function PredCoins({ contractAddress, dataFeedAddress }: { contractAddress: string; dataFeedAddress: string }) {

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
      await writeContract({
        abi: prediction.abi, address: contractAddress as Address, functionName: 'bid',
        args: [ethers.parseUnits(String(bidValue)), bidState],
        value: ethers.parseUnits(String(bidValue)),
      });
    }
  };

  const resolveBid = async () => {
    if (networkId === baseId) {
      await writeContract({
        abi: prediction.abi, address: contractAddress as Address, functionName: 'resolveBid',
      });
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

  return (
    <>
      {/* New Bid Interface */}
      <span style={{ display: Number(userBid?.roundId) === 0 ? 'block' : 'none' }}>

        {/* Price Display Cards */}
        <div className="predPriceDisplay">
          <div className="predPriceCard">
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Previous Price</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>${Number(ethers.formatUnits(String(previousAnswer), 8)).toFixed(2)}</h2>
          </div>
          <div className="predPriceCard" style={{ borderColor: 'var(--border-active)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Price</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--accent-primary)' }}>${Number(ethers.formatUnits(String(answer), 8)).toFixed(2)}</h2>
          </div>
        </div>

        {/* Bid Input */}
        <div style={{ position: 'relative' }}>
          <span className="inputAfter" style={{ position: 'absolute', fontSize: '0.9rem', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>ETH</span>
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
          <p onClick={() => bidPrediction()} className="enterButton pointer" style={{ marginTop: '16px' }}>Place Bid</p>
        )}

        {/* Rewards Info */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(10, 20, 30, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <p className="infoText" style={{ marginBottom: '4px' }}>1 ETH = {Number(1 / Number(Number(2000000000000) / 10 ** 18) * 1).toFixed(2)} PETAL</p>
          <p className="infoText" style={{ marginBottom: '8px' }}>1 ETH = {Number(1 / Number(Number(2000000000000) / 10 ** 18) * 3).toFixed(2)} WEED</p>
          <p className="infoText"><span className="taxBadge">3% Tax</span></p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--accent-success)' }}>
              Win = PETAL + WEED + ETH
            </span>
            <span style={{ padding: '4px 10px', background: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255, 82, 82, 0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
              Loss = WEED only
            </span>
          </div>
        </div>
      </span>

      {/* Active Bid Display */}
      {Number(userBid.roundId) > 0 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: userBid.higher ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)',
              border: `1px solid ${userBid.higher ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 82, 82, 0.3)'}`,
              color: userBid.higher ? 'var(--accent-success)' : 'var(--accent-danger)',
            }}>
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

          {/* Winnings Card */}
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
            <p onClick={() => resolveBid()} className="enterButton pointer">Resolve Bid</p>
          )}
        </>
      )}
    </>
  );
}
