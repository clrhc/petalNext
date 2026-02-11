'use client';
import '../../globals.css';
import React, { useState } from 'react';
import PredCoins from './predCoins';
import PredHistory from './predHistory';
import Data from '../../data.json';

const PAIRS = [
  { label: 'ETH/USD', short: 'ETH', contract: Data.ethPrediction, feed: Data.ethusd },
  { label: 'BTC/USD', short: 'BTC', contract: Data.btcPrediction, feed: Data.btcusd },
  { label: 'LINK/USD', short: 'LINK', contract: Data.linkPrediction, feed: Data.linkusd },
  { label: 'BNB/USD', short: 'BNB', contract: Data.bnbPrediction, feed: Data.bnbusd },
  { label: 'LTC/USD', short: 'LTC', contract: Data.ltcPrediction, feed: Data.ltcusd },
  { label: 'SOL/USD', short: 'SOL', contract: Data.solPrediction, feed: Data.solusd },
  { label: 'XRP/USD', short: 'XRP', contract: Data.xrpPrediction, feed: Data.xrpusd },
  { label: 'DOGE/USD', short: 'DOGE', contract: Data.dogePrediction, feed: Data.dogeusd },
] as const;

type TabType = 'markets' | 'yourbid' | 'history';

export default function Predictions() {
  const [activeTab, setActiveTab] = useState<TabType>('markets');
  const [selectedPair, setSelectedPair] = useState(0);

  return (
    <div className="predLayout">
      {/* PancakeSwap-style tab bar */}
      <div className="predTabs">
        <div
          className={`predTab ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
        >
          Markets<span className="predTabCount">{PAIRS.length}</span>
        </div>
        <div className="predTabDivider" />
        <div
          className={`predTab ${activeTab === 'yourbid' ? 'active' : ''}`}
          onClick={() => setActiveTab('yourbid')}
        >
          Your Bid
        </div>
        <div className="predTabDivider" />
        <div
          className={`predTab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </div>
      </div>

      {/* Content panel */}
      <div className="predContent">
        {/* Pair selector shown on all tabs */}
        {(activeTab === 'yourbid' || activeTab === 'history') && (
          <div className="predSubHeader">
            <span className="predOracleTag">
              <span className="predOracleDot" />
              {PAIRS[selectedPair].label}
            </span>
            <div className="predPairSwitcher">
              {PAIRS.map((pair, i) => (
                <span
                  key={pair.label}
                  className={`predPairChip ${selectedPair === i ? 'active' : ''}`}
                  onClick={() => setSelectedPair(i)}
                >
                  {pair.short}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'markets' && (
          <>
            {/* Sub header */}
            <div className="predSubHeader">
              <span className="predOracleTag">
                <span className="predOracleDot" />
                Chainlink Data Feeds
              </span>
            </div>

            {/* Pair card grid */}
            <div className="predGrid">
              {PAIRS.map((pair, i) => (
                <div
                  key={pair.label}
                  className={`predPairCard ${selectedPair === i ? 'selected' : ''}`}
                  onClick={() => setSelectedPair(i)}
                >
                  <div className="predPairIcon">{pair.short}</div>
                  <span className="predPairName">{pair.label}</span>
                  <span className="predPairLabel">Predict</span>
                </div>
              ))}
            </div>

            {/* Bid panel for selected pair */}
            <div className="predPanel">
              <div className="predPanelHeader">
                <span className="predPanelTitle">{PAIRS[selectedPair].label}</span>
              </div>
              <PredCoins
                contractAddress={PAIRS[selectedPair].contract}
                dataFeedAddress={PAIRS[selectedPair].feed}
                view="bid"
              />
            </div>
          </>
        )}

        {activeTab === 'yourbid' && (
          <PredCoins
            contractAddress={PAIRS[selectedPair].contract}
            dataFeedAddress={PAIRS[selectedPair].feed}
            view="position"
          />
        )}

        {activeTab === 'history' && (
          <PredHistory
            contractAddress={PAIRS[selectedPair].contract}
          />
        )}
      </div>
    </div>
  );
}
