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
    <div className="flex items-center gap-3">
      <WalletMultiButton 
        className="!bg-blue-500/10 !border !border-blue-500/20 !rounded-lg 
          hover:!bg-blue-500/20 !transition-colors !py-2 !px-4 !h-auto
          !text-blue-400 hover:!text-blue-300 !font-medium !text-sm"
      />
      {connected && (
        <span className="text-sm text-blue-400/80">
          {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
        </span>
      )}
    </div>
  );
};

export default WalletConnect; 