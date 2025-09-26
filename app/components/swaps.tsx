'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import SwapCoins from './swapCoins';
import Data from '../data.json';



export default function Swaps() {

  const [swapCoin, setSwapCoin] = useState(0);


	return(
	<>
    <div className="swapButtons"><p className={`${swapCoin === 0 && "tealActive"}`} onClick={() => setSwapCoin(0)}>PETAL</p><p className={`${swapCoin === 1 && "tealActive"}`} onClick={() => setSwapCoin(1)}>VIRTUE</p></div>
   <span style={{ display: swapCoin === 0 ? 'block' : 'none' }}><SwapCoins tokenAddress={Data.petalToken} factoryAddress={Data.petalFactory} /></span>
   <span style={{ display: swapCoin === 1 ? 'block' : 'none' }}><SwapCoins tokenAddress={Data.virtueToken} factoryAddress={Data.virtueFactory} /></span>
	</>	
	);
	}