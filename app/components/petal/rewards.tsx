'use client';
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import Data from '../../data.json';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { Abi, Address } from 'viem';
import { useAccount, useChainId, useWriteContract } from "wagmi";
import rewards from '../../abis/rewards.json';
import nft from '../../abis/nft.json';

export default function Rewards() {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const [rewardsAvailable, setRewardsAvailable] = useState(0);
  const [nftBalance, setNftBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
            { address: Data.virtueNFT as Address, abi: nft.abi as Abi, functionName: 'balanceOf', args: [address as Address] },
            { address: Data.petalRewards as Address, abi: rewards.abi as Abi, functionName: 'checkRewards', args: [address as Address] },
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

    return () => { if (unwatch) unwatch(); };
  }, [isConnected, address, config, Data.virtueNFT, Data.petalRewards]);


  const claimRewards = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: rewards.abi, address: Data.petalRewards as Address, functionName: 'claimRewards',
        });
      } finally { setIsLoading(false); }
    }
  };

  return (
    <>
      <div className="refInfo">
        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0, 255, 200, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>Accumulate XP for future reward snapshots</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Mint VirtueSekai NFTs at{' '}
            <a className="virtueLink" href="https://virtue.wtf" rel="noopener noreferrer" target="_blank">Virtue.wtf</a>
            {' '}for bonus claims
          </p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(10, 20, 30, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>VirtueSekai NFTs Held</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{nftBalance}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Claimable Rewards</h3>

        <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(10, 20, 30, 0.3)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>PETAL</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem' }}>{rewardsAvailable.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(10, 20, 30, 0.3)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>WEED</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem' }}>{(rewardsAvailable * 30).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(10, 20, 30, 0.3)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>VIRTUE</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem' }}>{(rewardsAvailable * 30).toLocaleString()}</span>
          </div>
        </div>

        <p onClick={() => claimRewards()} className={`enterButton pointer ${isLoading ? 'btn-loading' : ''}`}>{isLoading ? 'Processing...' : 'Claim Rewards'}</p>

        <p className="infoText" style={{ marginTop: '16px' }}>1,000 PETAL + 30K WEED + 30K VIRTUE per unclaimed NFT</p>
      </div>
    </>
  );
}
