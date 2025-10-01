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
 <div className="swapButtons"><p className={`${predState === 3 && "tealActive"}`} onClick={() => setPredState(3)}>BNB/USD</p><p className={`${predState === 4 && "tealActive"}`} onClick={() => setPredState(4)}>LTC/USD</p><p className={`${predState === 5 && "tealActive"}`} onClick={() => setPredState(5)}>SOL/USD</p></div>
<div className="swapButtons"><p className={`${predState === 6 && "tealActive"}`} onClick={() => setPredState(6)}>XRP/USD</p><p className={`${predState === 7 && "tealActive"}`} onClick={() => setPredState(7)}>DOGE/USD</p></div>  
    <p style={{textAlign: 'center'}}>Powered By Chainlink Datafeeds</p>
{predState === 0 && <><PredCoins contractAddress={Data.ethPrediction} dataFeedAddress={Data.ethusd} /></>}
{predState === 1 && <><PredCoins contractAddress={Data.btcPrediction} dataFeedAddress={Data.btcusd}  /></>}
{predState === 2 && <><PredCoins contractAddress={Data.linkPrediction} dataFeedAddress={Data.linkusd}  /></>}
{predState === 3 && <><PredCoins contractAddress={Data.bnbPrediction} dataFeedAddress={Data.bnbusd}  /></>}
{predState === 4 && <><PredCoins contractAddress={Data.ltcPrediction} dataFeedAddress={Data.ltcusd}  /></>}
{predState === 5 && <><PredCoins contractAddress={Data.solPrediction} dataFeedAddress={Data.solusd}  /></>}
{predState === 6 && <><PredCoins contractAddress={Data.xrpPrediction} dataFeedAddress={Data.xrpusd}  /></>}
{predState === 7 && <><PredCoins contractAddress={Data.dogePrediction} dataFeedAddress={Data.dogeusd}  /></>}
</>
);
}