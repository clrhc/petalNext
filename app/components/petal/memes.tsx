'use client';
import '../../globals.css';
import React,{useState} from 'react';
import SwapMemes from './swapMemes';
import Data from '../../data.json';



export default function Memes() {

  const [swapMeme, setSwapMeme] = useState(0);


  return(
  <>
   <div className="swapButtons"><p className={`${swapMeme === 0 && "tealActive"}`} onClick={() => setSwapMeme(0)}>CATGIRL</p><p className={`${swapMeme === 1 && "tealActive"}`} onClick={() => setSwapMeme(1)}>FEMBOY</p></div>
      <div className="swapButtons"><p className={`${swapMeme === 2 && "tealActive"}`} onClick={() => setSwapMeme(2)}>🧀</p><p className={`${swapMeme === 3 && "tealActive"}`} onClick={() => setSwapMeme(3)}>🪲</p></div>
       {swapMeme === 0 && <><SwapMemes tokenAddress={Data.CATGIRL} /></>}
      {swapMeme === 1 && <><SwapMemes tokenAddress={Data.FEMBOY} /></>}
     {swapMeme === 2 && <><SwapMemes tokenAddress={Data.CHEESE} /></>}
     {swapMeme === 3 && <><SwapMemes tokenAddress={Data.BEETLE} /></>}
      </> 
  );
  }