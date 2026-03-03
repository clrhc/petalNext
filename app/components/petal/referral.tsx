'use client';
import '../../globals.css';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Data from '../../data.json';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { config } from '../config/wagmiConfig';
import { Abi, Address } from 'viem';
import { useAccount, useChainId, useWriteContract } from "wagmi";
import referral from '../../abis/referral.json';
import xpCoin from '../../assets/img/xpCoin.png';


export default function ReferralComponent() {

  const { address, isConnected } = useAccount();
  const [baseId] = useState(8453);
  const [userInfo, setUserInfo] = useState<[number, number, string, string, string]>([0, 0, '', '', '']);
  const [userRef, setUserRef] = useState("");
  const [newRef, setNewRef] = useState("");
  const [userCheck, setUserCheck] = useState(false);
  const [newCheck, setNewCheck] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const networkId = useChainId();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isConnected || !address) return;

    let unwatch: (() => void) | null = null;
    let running = false;

    const ZERO = '0x0000000000000000000000000000000000000000' as const;
    const userRefKey = String(userRef ?? '').toLowerCase();
    const newRefKey = String(newRef ?? '').toLowerCase();

    const init = async () => {
      if (running) return;
      running = true;

      try {
        const data = await readContracts(config, {
          contracts: [
            { address: Data.referralAddress as Address, abi: referral.abi as Abi, functionName: 'userInfo', args: [address as Address] },
            { address: Data.referralAddress as Address, abi: referral.abi as Abi, functionName: 'refStore', args: [userRefKey] },
            { address: Data.referralAddress as Address, abi: referral.abi as Abi, functionName: 'refStore', args: [newRefKey] },
          ],
          allowFailure: false,
        });

        const [userInfoRaw, checkUserRefAddr, checkNewRefAddr] = data as [
          [bigint, bigint, string, string], string, string
        ];

        setUserInfo([
          Number(userInfoRaw[0]), Number(userInfoRaw[1]),
          String(userInfoRaw[2]), String(userInfoRaw[3]), String(address),
        ]);

        setUserCheck(checkUserRefAddr.toLowerCase() !== ZERO);
        setNewCheck(checkNewRefAddr.toLowerCase() !== ZERO);
      } catch {
      } finally {
        running = false;
      }
    };

    void init();

    unwatch = watchBlockNumber(config, {
      onBlockNumber: () => { void init(); },
    });

    return () => { if (unwatch) unwatch(); };
  }, [isConnected, address, config, Data.referralAddress, userRef, newRef]);


  const checkRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /^[a-zA-Z0-9]*$/;
    setError(!regex.test(e.target.value));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: referral.abi, address: Data.referralAddress as Address,
          functionName: 'register', args: [userRef, newRef],
        });
      } finally { setIsLoading(false); }
    }
  };

  const register = async () => {
    if (networkId === baseId) {
      setIsLoading(true);
      try {
        await writeContract({
          abi: referral.abi, address: Data.referralAddress as Address,
          functionName: 'register', args: [userRef, newRef],
        });
      } finally { setIsLoading(false); }
    }
  };

  const copyRefCode = () => {
    navigator.clipboard.writeText(userInfo[2]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {userInfo[0] < 1 ? (
        <>
          <div className="refInfo">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>Join the Protocol</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', margin: '0 0 4px' }}>
              Register with a referral code and create your own.
              Default code: <strong style={{ color: 'var(--accent-primary)' }}>PETAL</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Earn VIRTUE, PETAL, and WEED on registration
            </p>
          </div>

          <input
            className={`inputBox inputText userText ${userRef.length > 0 ? !error && userCheck ? "outlineGreen" : "outlineRed" : "outlineTeal"}`}
            placeholder="Enter Referral Code"
            onChange={(e) => { checkRef(e); setUserRef(e.target.value); }}
            value={userRef}
            type="text"
          />
          {userRef.length > 0 && !error && (
            <p className="rightSide" style={{ color: userCheck ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {userCheck ? 'Valid referral' : 'Referral does not exist'}
            </p>
          )}

          <input
            className={`inputBox inputText newText ${newRef.length > 0 ? !error && newCheck ? "outlineRed" : "outlineGreen" : "outlineTeal"}`}
            placeholder="Create Your Referral Code"
            onChange={(e) => { checkRef(e); setNewRef(e.target.value); }}
            value={newRef}
            onKeyDown={(e) => handleKeyDown(e)}
            type="text"
          />
          {newRef.length > 0 && !error && (
            <p className="rightSide" style={{ color: newCheck ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
              {newCheck ? 'Already taken' : 'Available'}
            </p>
          )}

          {error && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>
              Letters and numbers only (no spaces)
            </p>
          )}

          {userRef.length > 0 && newRef.length > 0 && !error && userCheck && !newCheck && (
            <p onClick={() => register()} className={`enterButton pointer ${isLoading ? 'btn-loading' : ''}`}>{isLoading ? 'Processing...' : 'Register'}</p>
          )}
        </>
      ) : (
        <>
          {userInfo.length === 5 && (
            <div className="refInfo">
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>
                #{String(userInfo[0]).padStart(3, '0')}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="xpText">
                  <h3 style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>XP: {userInfo[1]}</h3>
                  <Image alt="XP" width={24} height={24} src={xpCoin} />
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <h3>Code: <span style={{ color: 'var(--accent-primary)' }}>{userInfo[2]}</span></h3>
                <span
                  onClick={copyRefCode}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: copied ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0, 255, 200, 0.05)',
                    border: `1px solid ${copied ? 'rgba(0, 230, 118, 0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    color: copied ? 'var(--accent-success)' : 'var(--text-secondary)',
                    transition: 'var(--transition-base)',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </div>

              <h3 style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--text-muted)', marginBottom: '16px' }}>{address}</h3>

              <div style={{ padding: '12px', background: 'rgba(0, 255, 200, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Share your code to earn XP and grow your network</h3>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
