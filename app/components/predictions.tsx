'use client';
import '../globals.css';
import React,{useState} from 'react';
import PredCoins from './predCoins';
import Data from '../data.json';

 export default function Predictions(){

   const [predState, setPredState] = useState(0);
 return(
   <>
 <div className="swapButtons"><p className={`${predState === 0 && "tealActive"}`} onClick={() => setPredState(0)}>ETH/USD</p><p className={`${predState === 1 && "tealActive"}`} onClick={() => setPredState(1)}>BTC/USD</p><p className={`${predState === 2 && "tealActive"}`} onClick={() => setPredState(2)}>LINK/USD</p></div>
    <p style={{textAlign: 'center'}}>Powered By Chainlink Datafeeds</p>
<span style={{ display: predState === 0 ? 'block' : 'none' }}><PredCoins contractAddress={Data.ethPrediction} dataFeedAddress={Data.ethusd} /></span>
<span style={{ display: predState === 1 ? 'block' : 'none' }}><PredCoins contractAddress={Data.btcPrediction} dataFeedAddress={Data.btcusd}  /></span>
<span style={{ display: predState === 2 ? 'block' : 'none' }}><PredCoins contractAddress={Data.linkPrediction} dataFeedAddress={Data.linkusd}  /></span>
</>
);
}