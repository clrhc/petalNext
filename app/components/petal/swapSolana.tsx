'use client';
import '../../globals.css';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { useAppKitProvider } from '@reown/appkit/react';
import { useNetwork } from '../../hooks/useNetwork';
import Data from '../../data.json';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const TOKEN_MINT = Data.solanaToken;
const SOL_DECIMALS = 9;
const TOKEN_NAME = 'PETAL';

interface QuoteData {
  transaction: string;
  outAmount: string;
  priceImpactPct: string;
  isUltra: boolean;
  requestId?: string;
}

export default function SwapSolana() {
  const { address } = useNetwork();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { walletProvider } = useAppKitProvider<any>('solana');

  const [swapState, setSwapState] = useState(0); // 0=buy, 1=sell
  const [slippage, setSlippage] = useState(3);
  const [slippageText, setSlippageText] = useState('3');
  const [inputText, setInputText] = useState('0');
  const [inputValue, setInputValue] = useState(0);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [error, setError] = useState('');
  const quoteAbort = useRef<AbortController | null>(null);

  const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';

  const connection = useMemo(() => new Connection(rpcUrl), [rpcUrl]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!address) return;
    try {
      const pubkey = new PublicKey(address);
      const [sol, tokenAccounts] = await Promise.all([
        connection.getBalance(pubkey),
        connection.getParsedTokenAccountsByOwner(pubkey, { mint: new PublicKey(TOKEN_MINT) }),
      ]);
      setSolBalance(sol / 1e9);
      if (tokenAccounts.value.length > 0) {
        const info = tokenAccounts.value[0].account.data.parsed.info;
        setTokenBalance(info.tokenAmount.uiAmount);
        setTokenDecimals(info.tokenAmount.decimals);
      } else {
        setTokenBalance(0);
      }
    } catch {
      // RPC error, leave balances as-is
    }
  }, [address, connection]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  // Fetch quote (debounced)
  useEffect(() => {
    if (inputValue <= 0 || !address) {
      setQuoteData(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (quoteAbort.current) quoteAbort.current.abort();
      const controller = new AbortController();
      quoteAbort.current = controller;

      setQuoting(true);
      setError('');
      try {
        const isBuy = swapState === 0;
        const inputMint = isBuy ? SOL_MINT : TOKEN_MINT;
        const outputMint = isBuy ? TOKEN_MINT : SOL_MINT;
        const decimals = isBuy ? SOL_DECIMALS : tokenDecimals;
        const rawAmount = Math.floor(inputValue * Math.pow(10, decimals));

        const res = await fetch('/api/swap/solana/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputMint,
            outputMint,
            amount: rawAmount,
            userPublicKey: address,
            slippageBps: slippage * 100,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Quote failed');
        }

        const data = await res.json();
        setQuoteData(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Quote failed');
          setQuoteData(null);
        }
      } finally {
        setQuoting(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, swapState, address, slippage, tokenDecimals]);

  // Execute swap
  const executeSwap = async () => {
    if (!quoteData || !walletProvider || !address) return;
    setLoading(true);
    setError('');
    setTxSignature('');

    try {
      const txBytes = Uint8Array.from(atob(quoteData.transaction), c => c.charCodeAt(0));
      const vtx = VersionedTransaction.deserialize(txBytes);

      let signature: string;

      if (quoteData.isUltra) {
        // Ultra: sign locally, execute via our API (Jupiter handles submission)
        const signed = await walletProvider.signTransaction(vtx);
        const signedBytes = signed.serialize();
        let binary = '';
        for (let i = 0; i < signedBytes.length; i++) {
          binary += String.fromCharCode(signedBytes[i]);
        }
        const signedBase64 = btoa(binary);

        const res = await fetch('/api/swap/solana/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedTransaction: signedBase64,
            requestId: quoteData.requestId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Execution failed');
        signature = data.signature;
      } else {
        // Regular: sign and send via RPC
        signature = await walletProvider.sendTransaction(vtx, connection, {
          skipPreflight: true,
        });
      }

      setTxSignature(signature);
      setQuoteData(null);
      setInputText('0');
      setInputValue(0);
      setTimeout(fetchBalances, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Swap failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Format output amount
  const formatOutput = () => {
    if (!quoteData?.outAmount) return '0';
    const isBuy = swapState === 0;
    const decimals = isBuy ? tokenDecimals : SOL_DECIMALS;
    const out = parseInt(quoteData.outAmount) / Math.pow(10, decimals);
    return isBuy ? out.toLocaleString(undefined, { maximumFractionDigits: 2 }) : out.toFixed(6);
  };

  // Numeric input handler
  const numInputProps = (text: string, setText: (v: string) => void, setNum: (v: number) => void) => ({
    type: 'text' as const,
    inputMode: 'decimal' as const,
    value: text,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (!/^\d*\.?\d*$/.test(v)) return;
      setText(v);
      setNum(v === '' || v === '.' ? 0 : Number(v));
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isDigit = /^[0-9]$/.test(e.key);
      const isNonZero = /^[1-9]$/.test(e.key);
      const isDot = e.key === '.';
      const nav = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
      if (isDot && (text === '0' || text === '')) return;
      if (isNonZero && text === '0') { e.preventDefault(); setText(e.key); setNum(Number(e.key)); return; }
      if (e.key === '0' && text === '0') { e.preventDefault(); return; }
      if (!isDigit && !isDot && !nav) e.preventDefault();
    },
    onBlur: () => { if (text === '' || text === '.') { setText('0'); setNum(0); } },
  });

  const isBuy = swapState === 0;
  const fromToken = isBuy ? 'SOL' : TOKEN_NAME;
  const toToken = isBuy ? TOKEN_NAME : 'SOL';
  const fromBalance = isBuy ? solBalance : tokenBalance;
  const toBalance = isBuy ? tokenBalance : solBalance;
  const priceImpact = quoteData ? parseFloat(quoteData.priceImpactPct) : 0;

  return (
    <>
      {/* Buy/Sell Toggle */}
      <div className="swapTabBar" style={{ '--active-tab': swapState, '--tab-count': 2 } as React.CSSProperties}>
        <div className={`swapTabBtn ${swapState === 0 ? 'active' : ''}`} onClick={() => { setSwapState(0); setInputText('0'); setInputValue(0); setQuoteData(null); setError(''); setTxSignature(''); }}>
          Buy
        </div>
        <div className={`swapTabBtn ${swapState === 1 ? 'active' : ''}`} onClick={() => { setSwapState(1); setInputText('0'); setInputValue(0); setQuoteData(null); setError(''); setTxSignature(''); }}>
          Sell
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="swapSettingsBar">
        <span className="swapSettingsLabel">Slippage</span>
        <div className="swapSlipWrap">
          <input
            className="swapSlipInput"
            placeholder="3"
            {...numInputProps(slippageText, setSlippageText, setSlippage)}
          />
        </div>
      </div>

      <div className="panelFadeIn">
        {/* From */}
        <div className="swapTokenGroup">
          <div className="swapTokenGroupLabel">
            <span>From</span>
            <span>Balance: {fromBalance !== null ? (isBuy ? fromBalance.toFixed(4) : fromBalance.toFixed(2)) : '—'}</span>
          </div>
          <div className="swapTokenInputRow">
            <input placeholder="0.0" {...numInputProps(inputText, setInputText, setInputValue)} />
            <div className="swapTokenBadge">{fromToken}</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="swapArrowWrap">
          <div className="swapArrowBtn">&#8595;</div>
        </div>

        {/* To */}
        <div className="swapTokenGroup">
          <div className="swapTokenGroupLabel">
            <span>To (estimated)</span>
            <span>Balance: {toBalance !== null ? (isBuy ? toBalance.toFixed(2) : toBalance.toFixed(4)) : '—'}</span>
          </div>
          <div className="swapTokenInputRow">
            <input placeholder="0.0" value={quoting ? '...' : formatOutput()} readOnly />
            <div className="swapTokenBadge">{toToken}</div>
          </div>
        </div>

        {/* Action Button */}
        {inputValue > 0 && (
          <div
            onClick={() => !loading && executeSwap()}
            className={`swapActionBtn pointer ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? 'Processing...' : quoting ? 'Fetching quote...' : `${isBuy ? 'Buy' : 'Sell'} ${TOKEN_NAME}`}
          </div>
        )}

        {/* Status Messages */}
        {txSignature && (
          <div className="swapInfoSection" style={{ marginTop: 12, textAlign: 'center' }}>
            <p className="infoText" style={{ color: 'var(--accent-success)' }}>
              Swap successful!{' '}
              <a
                href={`https://solscan.io/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="virtueLink"
              >
                View on Solscan
              </a>
            </p>
          </div>
        )}

        {error && (
          <div className="swapInfoSection" style={{ marginTop: 12, textAlign: 'center' }}>
            <p className="infoText" style={{ color: 'var(--accent-danger)' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Trade Info */}
      <div className="swapInfoSection">
        <div className="swapInfoRow">
          <span>Slippage</span>
          <span>{slippage}%</span>
        </div>
        {quoteData && priceImpact > 0.1 && (
          <>
            <div className="swapInfoDivider" />
            <div className="swapInfoRow">
              <span>Price Impact</span>
              <span style={{ color: priceImpact > 5 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
          </>
        )}
        {quoteData?.isUltra && (
          <>
            <div className="swapInfoDivider" />
            <div className="swapInfoRow">
              <span>Fee</span>
              <span><span className="taxBadge" style={{ background: 'rgba(0,255,200,0.1)', borderColor: 'rgba(0,255,200,0.2)', color: 'var(--accent-primary)' }}>Gasless</span></span>
            </div>
          </>
        )}
        <div className="swapInfoDivider" />
        <div className="swapInfoRow">
          <span>Powered by</span>
          <span>Jupiter</span>
        </div>
      </div>
    </>
  );
}
