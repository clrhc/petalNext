'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import prediction from '../abis/prediction.json';
import dataFeed from '../abis/dataFeed.json';

export default function PredCoins({contractAddress, dataFeedAddress}: { contractAddress: string; dataFeedAddress: string }){

  type CurrentBid = {
  roundId: string;
  priceBid: string;
  priceBidTime: string;
  higher: boolean;
  amountBid: string;
  };
  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [ethBalance, setEthBalance] = useState(0);
  const [checkBid, setCheckBid] = useState(0);
  const [userBid, setUserBid] = useState<CurrentBid>({roundId: '0',priceBid: '0',priceBidTime: '0',higher: false,amountBid: '0'});
  const [epoch, setEpoch] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [roundAnswer, setRoundAnswer] = useState(0);
  const [previousAnswer, setPreviousAnswer] = useState(0);
  const [bidValue, setBidValue] = useState(0);
  const [bidState, setBidState] = useState(true);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const provider = new ethers.JsonRpcProvider('https://base-public.nodies.app');
  const predictionContract = new ethers.Contract(contractAddress, prediction.abi, provider);
  const dataFeedContract = new ethers.Contract(dataFeedAddress, dataFeed.abi, provider);
  type Address = `0x${string}`;

  useEffect(() =>{
  async function init(){
  if (isConnected) {

  try{
  const checkBidPromise  = predictionContract.checkBid(address);
  const userBidPromise   = predictionContract.userBid(address);
  const epochPromise    = predictionContract.epochCheck();
  const answerPromise   = dataFeedContract.latestAnswer();
  const roundPromise = dataFeedContract.latestRound();
  const ethBalancePromise = provider.getBalance(address!);

  const [
    checkBid_,
    userBid_,
    epoch_,
    answer_,
    round_,
    ethBalance_
  ] = await Promise.all([
    checkBidPromise,
    userBidPromise,
    epochPromise,
    answerPromise,
    roundPromise,
    ethBalancePromise
  ]);

  const previousRoundData_ = await dataFeedContract.getRoundData(round_-epoch_);
  if(Number(checkBid_) > 0){
    const getResultData_ = await dataFeedContract.getRoundData(userBid_.roundId+epoch_);
    setRoundAnswer(getResultData_.answer);
  }

  setEthBalance(Number(ethBalance_));
  setCheckBid(Number(checkBid_));
  setUserBid(userBid_);
  setEpoch(epoch_);
  setAnswer(answer_);
  setPreviousAnswer(previousRoundData_.answer);
}catch{};
}
}

    const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });

   const bidPrediction = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: prediction.abi,
        address: contractAddress as Address,
        functionName: 'bid',
        args: [ethers.parseUnits(String(bidValue)),bidState],
        value: ethers.parseUnits(String(bidValue)),
      });
    }
  }

   const resolveBid = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: prediction.abi,
        address: contractAddress as Address,
        functionName: 'resolveBid',
      });
    }
  }

  return(
    <>
    {Number(previousAnswer) > 0 ? <>
    {Number(userBid.roundId) === 0 ? <>
    <span style={{display: 'flex', justifyContent: 'space-between', width: '50%', margin: '0 auto'}}>
    <div className="ethPrice"><span><p>PREVIOUS</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(previousAnswer),8)).toFixed(2)}</h2></span></div>
    <div className="ethPrice"><span><p>CURRENT</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(answer),8)).toFixed(2)}</h2></span></div>
    </span>
    <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setBidValue(Number(e.target.value))} value={bidValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(6)} ETH</p>
   <div className="swapButtons"><p className={`${bidState && "tealActive"}`} onClick={() => setBidState(true)}>HIGHER</p><p className={`${!bidState && "tealActive"}`} onClick={() => setBidState(false)}>LOWER</p></div>
   <p style={{textAlign: 'center'}}>Next price in {epoch} epoch(s)</p> 
    <br/>
    {bidValue > 0 ? <><p onClick={() => bidPrediction()} className="enterButton pointer">Bid</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p><p style={{textAlign: 'center'}}>3% Tax</p><p style={{textAlign: 'center'}}>Win = Receive PETAL + WEED + ETH Back(-3% Tax)</p><p style={{textAlign: 'center'}}>Loss = Receive WEED + LOSE ETH</p></>:<>
    <span style={{display: 'grid', alignItems: 'center', margin: '0 auto', width: '50%'}}>
    <div className="ethPrice"><span><p>BID {userBid.higher ? <>HIGHER</>:<>LOWER</>}</p></span></div>
    <div className="bidPrice"><span><p>BID PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(userBid.priceBid),8)).toFixed(2)}</h2></span></div>
    <div className="bidPrice"><span><p>RESULT</p></span><span><h2>{checkBid === 0 ? <>PENDING</>:<>{Number(ethers.formatUnits(String(roundAnswer),8)).toFixed(2)}</>}</h2></span></div>
    </span>
    <span className="winnings"><p style={{textAlign: 'center'}}>WINNINGS</p><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBid.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p>{checkBid === 1 && <><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBid.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>{Number(ethers.formatUnits(userBid.amountBid, 18)).toFixed(4)} ETH</p></>}</span>
    {checkBid > 0 ? <><p onClick={() => resolveBid()} className="enterButton pointer">Resolve Bid</p>
    </>:<></>}
    </>}
    </>:<></>}
    </>
    )
}