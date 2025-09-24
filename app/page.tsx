'use client';
import './globals.css';
import React,{useState, useEffect, useRef} from 'react';
import Data from './data.json';
import Wallet from './wallet';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import referral from './abis/referral.json';
import prediction from './abis/prediction.json';
import rewards from './abis/rewards.json';
import dataFeed from './abis/dataFeed.json';
import factory from './abis/factory.json';
import token from './abis/token.json';
import nft from './abis/nft.json';
import uniswapRouter from './abis/uniswapRouter.json';
import implementation from './abis/implementation.json';
import petalLogo from './assets/img/petal.png';
import xpCoin from './assets/img/xpCoin.png';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ScatterController,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ScatterController, 
  Tooltip,
  Legend
);


export default function Home() {

  const ethers = require("ethers");
  const { address, isConnected } = useAccount();
  const {open} = useAppKit();
  const [baseId] = useState(11155111);
  const [userInfo, setUserInfo] = useState<[number, number, string, string, `0x${string}` | undefined]>([0, 0, '', '', undefined]);
  const [userRef, setUserRef] = useState("");
  const [newRef, setNewRef] = useState("");
  const [hoverWallet, setHoverWallet] = useState(false);
  const [tab, setTab] = useState(0);
  const [petalLaunched, setPetalLaunched] = useState(false);
  const [virtueLaunched, setVirtueLaunched] = useState(false);
  const [ethIn, setEthIn] = useState(0);
  const [virtueIn, setVirtueIn] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [petalBalance, setPetalBalance] = useState(0);
  const [virtueBalance, setVirtueBalance] = useState(0);
  const [weedBalance, setWeedBalance] = useState(0);
  const [methBalance, setMethBalance] = useState(0);
  const [nftBalance, setNftBalance]  = useState(0);
  const [rewardsAvailable, setRewardsAvailable] = useState(0);
  const [petalAllowance, setPetalAllowance] = useState(0);
  const [virtueAllowance, setVirtueAllowance] = useState(0);
  const [virtueRouterAllowance, setVirtueRouterAllowance] = useState(0);
  const [weedAllowance, setWeedAllowance] = useState(0);
  const [methAllowance, setMethAllowance] = useState(0);
  const [checkBidEth, setCheckBidEth] = useState(0);
  const [checkBidBtc, setCheckBidBtc] = useState(0);
  const [checkBidLink, setCheckBidLink] = useState(0);
  const [userBidEth, setUserBidEth] = useState([]);
  const [userBidBtc, setUserBidBtc] = useState([]);
  const [userBidLink, setUserBidLink] = useState([]);
  const [epochEth, setEpochEth] = useState(0);
  const [epochBtc, setEpochBtc] = useState(0);
  const [epochLink, setEpochLink] = useState(0);
  const [answerEth, setAnswerEth] = useState(0);
  const [answerBtc, setAnswerBtc] = useState(0);
  const [answerLink, setAnswerLink] = useState(0);
  const [roundAnswerEth, setRoundAnswerEth] = useState(0);
  const [roundAnswerBtc, setRoundAnswerBtc] = useState(0);
  const [roundAnswerLink, setRoundAnswerLink] = useState(0);
  const [previousAnswerEth, setPreviousAnswerEth] = useState(0);
  const [previousAnswerBtc, setPreviousAnswerBtc] = useState(0);
  const [previousAnswerLink, setPreviousAnswerLink] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [spotPrice, setSpotPrice] = useState(0);
  const [virtuePrice, setVirtuePrice] = useState(0);
  const [weedMethPrice, setWeedMethPrice] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [bidValue, setBidValue] = useState(0);
  const [sellValue, setSellValue] = useState(0);
  const [swapState, setSwapState] = useState(0);
  const [swapCoin, setSwapCoin] = useState(0);
  const [swapMeme, setSwapMeme] = useState(0);
  const [predState, setPredState] = useState(0);
  const [bidState, setBidState] = useState(true);
  const [userCheck, setUserCheck] = useState(false);
  const [newCheck, setNewCheck] = useState(false);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const referralContract = new ethers.Contract(Data.referralAddress, referral.abi, provider);
  const ethPredictionContract = new ethers.Contract(Data.ethPrediction, prediction.abi, provider);
  const btcPredictionContract = new ethers.Contract(Data.btcPrediction, prediction.abi, provider);
  const linkPredictionContract = new ethers.Contract(Data.linkPrediction, prediction.abi, provider);
  const ethusdContract = new ethers.Contract(Data.ethusd, dataFeed.abi, provider);
  const btcusdContract = new ethers.Contract(Data.btcusd, dataFeed.abi, provider);
  const linkusdContract = new ethers.Contract(Data.linkusd, dataFeed.abi, provider);
  const petalContract = new ethers.Contract(Data.petalToken, implementation.abi, provider);
  const virtueContract = new ethers.Contract(Data.virtueToken, implementation.abi, provider);
  const virtueFactory = new ethers.Contract(Data.virtueFactory, factory.abi, provider);
  const factoryContract = new ethers.Contract(Data.petalFactory, factory.abi, provider);
  const methContract = new ethers.Contract(Data.METH, token.abi, provider);
  const rewardsContract = new ethers.Contract(Data.petalRewards, rewards.abi, provider);
  const sekaiContract = new ethers.Contract(Data.virtueNFT, nft.abi, provider);
  const uniswapRouterContract = new ethers.Contract(Data.uniswapRouter, uniswapRouter.abi, provider);
  const chartRef = useRef(null);

  useEffect(() =>{
    async function init(){
     
if (isConnected) {
     try{
  let userInfoPromise       = referralContract.userInfo(address);
  let checkUserRefPromise   = referralContract.refStore(userRef);
  let checkNewRefPromise    = referralContract.refStore(newRef);
 
  let [
    userInfo_,
    checkUserRef_,
    checkNewRef_
  ] = await Promise.all([
    userInfoPromise,
    checkUserRefPromise,
    checkNewRefPromise
  ]);

  checkUserRef_ = String(checkUserRef_);
  checkNewRef_  = String(checkNewRef_);

  setUserInfo([
    Number(userInfo_[0]),
    Number(userInfo_[1]),
    String(userInfo_[2]),
    String(userInfo_[3]),
    address
  ]);

  setUserCheck(checkUserRef_ !== "0x0000000000000000000000000000000000000000");
  setNewCheck (checkNewRef_  !== "0x0000000000000000000000000000000000000000");}catch(error){};

   try{
  let ethBalancePromise     = provider.getBalance(address);
  let petalBalancePromise   = petalContract.balanceOf(address);
  let petalLaunchedPromise =  factoryContract.tokenLaunched(Data.petalToken);
  let petalAllowancePromise = petalContract.allowance(address, Data.petalFactory);
  let petalRouterAllowancePromise = petalContract.allowance(address, Data.uniswapRouter);
  let petalCurvePromise = factoryContract.bondingCurves(Data.petalToken);
  let [
    ethBalance_,
    petalBalance_,
    petalLaunched_,
    petalAllowance_,
    petalRouterAllowance_,
    petalCurve_
  ] = await Promise.all([
    ethBalancePromise,
    petalBalancePromise,
    petalLaunchedPromise,
    petalAllowancePromise,
    petalRouterAllowancePromise,
    petalCurvePromise
  ]);

  if(petalLaunched_){
  let petalEthPricePromise = await uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[Data.petalToken,Data.WETH]);
  setSpotPrice(petalEthPricePromise[1]);
  setPetalAllowance(petalRouterAllowance_);
  }else{
  setSpotPrice(petalCurve_[6]);
  setPetalAllowance(petalAllowance_);
  }

  setEthBalance(ethBalance_);
  setPetalBalance(petalBalance_);
  setPetalLaunched(petalLaunched_);
  }catch(error){};

    try{
  let virtueBalancePromise   = virtueContract.balanceOf(address);
  let virtueLaunchedPromise = virtueFactory.tokenLaunched(Data.virtueToken);
  let virtueAllowancePromise = virtueContract.allowance(address, Data.virtueFactory);
  let virtueRouterAllowancePromise = virtueContract.allowance(address, Data.uniswapRouter);
  let virtueCurvePromise = virtueFactory.bondingCurves(Data.virtueToken);
  let virtueInPromise = virtueFactory.bondingCurves(Data.virtueToken);
  let [
    virtueBalance_,
    virtueLaunched_,
    virtueAllowance_,
    virtueRouterAllowance_,
    virtueCurve_,
    virtueIn_
  ] = await Promise.all([
    virtueBalancePromise,
    virtueLaunchedPromise,
    virtueAllowancePromise,
    virtueRouterAllowancePromise,
    virtueCurvePromise,
    virtueInPromise
  ]);

  if(virtueLaunched_){
  let virtueEthPricePromise = await uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[Data.virtueToken,Data.WETH]);
  setVirtuePrice(virtueEthPricePromise[1]);
  setVirtueAllowance(virtueRouterAllowance_);
  }else{
  setVirtueAllowance(virtueAllowance_);
  setVirtuePrice(virtueCurve_[6]);
  }

  setVirtueBalance(virtueBalance_);
  setVirtueLaunched(virtueLaunched_);
  setVirtueIn(Number(virtueCurve_[2]));
  }catch(error){};

    try{
  let weedBalancePromise     = factoryContract.balanceOf(address);
  let weedAllowancePromise   = factoryContract.allowance(address, Data.uniswapRouter);
  let weedMethPricePromise = uniswapRouterContract.getAmountsOut(ethers.parseUnits(String(1)),[Data.METH, Data.petalFactory]);
  let methBalancePromise = methContract.balanceOf(address);
  let methAllowancePromise = methContract.allowance(address, Data.uniswapRouter);
  let [
    weedBalance_,
    weedAllowance_,
    weedMethPrice_,
    methBalance_,
    methAllowance_
  ] = await Promise.all([
    weedBalancePromise,
    weedAllowancePromise,
    weedMethPricePromise,
    methBalancePromise,
    methAllowancePromise
  ]);

  setWeedBalance(weedBalance_);
  setWeedAllowance(weedAllowance_);
  setWeedMethPrice(weedMethPrice_[1]);
  setMethBalance(methBalance_);
  setMethAllowance(methAllowance_);
  }catch(error){};

  try{
  let checkBidPromiseEth  = ethPredictionContract.checkBid(address);
  let userBidPromiseEth   = ethPredictionContract.userBid(address);
  let epochPromiseEth     = ethPredictionContract.epochCheck();
  let answerPromiseEth    = ethusdContract.latestAnswer();
  let roundPromiseEth = ethusdContract.latestRound();
  let [
    checkBidEth_,
    userBidEth_,
    epochEth_,
    answerEth_,
    roundEth_
  ] = await Promise.all([
    checkBidPromiseEth,
    userBidPromiseEth,
    epochPromiseEth,
    answerPromiseEth,
    roundPromiseEth
  ]);

  let previousRoundDataEth_ = await ethusdContract.getRoundData(roundEth_-epochEth_);
  if(Number(checkBidEth_) > 0){
    let getResultDataEth_ = await ethusdContract.getRoundData(userBidEth_.roundId+epochEth_);
    setRoundAnswerEth(getResultDataEth_.answer);
  }
  setCheckBidEth(Number(checkBidEth_));
  setUserBidEth(userBidEth_);
  setEpochEth(epochEth_);
  setAnswerEth(answerEth_);
  setPreviousAnswerEth(previousRoundDataEth_.answer);}catch(error){};
  try{
  let checkBidPromiseBtc  = btcPredictionContract.checkBid(address);
  let userBidPromiseBtc   = btcPredictionContract.userBid(address);
  let epochPromiseBtc     = btcPredictionContract.epochCheck();
  let answerPromiseBtc    = btcusdContract.latestAnswer();
  let roundPromiseBtc = btcusdContract.latestRound();
    let [
    checkBidBtc_,
    userBidBtc_,
    epochBtc_,
    answerBtc_,
    roundBtc_
  ] = await Promise.all([
    checkBidPromiseBtc,
    userBidPromiseBtc,
    epochPromiseBtc,
    answerPromiseBtc,
    roundPromiseBtc
  ]);

  let previousRoundDataBtc_ = await btcusdContract.getRoundData(roundBtc_-epochBtc_);
  if(Number(checkBidBtc_) > 0){
    let getResultDataBtc_ = await btcusdContract.getRoundData(userBidBtc_.roundId+epochBtc_);
    setRoundAnswerBtc(getResultDataBtc_.answer);
  }
  setCheckBidBtc(Number(checkBidBtc_));
  setUserBidBtc(userBidBtc_);
  setEpochBtc(epochBtc_);
  setAnswerBtc(answerBtc_);
  setPreviousAnswerBtc(previousRoundDataBtc_.answer);}catch(error){}
  try{
  let checkBidPromiseLink  = linkPredictionContract.checkBid(address);
  let userBidPromiseLink   = linkPredictionContract.userBid(address);
  let epochPromiseLink     = linkPredictionContract.epochCheck();
  let answerPromiseLink    = linkusdContract.latestAnswer();
  let roundPromiseLink = linkusdContract.latestRound();
    let [
    checkBidLink_,
    userBidLink_,
    epochLink_,
    answerLink_,
    roundLink_
  ] = await Promise.all([
    checkBidPromiseLink,
    userBidPromiseLink,
    epochPromiseLink,
    answerPromiseLink,
    roundPromiseLink
  ]);

  let previousRoundDataLink_ = await linkusdContract.getRoundData(roundLink_-epochLink_);
  if(Number(checkBidLink_) > 0){
    let getResultDataLink_ = await linkusdContract.getRoundData(userBidLink_.roundId+epochLink_);
    setRoundAnswerLink(getResultDataLink_.answer);
  }
  setCheckBidLink(Number(checkBidLink_));
  setUserBidLink(userBidLink_);
  setEpochLink(epochLink_);
  setAnswerLink(answerLink_);
  setPreviousAnswerLink(previousRoundDataLink_.answer);}catch(error){};
      try{
  let nftBalancePromise  = sekaiContract.balanceOf(address);
  let rewardsPromise = rewardsContract.checkRewards(address);

  let[
  nftBalance_,
  rewards_
] = await Promise.all([
  nftBalancePromise,
  rewardsPromise
]);
  setNftBalance(Number(nftBalance_));
  setRewardsAvailable(Number(rewards_));
}catch(error){};
}
  try{
  let bondingCurve_ = await factoryContract.bondingCurves(Data.petalToken);
  let tokenVirtualReserve = Number(bondingCurve_[1]);
  let ethVirtualReserve = Number(bondingCurve_[4]);
  setEthIn(Number(bondingCurve_[2]));

  if (bondingCurve_[6] === spotPrice) {

  } else {
  const dataPoints = 1000;
  const maxTokens = 10_000_000;

  const tokensBought: number[] = [];
  const prices: number[] = [];

  for (let i = 1; i <= dataPoints; i++) {
    const deltaTokens = (i * maxTokens * 10 ** 18) / dataPoints; // in wei
    const remainingVirtual = tokenVirtualReserve - deltaTokens;

    if (remainingVirtual <= 0) break;

    const pricePerToken = Number(ethVirtualReserve * 10 ** 18 / remainingVirtual) / 1e18;

    tokensBought.push(Number(deltaTokens / 10 ** 18).toFixed(0)); // Convert to normal tokens
    prices.push(pricePerToken); // ETH price
  }

  const ctx = document.getElementById('bondingCurveChart').getContext('2d');

  if (chartRef.current) {
    chartRef.current.destroy();
  }

  chartRef.current = new Chart(ctx, {
    type: 'line',
    data: {
      labels: tokensBought,
      datasets: [
        {
          label: 'Spot Price (ETH)',
          data: prices,
          borderColor: 'teal',
          backgroundColor: 'rgba(0, 128, 128, 0.1)',
          borderWidth: 4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'PETAL Bought',
            color: '#ccc',
          },
          ticks: { color: '#aaa' },
          grid: { color: '#333' },
        },
        y: {
          title: {
            display: true,
            text: 'PETAL Price (ETH)',
            color: '#ccc',
          },
          ticks: {
            color: '#aaa',
            callback: function (value) {
              return parseFloat(value).toFixed(10);
            },
          },
          grid: { color: '#333' },
        },
      },
      plugins: {
        legend: { labels: { color: '#eee' } },
        tooltip: {
          callbacks: {
            label: function (context) {
              const price = context.parsed.y;
              return `Price: ${price.toFixed(10)} ETH`;
            },
          },
        },
      },
    },
  });
}}catch(error){};
}

    const interval = setInterval(() => init(), 1000);
      return () => {
      clearInterval(interval);
      }
  });

  const checkRef = (e) => {
    let input = e.target.value;
    const regex = /^[a-zA-Z0-9]*$/;
    setError(!regex.test(input));
  }

   const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      if(networkId === baseId){
         await writeContract({ 
          abi: referral.abi,
          address: Data.referralAddress,
          functionName: 'register',
          args: [userRef,newRef],
       });}
      }
    };

   const register = async () => {
       if(networkId === baseId){
         await writeContract({ 
          abi: referral.abi,
          address: Data.referralAddress,
          functionName: 'register',
          args: [userRef,newRef],
       });}
   };

  const buyToken = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.petalFactory,
        functionName: 'buy',
        args: [Data.petalToken, ethers.parseUnits((buyValue / (Number(spotPrice) / 1e18) - (((buyValue / (Number(spotPrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(spotPrice) / 1e18)) / 100) * slippage)).toFixed(18),18), address],
        value: ethers.parseUnits(String(buyValue)),
      });
    }
  }

    const sellToken = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.petalFactory,
        functionName: 'sell',
        args: [Data.petalToken, ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(spotPrice) / 1e18) - ((sellValue * (Number(spotPrice) / 1e18) / 100) * 3) - ((sellValue * (Number(spotPrice) / 1e18) / 100) * slippage)).toFixed(18),18), address],
      })
    }
  }

    const buyVirtue = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.virtueFactory,
        functionName: 'buy',
        args: [Data.virtueToken, ethers.parseUnits((buyValue / (Number(virtuePrice) / 1e18) - (((buyValue / (Number(virtuePrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(virtuePrice) / 1e18)) / 100) * slippage)).toFixed(18),18), address],
        value: ethers.parseUnits(String(buyValue)),
      });
    }
  }

    const sellVirtue = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.virtueFactory,
        functionName: 'sell',
        args: [Data.virtueToken, ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(virtuePrice) / 1e18) - ((sellValue * (Number(virtuePrice) / 1e18) / 100) * 3) - ((sellValue * (Number(virtuePrice) / 1e18) / 100) * slippage)).toFixed(18),18), address],
      });
    }
  }

    const bidPrediction = async (predContract) => {
    if(networkId === baseId){
      await writeContract({
        abi: prediction.abi,
        address: predContract,
        functionName: 'bid',
        args: [ethers.parseUnits(String(bidValue)),bidState],
        value: ethers.parseUnits(String(bidValue)),
      });
    }
  }

   const resolveBid = async (predContract) => {
    if(networkId === baseId){
      await writeContract({
        abi: prediction.abi,
        address: predContract,
        functionName: 'resolveBid',
      });
    }
  }

   const claimRewards = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: rewards.abi,
        address: Data.petalRewards,
        functionName: 'claimRewards',
      });
    }
  }

   const approveToken = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.petalToken,
        functionName: 'approve',
        args: [Data.petalFactory, ethers.parseUnits(String(100000000))],
      });
    }
  }

     const approveVirtue = async () => {
    if(networkId === baseId){
      await writeContract({
        abi: factory.abi,
        address: Data.virtueToken,
        functionName: 'approve',
        args: [Data.virtueFactory, ethers.parseUnits(String(100000000000))],
      });
    }
  }

    const approveRouter = async (contract) => {
      if(networkId === baseId){
        await writeContract({
          abi: token.abi,
          address: contract,
          functionName: 'approve',
          args: [Data.uniswapRouter, ethers.parseUnits(String(1000000000))],
        });
      }
    }

    const buyRouter = async (contract) => {
  if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi,
        address: Data.uniswapRouter,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(buyValue)), ethers.parseUnits((buyValue / (Number(weedMethPrice) / 1e18) - (((buyValue / (Number(weedMethPrice) / 1e18)) / 100) * slippage)).toFixed(18),18), [Data.petalFactory, contract], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        });
      }
    };

     const sellRouter = async (contract) => {
  if (networkId === baseId) {
      await writeContract({
        abi: uniswapRouter.abi,
        address: Data.uniswapRouter,
        functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(weedMethPrice) / 1e18) - ((sellValue * (Number(weedMethPrice) / 1e18) / 100) * slippage)).toFixed(18),18), [contract, Data.petalFactory], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        });
      }
    };

    const sellEth = async (contract) => {
      if(networkId === baseId){
        await writeContract({
          abi: uniswapRouter.abi,
          address: Data.uniswapRouter,
          functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits(String(sellValue)), ethers.parseUnits((sellValue * (Number(virtuePrice) / 1e18) - ((sellValue * (Number(virtuePrice) / 1e18) / 100) * 3) - ((sellValue * (Number(virtuePrice) / 1e18) / 100) * slippage)).toFixed(18),18), [contract, Data.WETH], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
        })
      }
    }

      const buyEth = async (contract) => {
      if(networkId === baseId){
        await writeContract({
          abi: uniswapRouter.abi,
          address: Data.uniswapRouter,
          functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
          args: [ethers.parseUnits((buyValue / (Number(virtuePrice) / 1e18) - (((buyValue / (Number(virtuePrice) / 1e18)) / 100) * 3 + ((buyValue / (Number(virtuePrice) / 1e18)) / 100) * slippage)).toFixed(18),18), [Data.WETH, contract], address, String(Number((Date.now()/1000)+10000).toFixed(0))],
          value: ethers.parseUnits(String(buyValue)),
        })
      }
    }

  useEffect(() => {
    if(userInfo.length === 5 & address === userInfo[3]){
    let displayStat = document.getElementById('displayStat');
    let walletSpan = document.getElementById('walletSpan');
    if(hoverWallet){
      displayStat.style.display = 'initial';
      walletSpan.style.borderBottom = 'transparent';
      walletSpan.style.borderBottomLeftRadius = '0px';
      walletSpan.style.borderBottomRightRadius = '0px';
    }else{
      displayStat.style.display = 'none';
      displayStat.style.border = '2px solid rgba(0, 255, 255, 0.8)';
      displayStat.style.borderTop = 'transparent';
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.1)';
      walletSpan.style.borderBottomLeftRadius = '12px';
      walletSpan.style.borderBottomRightRadius = '12px';
    }
  }else{
    let walletSpan = document.getElementById('walletSpan');
    if(hoverWallet){
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.8)';
    }else{
      walletSpan.style.borderBottom = '2px solid rgba(0, 255, 255, 0.1)';
      walletSpan.style.borderBottomLeftRadius = '12px';
      walletSpan.style.borderBottomRightRadius = '12px';
    }
  }
  });

   useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 960) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Set the initial value based on the current window size
    handleResize();

    // Add the event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

	return(
	<>
      <header>
          {isConnected ? <>{userInfo.length === 5 ? <>
  {userInfo[4] !== address && <><div id="loading-bar"></div></>}
  </>:<>
  <div id="loading-bar"></div>
  </>}</>:<></>}
  <div className="nav"><span className="logoSpan"><img alt="petalLogo" className="logo" src={petalLogo.src} /><h2 className="logoText">PETAL</h2></span>{userInfo.length === 5 & address === userInfo[3] ? <><span className="xpNav"><p>{userInfo[1]}</p><img alt="xpCoin" src={xpCoin.src} /></span></>:<></>}<span className="walletButtons pointer" id="walletSpan" onClick={() => open()} onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><Wallet /></span>
    {userInfo.length === 5 & address === userInfo[3] ? <><span className="userStats" id="displayStat" onMouseOver={() => setHoverWallet(true)} onMouseOut={() => setHoverWallet(false)}><p>ID:
    {userInfo[0] < 10 && " 00"}
    {userInfo[0] >= 10 && <>{userInfo[0] < 100 ? <>{String(" 0")}</>:<></>}</>}
    {userInfo[0]}</p>
    <p>Ref: {userInfo[2]}</p></span>
    </>:<></>}</div>
  <div className="homeHeader">
    <span className="heading">
    <h2>WELCOME TO PETAL FINANCE</h2>
    <p>V2 DeFi and Meme Market</p>
    <img alt="petalLogo" src={petalLogo.src} /></span>
      {!isMobile && <> <div><canvas id="bondingCurveChart"></canvas></div>
      <div className="coinInfo">
      <p>Price: {Number(Number(spotPrice) / 10 ** 18).toFixed(10)} ETH</p>
      {!petalLaunched && <><p>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      <p>Fees go to airdrops prior to bond and WEED liquidity on bonding of PETAL</p>
      <p>Airdrop eligibility is based on PETAL held + volume on meme markets</p>
      <p>Collect WEED to use on our meme markets - based on net positive buys to the PETAL bonding curve</p>
      <p>WEED multiplier 3x of your net PETAL buys</p>
      <p>3% global tax on everything except meme markets</p>
      </div></>}
    {isConnected ? <>
    <div className="menuButtons">
      <p className={`${tab === 0 && "tealActive botBor"}`} onClick={() => setTab(0)}>Referral</p>
      <p className={`${tab === 1 && "tealActive botBor"}`}  onClick={() => setTab(1)}>Swap</p>
      <p className={`${tab === 2 && "tealActive botBor"}`}  onClick={() => setTab(2)}>Memes</p>
      <p className={`${tab === 3 && "tealActive botBor"}`}  onClick={() => setTab(3)}>Prediction</p>
      <p className={`${tab === 4 && "tealActive botBor"}`}  onClick={() => setTab(4)}>Rewards</p></div>
    <div className="refDiv">
    {tab === 0 && <>{userInfo[0] < 1 ? <><span>You have yet to register. Begin by using a referral and creating your own referral code. Default referral: PETAL</span>
    <span>Get rewarded VIRTUE, PETAL and WEED on registration</span>
    <input id="refInput" className={`inputBox inputBox inputText userText ${userRef.length > 0 ? !error & userCheck ? "outlineGreen" : "outlineRed": "outlineTeal"}`} placeholder="User Referral" onChange={(e) => {checkRef(e);setUserRef(e.target.value)}} value={userRef} type="text" />
    {userRef.length > 0 && <>{!error && <>{userCheck ? <><p className="rightSide" style={{color: 'green'}}>Is Valid</p></>:<><p className="rightSide" style={{color: 'red'}}>Referral Does Not Exist</p></>}</>}</>}
    <input className={`inputBox inputText newText ${newRef.length > 0 ? !error & newCheck ? "outlineRed" : "outlineGreen" : "outlineTeal"}`} id="refInput" placeholder="Create Your Referral" onChange={(e) => {checkRef(e);setNewRef(e.target.value)}} value={newRef}  onKeyDown={(e) => handleKeyDown(e)} type="text" />
    {newRef.length > 0 && <>{!error && <>{newCheck ? <><p className="rightSide" style={{color: 'red'}}>Referral Already Taken</p></>:<><p className="rightSide" style={{color: 'green'}}>Referral Code Available</p></>}</>}</>}
    {error && <p>Referral can only contain letters and numbers (no spaces)</p>}
    {userRef.length > 0 & newRef.length > 0 & !error & userCheck & !newCheck ? <><p onClick={() => register()} className="enterButton pointer">Enter</p></>:<></>}
    </>:<>
    {userInfo.length === 5 && <><div className="refInfo">
    <h3>ID:
    {userInfo[0] < 10 && " 00"}
    {userInfo[0] >= 10 && <>{userInfo[0] < 100 ? <>{String(" 0")}</>:<></>}</>}
    {userInfo[0]}</h3>
    <span className="xpText"><h3>XP: {userInfo[1]}</h3><img alt="xpCoin" src={xpCoin.src} /></span>
    <h3>Ref: {userInfo[2]}</h3>
    <h3>Address: {address}</h3>
    <h3>Collect XP for future rewards!</h3></div></>}
    </>}</>}
    {tab === 1 && <>
     <div className="swapButtons"><p className={`${swapCoin === 0 && "tealActive"}`} onClick={() => setSwapCoin(0)}>PETAL</p><p className={`${swapCoin === 1 && "tealActive"}`} onClick={() => setSwapCoin(1)}>VIRTUE</p></div>
   {swapCoin === 0 && <><div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy PETAL</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell PETAL</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onChange={(e) => setSlippage(e.target.value)} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
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
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onChange={(e) => setBuyValue(e.target.value)} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    PETAL
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 PETAL" value={String(Number(buyValue / (Number(spotPrice) / 1e18)-((buyValue / (Number(spotPrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(petalBalance), 18)).toFixed(2)} PETAL</p>
    {buyValue.length > 0 ? <><p onClick={() => petalLaunched ? buyEth(Data.petalToken) : buyToken()} className="enterButton pointer">Buy</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(spotPrice) / 10 ** 18)).toFixed(4)} PETAL</p>
    <p style={{textAlign: 'center'}}>3% Tax</p>
    {!petalLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    PETAL
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 PETAL" onChange={(e) => setSellValue(e.target.value)} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(petalBalance), 18)).toFixed(2)} PETAL</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 ETH" value={String(Number(sellValue * (Number(spotPrice) / 1e18)-((sellValue * (Number(spotPrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
    {sellValue.length > 0 ? <>
    {sellValue*10**18 > petalAllowance ? <><p onClick={() => petalLaunched ? approveRouter(Data.petalToken) : approveToken()} className="enterButton pointer">Approve</p></>:<><p onClick={() => petalLaunched ? sellRouter(Data.petalToken) : sellToken()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 PETAL = {Number(Number(spotPrice) / 10 ** 18).toFixed(10)} ETH</p>
      <p style={{textAlign: 'center'}}>3% Tax</p>
      {!petalLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      </>}</>}
    {swapCoin === 1 && <><div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy VIRTUE</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell VIRTUE</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onChange={(e) => setSlippage(e.target.value)} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
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
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onChange={(e) => setBuyValue(e.target.value)} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    VIRTUE
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 VIRTUE" value={String(Number(buyValue / (Number(virtuePrice) / 1e18)-((buyValue / (Number(virtuePrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(virtueBalance), 18)).toFixed(2)} VIRTUE</p>
    {buyValue.length > 0 ? <><p onClick={() => virtueLaunched ? buyEth(Data.virtueToken) : buyVirtue()} className="enterButton pointer">Buy</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(virtuePrice) / 10 ** 18)).toFixed(4)} VIRTUE</p>
    <p style={{textAlign: 'center'}}>3% Tax</p>
    {!virtueLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(virtueIn), 18)).toFixed(3)} / 4 ETH</p></>}
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    VIRTUE
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 VIRTUE" onChange={(e) => setSellValue(e.target.value)} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(virtueBalance), 18)).toFixed(2)} VIRTUE</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 ETH" value={String(Number(sellValue * (Number(virtuePrice) / 1e18)-((sellValue * (Number(virtuePrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
    {sellValue.length > 0 ? <>
    {sellValue*10**18 > virtueAllowance ? <><p onClick={() => virtueLaunched ? approveRouter(Data.virtueToken) : approveVirtue()} className="enterButton pointer">Approve</p></>:<><p onClick={() => virtueLaunched ? sellEth(Data.virtueToken) : sellVirtue()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 VIRTUE = {Number(Number(virtuePrice) / 10 ** 18).toFixed(10)} ETH</p>
      <p style={{textAlign: 'center'}}>3% Tax</p>
      {!virtueLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(virtueIn), 18)).toFixed(3)} / 4 ETH</p></>}
      </>}</>}
        </>}
      {tab === 2 &&<>
      <div className="swapButtons"><p className={`${swapMeme === 0 && "tealActive"}`} onClick={() => setSwapMeme(0)}>METH</p><p className={`${swapMeme === 1 && "tealActive"}`} onClick={() => setSwapMeme(1)}>CATGIRL</p><p className={`${swapMeme === 2 && "tealActive"}`} onClick={() => setSwapMeme(2)}>FEMBOY</p></div>
      <div className="swapButtons"><p className={`${swapMeme === 3 && "tealActive"}`} onClick={() => setSwapMeme(3)}>FENT</p><p className={`${swapCoin === 4 && "tealActive"}`} onClick={() => setSwapMeme(4)}>🧀</p><p className={`${swapMeme === 5 && "tealActive"}`} onClick={() => setSwapMeme(5)}>🪲</p></div>
       {swapMeme === 0 && <><div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy METH</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell METH</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onChange={(e) => setSlippage(e.target.value)} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
    <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    WEED
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 WEED" onChange={(e) => setBuyValue(e.target.value)} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(weedBalance), 18)).toFixed(2)} WEED</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    METH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 METH" value={String(Number(buyValue / (Number(weedMethPrice) / 1e18)).toFixed(8))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(methBalance), 18)).toFixed(2)} METH</p>
    {buyValue.length > 0 ? <>
    {buyValue*10**18 > weedAllowance ? <><p onClick={() => approveRouter(Data.petalFactory)} className="enterButton pointer">Approve</p></>:<><p onClick={() => buyRouter(Data.METH)} className="enterButton pointer">Buy</p></>}
    </>:<></>}<p style={{textAlign: 'center'}}>1 WEED = {Number(1/Number(Number(weedMethPrice) / 10 ** 18)).toFixed(4)} METH</p>
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    METH
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 METH" onChange={(e) => setSellValue(e.target.value)} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(methBalance), 18)).toFixed(2)} METH</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    WEED
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 WEED" value={String(Number(sellValue * (Number(weedMethPrice) / 1e18)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(weedBalance), 18)).toFixed(2)} WEED</p>
    {sellValue.length > 0 ? <>
    {sellValue*10**18 > methAllowance ? <><p onClick={() => approveRouter(Data.METH)} className="enterButton pointer">Approve</p></>:<><p onClick={() => sellRouter(Data.METH)} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 METH = {Number(Number(weedMethPrice) / 10 ** 18).toFixed(10)} WEED</p>
      </>}</>}
      </>}
      {tab === 3 && <>
    <div className="swapButtons"><p className={`${predState === 0 && "tealActive"}`} onClick={() => setPredState(0)}>ETH/USD</p><p className={`${predState === 1 && "tealActive"}`} onClick={() => setPredState(1)}>BTC/USD</p><p className={`${predState === 2 && "tealActive"}`} onClick={() => setPredState(2)}>LINK/USD</p></div>
    <p style={{textAlign: 'center'}}>Powered By Chainlink Datafeeds</p>
    {predState === 0 && <>
    {Number(previousAnswerEth) > 0 ? <>
    {Number(userBidEth.roundId) === 0 ? <>
    <span style={{display: 'flex', justifyContent: 'space-between', width: '50%', margin: '0 auto'}}>
    <div className="ethPrice"><span><p>PREVIOUS</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(previousAnswerEth),8)).toFixed(2)}</h2></span></div>
    <div className="ethPrice"><span><p>CURRENT</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(answerEth),8)).toFixed(2)}</h2></span></div>
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
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onChange={(e) => setBidValue(e.target.value)} value={bidValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
   <div className="swapButtons"><p className={`${bidState && "tealActive"}`} onClick={() => setBidState(true)}>HIGHER</p><p className={`${!bidState && "tealActive"}`} onClick={() => setBidState(false)}>LOWER</p></div>
   <p style={{textAlign: 'center'}}>Next price in {epochEth} epoch(s)</p> 
    <br/>
    {bidValue.length > 0 ? <><p onClick={() => bidPrediction(Data.ethPrediction)} className="enterButton pointer">Bid</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p><p style={{textAlign: 'center'}}>3% Tax</p><p style={{textAlign: 'center'}}>Win = Receive PETAL + WEED + ETH Back(-3% Tax)</p><p style={{textAlign: 'center'}}>Loss = Receive WEED + LOSE ETH</p></>:<>
    <span style={{display: 'grid', alignItems: 'center', margin: '0 auto', width: '50%'}}>
    <div className="ethPrice"><span><p>BID {userBidEth.higher ? <>HIGHER</>:<>LOWER</>}</p></span></div>
    <div className="bidPrice"><span><p>BID PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(userBidEth.priceBid),8)).toFixed(2)}</h2></span></div>
    <div className="bidPrice"><span><p>RESULT</p></span><span><h2>{checkBidEth === 0 ? <>PENDING</>:<>{Number(ethers.formatUnits(String(roundAnswerEth),8)).toFixed(2)}</>}</h2></span></div>
    </span>
    <span className="winnings"><p style={{textAlign: 'center'}}>WINNINGS</p><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidEth.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p>{checkBidEth === 1 && <><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidEth.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>{Number(ethers.formatUnits(userBidEth.amountBid, 18)).toFixed(4)} ETH</p></>}</span>
    {checkBidEth > 0 ? <><p onClick={() => resolveBid(Data.ethPrediction)} className="enterButton pointer">Resolve Bid</p>
    </>:<></>}
    </>}
    </>:<></>}
    </>}
    {predState === 1 && <>
        {Number(previousAnswerBtc) > 0 ? <>
      {Number(userBidBtc.roundId) === 0 ? <>
    <span style={{display: 'flex', justifyContent: 'space-between', width: '50%', margin: '0 auto'}}>
    <div className="ethPrice"><span><p>PREVIOUS</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(previousAnswerBtc),8)).toFixed(2)}</h2></span></div>
    <div className="ethPrice"><span><p>CURRENT</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(answerBtc),8)).toFixed(2)}</h2></span></div>
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
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onChange={(e) => setBidValue(e.target.value)} value={bidValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
   <div className="swapButtons"><p className={`${bidState && "tealActive"}`} onClick={() => setBidState(true)}>HIGHER</p><p className={`${!bidState && "tealActive"}`} onClick={() => setBidState(false)}>LOWER</p></div>
   <p style={{textAlign: 'center'}}>Next price in {epochBtc} epoch(s)</p> 
    <br/>
    {bidValue.length > 0 ? <><p onClick={() => bidPrediction(Data.btcPrediction)} className="enterButton pointer">Bid</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p><p style={{textAlign: 'center'}}>3% Tax</p><p style={{textAlign: 'center'}}>Win = Receive PETAL + WEED + ETH Back(-3% Tax)</p><p style={{textAlign: 'center'}}>Loss = Receive WEED + LOSE ETH</p></>:<>
    <span style={{display: 'grid', alignItems: 'center', margin: '0 auto', width: '50%'}}>
    <div className="ethPrice"><span><p>BID {userBidBtc.higher ? <>HIGHER</>:<>LOWER</>}</p></span></div>
    <div className="bidPrice"><span><p>BID PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(userBidBtc.priceBid),8)).toFixed(2)}</h2></span></div>
    <div className="bidPrice"><span><p>RESULT</p></span><span><h2>{checkBidBtc === 0 ? <>PENDING</>:<>{Number(ethers.formatUnits(String(roundAnswerBtc),8)).toFixed(2)}</>}</h2></span></div>
    </span>
    <span className="winnings"><p style={{textAlign: 'center'}}>WINNINGS</p><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidBtc.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p>{checkBidBtc === 1 && <><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidBtc.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>{Number(ethers.formatUnits(userBidBtc.amountBid, 18)).toFixed(4)} ETH</p></>}</span>
    {checkBidBtc > 0 ? <><p onClick={() => resolveBid(Data.btcPrediction)} className="enterButton pointer">Resolve Bid</p>
    </>:<></>}
    </>}
    </>:<></>}
    </>}
    {predState === 2 && <>
    {Number(previousAnswerLink) > 0 ? <>
       {Number(userBidLink.roundId) === 0 ? <>
    <span style={{display: 'flex', justifyContent: 'space-between', width: '50%', margin: '0 auto'}}>
    <div className="ethPrice"><span><p>PREVIOUS</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(previousAnswerLink),8)).toFixed(2)}</h2></span></div>
    <div className="ethPrice"><span><p>CURRENT</p><p>PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(answerLink),8)).toFixed(2)}</h2></span></div>
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
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onChange={(e) => setBidValue(e.target.value)} value={bidValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(2)} ETH</p>
   <div className="swapButtons"><p className={`${bidState && "tealActive"}`} onClick={() => setBidState(true)}>HIGHER</p><p className={`${!bidState && "tealActive"}`} onClick={() => setBidState(false)}>LOWER</p></div>
   <p style={{textAlign: 'center'}}>Next price in {epochLink} epoch(s)</p> 
    <br/>
    {bidValue.length > 0 ? <><p onClick={() => bidPrediction(Data.linkPrediction)} className="enterButton pointer">Bid</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p><p style={{textAlign: 'center'}}>3% Tax</p><p style={{textAlign: 'center'}}>Win = Receive PETAL + WEED + ETH Back(-3% Tax)</p><p style={{textAlign: 'center'}}>Loss = Receive WEED + LOSE ETH</p></>:<>
    <span style={{display: 'grid', alignItems: 'center', margin: '0 auto', width: '50%'}}>
    <div className="ethPrice"><span><p>BID {userBidLink.higher ? <>HIGHER</>:<>LOWER</>}</p></span></div>
    <div className="bidPrice"><span><p>BID PRICE</p></span><span><h2>{Number(ethers.formatUnits(String(userBidLink.priceBid),8)).toFixed(2)}</h2></span></div>
    <div className="bidPrice"><span><p>RESULT</p></span><span><h2>{checkBidLink === 0 ? <>PENDING</>:<>{Number(ethers.formatUnits(String(roundAnswerLink),8)).toFixed(2)}</>}</h2></span></div>
    </span>
    <span className="winnings"><p style={{textAlign: 'center'}}>WINNINGS</p><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidLink.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*3).toFixed(2)} WEED</p>{checkBidLink === 1 && <><p style={{textAlign: 'center'}}>{Number(Number(ethers.formatUnits(userBidLink.amountBid,18))/Number(Number(2000000000000) / 10 ** 18)*1).toFixed(2)} PETAL</p><p style={{textAlign: 'center'}}>{Number(ethers.formatUnits(userBidLink.amountBid, 18)).toFixed(4)} ETH</p></>}</span>
    {checkBidLink > 0 ? <><p onClick={() => resolveBid(Data.linkPrediction)} className="enterButton pointer">Resolve Bid</p>
    </>:<></>}
    </>}
    </>:<></>}
    </>}
    </>}
    {tab === 4 ? <>
    <div className="refInfo">
      <h3>Collect XP for future rewards!</h3>
      <h3>Limited Mints available at <a className="virtueLink" href="https://virtue.wtf" rel="noopener noreferrer" target="_blank" >Virtue.wtf</a></h3>
      <h3>Number of VirtueSekai Owned: {nftBalance}</h3>
      <h3>Rewards available:</h3>
      <h3>{rewardsAvailable} PETAL</h3>
      <h3>{rewardsAvailable*30} WEED</h3>
      <h3>{rewardsAvailable*30} VIRTUE</h3>
      <p onClick={() => claimRewards()} className="enterButton pointer">Claim</p>
      <p>1000 PETAL, 30K WEED, 30K VIRTUE per unclaimed NFT</p>
    </div>
    </>:<></>}
    </div>
    </>:
    <></>}
       {isMobile && <>
      <div className="coinInfo">
      <p>Price: {Number(Number(spotPrice) / 10 ** 18).toFixed(10)} ETH</p>
      {!petalLaunched && <><p>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      <p>Fees go to airdrops prior to bond and WEED liquidity on bonding of PETAL</p>
      <p>Airdrop eligibility is based on PETAL held + volume on meme markets</p>
      <p>Collect WEED to use on our meme markets - based on net positive buys to the PETAL bonding curve</p>
      <p>WEED multiplier 3x of your net PETAL buys</p>
      <p>3% global tax on everything except meme markets</p>
      </div><div><canvas id="bondingCurveChart"></canvas></div></>}
  </div>
      </header>
      <footer>
      </footer>
	</>	
	);
	}