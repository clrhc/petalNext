'use client';
import '../globals.css';
import React,{useState, useEffect} from 'react';
import Data from '../data.json';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from './wagmiConfig';
import {Abi, Address} from 'viem';
import {useAccount, useChainId, useWriteContract} from "wagmi";
import referral from '../abis/referral.json';
import xpCoin from '../assets/img/xpCoin.png';


export default function ReferralComponent() {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [userInfo, setUserInfo] = useState<[number, number, string, string, string]>([0, 0, '', '', '']);
  const [userRef, setUserRef] = useState("");
  const [newRef, setNewRef] = useState("");
  const [userCheck, setUserCheck] = useState(false);
  const [newCheck, setNewCheck] = useState(false);
  const [error, setError] = useState(false);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();

  useEffect(() => {
  if (!isConnected || !address) return;

  let unwatch: (() => void) | null = null;
  let running = false; // avoid overlapping calls

  const ZERO = '0x0000000000000000000000000000000000000000' as const;
  const userRefKey = String(userRef || '').toLowerCase();
  const newRefKey  = String(newRef  || '').toLowerCase();

  const init = async () => {
    if (running) return;
    running = true;

    try {
      const data = await readContracts(config, {
        contracts: [
          {
            address: Data.referralAddress as Address,
            abi: referral.abi as Abi,
            functionName: 'userInfo',
            args: [address as Address],
          },
          {
            address: Data.referralAddress as Address,
            abi: referral.abi as Abi,
            functionName: 'refStore',
            args: [userRefKey],
          },
          {
            address: Data.referralAddress as Address,
            abi: referral.abi as Abi,
            functionName: 'refStore',
            args: [newRefKey],
          },
        ],
        allowFailure: false, // returns raw decoded values
      });

      const [userInfoRaw, checkUserRefAddr, checkNewRefAddr] = data as [
        [bigint, bigint, string, string],
        string,
        string
      ];

      setUserInfo([
        Number(userInfoRaw[0]),
        Number(userInfoRaw[1]),
        String(userInfoRaw[2]),
        String(userInfoRaw[3]),
        String(address),
      ]);

      setUserCheck(checkUserRefAddr.toLowerCase() !== ZERO);
      setNewCheck(checkNewRefAddr.toLowerCase() !== ZERO);
    } catch {
      // optional: console.error(err);
    } finally {
      running = false;
    }
  };

  // initial load
  void init();

  // refetch on every new block
  unwatch = watchBlockNumber(config, {
    listen: true,
    onBlockNumber: () => { void init(); },
  });

  // cleanup
  return () => {
    if (unwatch) unwatch();
  };
}, [
  isConnected,
  address,
  config,
  Data.referralAddress,
  userRef,   // re-run when user types a different ref
  newRef,    // re-run when newRef changes
]);


  const checkRef = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value;
  const regex = /^[a-zA-Z0-9]*$/;
  setError(!regex.test(input));
};

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if(networkId === baseId){
         await writeContract({ 
          abi: referral.abi,
          address: Data.referralAddress as Address,
          functionName: 'register',
          args: [userRef,newRef],
       });}
      }
    };

   const register = async () => {
       if(networkId === baseId){
         await writeContract({ 
          abi: referral.abi,
          address: Data.referralAddress as Address,
          functionName: 'register',
          args: [userRef,newRef],
       });}
   };

	return(
	<>
    {userInfo[0] < 1 ? <><span>You have yet to register. Begin by using a referral and creating your own referral code. Default referral: PETAL</span>
    <br/>
    <span>Get rewarded VIRTUE, PETAL and WEED on registration</span>
    <input id="refInput" className={`inputBox inputBox inputText userText ${userRef.length > 0 ? !error && userCheck ? "outlineGreen" : "outlineRed": "outlineTeal"}`} placeholder="User Referral" onChange={(e) => {checkRef(e);setUserRef(e.target.value)}} value={userRef} type="text" />
    {userRef.length > 0 && <>{!error && <>{userCheck ? <><p className="rightSide" style={{color: 'green'}}>Is Valid</p></>:<><p className="rightSide" style={{color: 'red'}}>Referral Does Not Exist</p></>}</>}</>}
    <input className={`inputBox inputText newText ${newRef.length > 0 ? !error && newCheck ? "outlineRed" : "outlineGreen" : "outlineTeal"}`} id="refInput" placeholder="Create Your Referral" onChange={(e) => {checkRef(e);setNewRef(e.target.value)}} value={newRef}  onKeyDown={(e) => handleKeyDown(e)} type="text" />
    {newRef.length > 0 && <>{!error && <>{newCheck ? <><p className="rightSide" style={{color: 'red'}}>Referral Already Taken</p></>:<><p className="rightSide" style={{color: 'green'}}>Referral Code Available</p></>}</>}</>}
    {error && <p>Referral can only contain letters and numbers (no spaces)</p>}
    {userRef.length > 0 && newRef.length > 0 && !error && userCheck && !newCheck ? <><p onClick={() => register()} className="enterButton pointer">Enter</p></>:<></>}
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
    </>}
	</>	
	);
	}