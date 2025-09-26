'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import SwapMemes from './swapMemes';
import Data from '../data.json';



export default function Memes({tokenAddress, contractAddress}) {

  const [swapMeme, setSwapMeme] = useState(0);


  return(
  <>
   <div className="swapButtons"><p className={`${swapMeme === 0 && "tealActive"}`} onClick={() => setSwapMeme(0)}>CATGIRL</p><p className={`${swapMeme === 1 && "tealActive"}`} onClick={() => setSwapMeme(1)}>FEMBOY</p></div>
      <div className="swapButtons"><p className={`${swapMeme === 2 && "tealActive"}`} onClick={() => setSwapMeme(2)}>🧀</p><p className={`${swapMeme === 3 && "tealActive"}`} onClick={() => setSwapMeme(3)}>🪲</p></div>
       <span style={{ display: swapMeme === 0 ? 'block' : 'none' }}><SwapMemes tokenAddress={Data.CATGIRL} /></span>
      <span style={{ display: swapMeme === 1 ? 'block' : 'none' }}><SwapMemes tokenAddress={Data.FEMBOY} /></span>
     <span style={{ display: swapMeme === 2 ? 'block' : 'none' }}><SwapMemes tokenAddress={Data.CHEESE} /></span>
     <span style={{ display: swapMeme === 3 ? 'block' : 'none' }}><SwapMemes tokenAddress={Data.BEETLE} /></span>
      </> 
  );
  }