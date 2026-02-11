'use client';
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { readContracts } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { Abi, Address } from 'viem';
import { useAccount } from "wagmi";
import prediction from '../../abis/prediction.json';

type BidHistoryEntry = {
  id: number;
  roundId: string;
  priceBid: string;
  priceBidTime: string;
  higher: boolean;
  amountBid: string;
  ethWinnings: string;
  weedWinnings: string;
  petalWinnings: string;
};

export default function PredHistory({ contractAddress }: { contractAddress: string }) {
  const { address, isConnected } = useAccount();
  const [history, setHistory] = useState<BidHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }

    const loadHistory = async () => {
      setLoading(true);
      try {
        const idsResult = await readContracts(config, {
          contracts: [{
            address: contractAddress as Address,
            abi: prediction.abi as Abi,
            functionName: 'getBidIDs',
            args: [address as Address],
          }],
          allowFailure: true,
        });

        if (idsResult[0]?.status !== 'success') { setLoading(false); return; }
        const ids = idsResult[0].result as bigint[];
        if (!ids || ids.length === 0) { setHistory([]); setLoading(false); return; }

        const historyContracts = ids.map(id => ({
          address: contractAddress as Address,
          abi: prediction.abi as Abi,
          functionName: 'getBidHistory',
          args: [id],
        }));

        const historyResults = await readContracts(config, {
          contracts: historyContracts,
          allowFailure: true,
        });

        const entries: BidHistoryEntry[] = [];
        for (let i = 0; i < historyResults.length; i++) {
          if (historyResults[i]?.status === 'success') {
            const r = historyResults[i].result as [bigint, bigint, bigint, boolean, bigint, bigint, bigint, bigint];
            entries.push({
              id: Number(ids[i]),
              roundId: r[0].toString(),
              priceBid: r[1].toString(),
              priceBidTime: r[2].toString(),
              higher: r[3],
              amountBid: r[4].toString(),
              ethWinnings: r[5].toString(),
              weedWinnings: r[6].toString(),
              petalWinnings: r[7].toString(),
            });
          }
        }

        setHistory(entries.reverse());
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [isConnected, address, contractAddress]);

  if (loading) {
    return (
      <div className="predEmptyState">
        <p className="predEmptyDesc">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="predEmptyState">
        <div className="predEmptyIcon">--</div>
        <p className="predEmptyTitle">No History</p>
        <p className="predEmptyDesc">
          You haven&apos;t resolved any predictions for this pair yet. Place and resolve a bid to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="predHistoryList">
      {history.map((entry) => {
        const won = Number(entry.ethWinnings) > 0;
        const bidAmount = Number(ethers.formatUnits(entry.amountBid, 18));
        const ethWin = Number(ethers.formatUnits(entry.ethWinnings, 18));
        const weedWin = Number(ethers.formatUnits(entry.weedWinnings, 18));
        const petalWin = Number(ethers.formatUnits(entry.petalWinnings, 18));
        const bidPrice = Number(ethers.formatUnits(entry.priceBid, 8));

        return (
          <div key={entry.id} className={`predHistoryCard ${won ? 'win' : 'loss'}`}>
            <div className="predHistoryTop">
              <span className={`predBidDirection ${entry.higher ? 'higher' : 'lower'}`}>
                {entry.higher ? 'HIGHER' : 'LOWER'}
              </span>
              <span className={`predHistoryResult ${won ? 'win' : 'loss'}`}>
                {won ? 'WON' : 'LOST'}
              </span>
            </div>

            <div className="predHistoryDetails">
              <div className="predHistoryRow">
                <span>Bid Price</span>
                <span>${bidPrice.toFixed(2)}</span>
              </div>
              <div className="predHistoryRow">
                <span>Amount</span>
                <span>{bidAmount.toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="predHistoryWinnings">
              {won && ethWin > 0 && (
                <span className="predHistoryReward eth">{ethWin.toFixed(4)} ETH</span>
              )}
              {petalWin > 0 && (
                <span className="predHistoryReward petal">{petalWin.toFixed(2)} PETAL</span>
              )}
              {weedWin > 0 && (
                <span className="predHistoryReward weed">{weedWin.toFixed(2)} WEED</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
