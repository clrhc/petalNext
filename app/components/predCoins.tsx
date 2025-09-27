'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from './wagmiConfig';
import {Abi, Address} from 'viem';
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
  const provider = new ethers.JsonRpcProvider(
  'https://base-mainnet.public.blastapi.io',
  { chainId: 8453, name: 'base' }   // <— key bit
  );

 useEffect(() => {
  if (!isConnected || !address) return;

  let unwatch: (() => void) | null = null;
  let running = false; // prevent overlapping reads

  const extractAnswer = (o: any): bigint => {
    // Chainlink getRoundData returns: [roundId, answer, startedAt, updatedAt, answeredInRound]
    // viem also exposes named props on the object in many setups
    if (o == null) return 0n;
    if (typeof o.answer === 'bigint') return o.answer;
    if (Array.isArray(o) && typeof o[1] === 'bigint') return o[1] as bigint;
    return 0n;
  };

  const init = async () => {
    if (running) return;
    running = true;

    try {
      // Primary batch
      const data = await readContracts(config, {
        contracts: [
          {
            address: contractAddress as Address,
            abi: prediction.abi as Abi,
            functionName: 'checkBid',
            args: [address as Address],
          },
          {
            address: contractAddress as Address,
            abi: prediction.abi as Abi,
            functionName: 'userBid',
            args: [address as Address],
          },
          {
            address: contractAddress as Address,
            abi: prediction.abi as Abi,
            functionName: 'epochCheck',
          },
          {
            address: dataFeedAddress as Address,
            abi: dataFeed.abi as Abi,
            functionName: 'latestAnswer',
          },
          {
            address: dataFeedAddress as Address,
            abi: dataFeed.abi as Abi,
            functionName: 'latestRound',
          },
        ],
        allowFailure: false, // returns raw decoded results
      });

      const [
        checkBid_,
        userBid_,
        epoch_,
        answer_,
        round_,
      ] = data as [
        bigint,                                       // checkBid
        [bigint, bigint, bigint, boolean, bigint],    // userBid
        bigint,                                       // epoch
        bigint,                                       // latestAnswer
        bigint                                        // latestRound
      ];

      // Wallet balance (keep as bigint until display)
      const ethBalance_ = await provider.getBalance(address!);

      // Follow-up read depending on whether user has a bid
      if (checkBid_ > 0n) {
        const targetRoundId = userBid_[0] + epoch_; // keep as bigint
        const roundData = await readContracts(config, {
          contracts: [
            {
              address: dataFeedAddress as Address,
              abi: dataFeed.abi as Abi,
              functionName: 'getRoundData',
              args: [targetRoundId],
            },
          ],
          allowFailure: false,
        });

        const [getResultData_] = roundData as [any];
        setRoundAnswer(Number(extractAnswer(getResultData_)));
      } else {
        const prevRoundId = round_ - epoch_;
        const previousData = await readContracts(config, {
          contracts: [
            {
              address: dataFeedAddress as Address,
              abi: dataFeed.abi as Abi,
              functionName: 'getRoundData',
              args: [prevRoundId],
            },
          ],
          allowFailure: false,
        });

        const [previousRoundData_] = previousData as [any];
        setPreviousAnswer(Number(extractAnswer(previousRoundData_)));
      }

      // Push UI state
      setEthBalance(Number(ethBalance_));
      setCheckBid(Number(checkBid_));
      setUserBid({
        roundId: userBid_[0].toString(),
        priceBid: userBid_[1].toString(),
        priceBidTime: userBid_[2].toString(),
        higher: userBid_[3],
        amountBid: userBid_[4].toString(),
      });
      setEpoch(Number(epoch_));
      setAnswer(Number(answer_));
    } catch {
      // optional: console.error(err);
    } finally {
      running = false;
    }
  };

  // initial load
  void init();

  // re-run on every new block
  unwatch = watchBlockNumber(config, {
    listen: true,
    onBlockNumber: () => { void init(); },
  });

  return () => {
    if (unwatch) unwatch();
  };
}, [isConnected, address, config, contractAddress, dataFeedAddress]);

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