'use client';

import { FC, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnect: FC = () => {
  const { wallet, connect, connected, publicKey } = useWallet();

  useEffect(() => {
    if (!wallet && window.phantom) {
      connect().catch(console.error);
    }
  }, [wallet, connect]);

  return (
    <div className="flex items-center space-x-4 scale-75 origin-left">
      <WalletMultiButton className="!py-2 !px-3 !text-sm" />
      {connected && (
        <span className="text-sm text-gray-400">
          {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
        </span>
      )}
    </div>
  );
};

export default WalletConnect; 