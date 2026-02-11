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
  const [swapMeme, setSwapMeme] = useState(0);

  return (
    <>
      <div className="swapButtons">
        {MEME_TOKENS.map((tok, i) => (
          <p
            key={tok.label}
            className={swapMeme === i ? "tealActive" : ""}
            onClick={() => setSwapMeme(i)}
          >
            {tok.label}
          </p>
        ))}
      </div>
      <SwapMemes tokenAddress={MEME_TOKENS[swapMeme].address} />
    </>
  );
}
