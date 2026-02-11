'use client';
import '../../globals.css';
import React, { useState } from 'react';
import PredCoins from './predCoins';
import Data from '../../data.json';

const PAIRS = [
  { label: 'ETH/USD', contract: Data.ethPrediction, feed: Data.ethusd },
  { label: 'BTC/USD', contract: Data.btcPrediction, feed: Data.btcusd },
  { label: 'LINK/USD', contract: Data.linkPrediction, feed: Data.linkusd },
  { label: 'BNB/USD', contract: Data.bnbPrediction, feed: Data.bnbusd },
  { label: 'LTC/USD', contract: Data.ltcPrediction, feed: Data.ltcusd },
  { label: 'SOL/USD', contract: Data.solPrediction, feed: Data.solusd },
  { label: 'XRP/USD', contract: Data.xrpPrediction, feed: Data.xrpusd },
  { label: 'DOGE/USD', contract: Data.dogePrediction, feed: Data.dogeusd },
] as const;

export default function Predictions() {
  const [predState, setPredState] = useState(0);

  return (
    <>
      <div className="swapButtons">
        {PAIRS.map((pair, i) => (
          <p
            key={pair.label}
            className={predState === i ? "tealActive" : ""}
            onClick={() => setPredState(i)}
          >
            {pair.label}
          </p>
        ))}
      </div>

      <p className="infoText" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        Powered by Chainlink Data Feeds
      </p>

      <PredCoins
        contractAddress={PAIRS[predState].contract}
        dataFeedAddress={PAIRS[predState].feed}
      />
    </>
  );
}
