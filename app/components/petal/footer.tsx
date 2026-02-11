'use client';
import '../../globals.css';
import Image from 'next/image';
import Data from '../../data.json';
import opensea from '../../assets/img/opensea.png';
import x from '../../assets/img/x.webp';
import etherscan from '../../assets/img/etherscan.png';
import magiceden from '../../assets/img/magiceden.png';
import discord from '../../assets/img/discord.webp';

export default function Footer() {
  return (
    <footer>
      <span className="community">
        <p className="socials">
          <a href="https://discord.gg/TeQkftUA64" target="_blank" rel="noopener noreferrer">
            <Image alt="Discord" width={22} src={discord} />
          </a>
          <a href="https://opensea.io/collection/virtuesekai" target="_blank" rel="noopener noreferrer">
            <Image alt="OpenSea" width={22} src={opensea} />
          </a>
          <a href="https://x.com/virtuedefi" target="_blank" rel="noopener noreferrer">
            <Image alt="X" width={22} src={x} />
          </a>
          <a href={'https://basescan.org/address/' + String(Data.petalFactory) + '#code'} target="_blank" rel="noopener noreferrer">
            <Image alt="Basescan" width={22} src={etherscan} />
          </a>
          <a href="https://magiceden.io/collections/base/0xf7805f4f52f4d9c290280dd398ac2b8b9dde6df5" target="_blank" rel="noopener noreferrer">
            <Image alt="Magic Eden" width={22} src={magiceden} />
          </a>
        </p>
      </span>
    </footer>
  );
}
