'use client';
import '../../globals.css';
import Image from 'next/image';
import Data from '../../data.json';
import x from '../../assets/img/x.webp';
import etherscan from '../../assets/img/etherscan.png';

export default function Footer() {
  return (
    <footer>
      <span className="community">
        <p className="socials">
          <a href="https://x.com/celeritycodes" target="_blank" rel="noopener noreferrer">
            <Image alt="X" width={22} src={x} />
          </a>
          <a href={'https://basescan.org/address/' + String(Data.petalFactory) + '#code'} target="_blank" rel="noopener noreferrer">
            <Image alt="Basescan" width={22} src={etherscan} />
          </a>
        </p>
      </span>
    </footer>
  );
}
