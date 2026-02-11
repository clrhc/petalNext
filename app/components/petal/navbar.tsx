'use client';
import '../../globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const NAV_LINKS = [
  { href: '/swap', label: 'Trade' },
  { href: '/memes', label: 'Memes' },
  { href: '/predict', label: 'Predict' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/referral', label: 'Referral' },
];

export default function NavBar() {
  const pathname = usePathname();
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
  const isRegistered = userInfo[0] > 0 && userInfo.length === 5 && address === userInfo[4];

  return (
    <>
      {isLoading && <div id="loading-bar" />}

      <div className="nav">
        <Link href="/" className="logoSpan">
          <Image alt="Petal" className="logo" width={36} height={36} src={petalLogo} />
          <span className="logoText">PETAL</span>
        </Link>

        <div className="navLinks">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navRight">
          {isRegistered && (
            <span className="xpNav">
              <p>{userInfo[1]}</p>
              <Image alt="XP" width={20} height={20} src={xpCoin} />
            </span>
          )}

          <span
            className="walletButtons"
            onClick={() => open()}
            onMouseOver={() => setHoverWallet(true)}
            onMouseOut={() => setHoverWallet(false)}
          >
            <Wallet />
          </span>
        </div>

        {isRegistered && hoverWallet && (
          <span
            className="userStats"
            style={{ display: 'block' }}
            onMouseOver={() => setHoverWallet(true)}
            onMouseOut={() => setHoverWallet(false)}
          >
            <p>ID: {String(userInfo[0]).padStart(3, '0')}</p>
            <p>Ref: {userInfo[2]}</p>
          </span>
        )}
      </div>
    </>
  );
}
