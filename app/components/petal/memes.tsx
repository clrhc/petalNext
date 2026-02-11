'use client';
import '../../globals.css';
import React, { useState } from 'react';
import SwapMemes from './swapMemes';
import Data from '../../data.json';

const MEME_TOKENS = [
  { label: 'CATGIRL', address: Data.CATGIRL },
  { label: 'FEMBOY', address: Data.FEMBOY },
  { label: 'CHEESE', address: Data.CHEESE },
  { label: 'BEETLE', address: Data.BEETLE },
] as const;

export default function Memes() {
  const [selectedMeme, setSelectedMeme] = useState(0);

  return (
    <div className="predLayout">
      <div className="predContent">
        <div className="predSubHeader">
          <span className="predOracleTag">
            <span className="predOracleDot" />
            WEED Pairs
          </span>
        </div>

        <div className="predGrid">
          {MEME_TOKENS.map((tok, i) => (
            <div
              key={tok.label}
              className={`predPairCard ${selectedMeme === i ? 'selected' : ''}`}
              onClick={() => setSelectedMeme(i)}
            >
              <div className="predPairIcon">
                <span className="memeTokenInitial">{tok.label[0]}</span>
              </div>
              <span className="predPairName">{tok.label}</span>
              <span className="predPairLabel">Trade</span>
            </div>
          ))}
        </div>

        <div className="predPanel" key={selectedMeme}>
          <div className="predPanelHeader">
            <div className="predPairIcon">
              <span className="memeTokenInitial">{MEME_TOKENS[selectedMeme].label[0]}</span>
            </div>
            <span className="predPanelTitle">{MEME_TOKENS[selectedMeme].label}</span>
          </div>
          <div className="panelFadeIn">
            <SwapMemes tokenAddress={MEME_TOKENS[selectedMeme].address} />
          </div>
        </div>
      </div>
    </div>
  );
}
