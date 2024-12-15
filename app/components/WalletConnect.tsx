'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#5788FA]">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="btn btn-sm btn-outline text-[#5788FA] hover:bg-[#5788FA] hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );

  return (
    <button
      onClick={() => connect({ connector: coinbaseWallet() })}
      className="btn btn-sm btn-outline text-[#5788FA] hover:bg-[#5788FA] hover:text-white"
    >
      Connect Wallet
    </button>
  );
}