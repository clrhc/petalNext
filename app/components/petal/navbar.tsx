'use client';
import '../../globals.css';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { readContracts, watchBlockNumber } from '@wagmi/core';
import { Abi, Address } from 'viem';
import { useAccount } from "wagmi";
import { config } from '../config/wagmiConfig';
import { useAppKit } from "@reown/appkit/react";
import referral from '../../abis/referral.json';
import Wallet from '../../wallet';
import Data from '../../data.json';
import petalLogo from '../../assets/img/petal.png';
import xpCoin from '../../assets/img/xpCoin.png';

export default function NavBar() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [userInfo, setUserInfo] = useState<[number, number, string, string, string]>([0, 0, '', '', '']);
  const [hoverWallet, setHoverWallet] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    let unwatch: (() => void) | null = null;
    let running = false;

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
          ],
          allowFailure: false,
        });

        const userInfo_ = data[0] as [bigint, bigint, string, string];

        setUserInfo([
          Number(userInfo_[0]),
          Number(userInfo_[1]),
          String(userInfo_[2]),
          String(userInfo_[3]),
          String(address),
        ]);
      } catch {
      } finally {
        running = false;
      }
    };

    void init();

    unwatch = watchBlockNumber(config, {
      onBlockNumber: () => {
        void init();
      },
      onError: () => {},
    });

    return () => {
      if (unwatch) unwatch();
    };
  }, [isConnected, address, config, Data.referralAddress]);

  const isLoading = isConnected && (userInfo.length !== 5 || userInfo[4] !== address);
  const isRegistered = userInfo.length === 5 && address === userInfo[3];

  return (
    <>
      {isLoading && <div id="loading-bar" />}

      <div className="nav">
        {/* Left: Logo */}
        <span className="logoSpan">
          <Image alt="Petal Protocol" className="logo" width={40} height={40} src={petalLogo} />
          <h2 className="logoText">PETAL</h2>
        </span>

        {/* Right: XP + Wallet */}
        <div className="navRight">
          {isRegistered && (
            <span className="xpNav">
              <p>{userInfo[1]}</p>
              <Image alt="XP" width={22} height={22} src={xpCoin} />
            </span>
          )}

          <span
            className="walletButtons pointer"
            id="walletSpan"
            onClick={() => open()}
            onMouseOver={() => setHoverWallet(true)}
            onMouseOut={() => setHoverWallet(false)}
          >
            <Wallet />
          </span>
        </div>

        {/* Dropdown Stats */}
        {isRegistered && hoverWallet && (
          <span
            className="userStats"
            id="displayStat"
            style={{ display: 'block' }}
            onMouseOver={() => setHoverWallet(true)}
            onMouseOut={() => setHoverWallet(false)}
          >
            <p>
              ID:{' '}
              {userInfo[0] < 10 && '00'}
              {userInfo[0] >= 10 && userInfo[0] < 100 && '0'}
              {userInfo[0]}
            </p>
            <p>Ref: {userInfo[2]}</p>
          </span>
        )}
      </div>
    </>
  );
}
