'use client';
import '../../virtue.css';
import Image from 'next/image';
import React from 'react';
import { useAppKit } from "@reown/appkit/react";
import Wallet from '../../wallet';
import logo from '../../assets/img/virtueLogo.png';

  export default function NavBar(){

    const {open} = useAppKit();

   return(
    <>
     <div className="virtueNav"><Image alt="virtue" width="150" className="virtueLogo" src={logo} /><span className="walletButtonsVirtue pointer" onClick={() => open()}><Wallet /></span></div>
     </>
    );
  }