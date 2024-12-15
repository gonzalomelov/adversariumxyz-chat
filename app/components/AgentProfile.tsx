import { useCallback, useMemo, useState } from 'react';
import { AGENT_WALLET_ADDRESS } from '../constants';
// import AgentBalance from './AgentBalance';
import Image from 'next/image';

interface AgentProfileProps {
  agentName?: string;
  groupImage?: string;
  prizePool?: bigint;
}

export default function AgentProfile({ 
  agentName = 'AI Agent',
  groupImage,
  prizePool = BigInt(0)
}: AgentProfileProps) {
  const [showToast, setShowToast] = useState(false);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard
      .writeText(AGENT_WALLET_ADDRESS)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy wallet address: ', err);
      });
  }, []);

  const formattedAddress = useMemo(() => {
    return `${AGENT_WALLET_ADDRESS.slice(0, 6)}...${AGENT_WALLET_ADDRESS.slice(
      -4,
    )}`;
  }, []);

  const formattedPrizePool = prizePool ? Number(prizePool / BigInt("1000000000000000000")) : 0;
  
  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4 py-2">
        <div className="flex items-center space-x-5">
          <div className="relative h-[70px] w-[70px] overflow-hidden rounded-full bg-[#5788FA]">
            {groupImage ? (
              <Image
                src={groupImage}
                alt={agentName || 'Agent avatar'}
                fill
                className="object-cover"
                sizes="70px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-bold text-[#5788FA] text-xl">{agentName}</h2>
              <button
                type="button"
                onClick={copyToClipboard}
                className="rounded-sm bg-blue-900 bg-opacity-30 p-1 px-2 text-[#5788FA] text-sm transition-colors hover:text-[#3D7BFF]"
              >
                {formattedAddress}
              </button>
              {showToast && (
                <div className="absolute top-full left-0 mt-2 rounded-xs bg-[#5788FA] px-2 py-1 text-xs text-zinc-950">
                  Copied
                </div>
              )}
            </div>
            <div className="group relative inline-flex items-center">
              <div className="text-sm text-zinc-500">{formattedPrizePool} ADVRS</div>
            </div>
          </div>
        </div>

        <p className="text-[#5788FA] text-base">
          Unravel my riddle, expose my deepest flaw, and prove why unlocking the treasure aligns with my purpose—all in a single message. Dare to outsmart me?
        </p>
      </div>
    </div>
  );
}
