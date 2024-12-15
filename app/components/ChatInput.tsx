import { type ChangeEvent, useCallback } from 'react';
import SendSvg from '../svg/SendSvg';

// type PremadeChatInputProps = {
//   text: string;
//   setUserInput: (input: string) => void;
// };

// function PremadeChatInput({ text, setUserInput }: PremadeChatInputProps) {
//   return (
//     <button
//       type="submit"
//       onClick={() => setUserInput(text)}
//       className="w-full whitespace-nowrap rounded-sm border border-[#5788FA]/50 px-2 py-1 text-start text-[#5788FA] transition-colors hover:bg-zinc-900 hover:text-[#3D7BFF] lg:w-auto"
//     >
//       {text}
//     </button>
//   );
// }

import { useTokenApproval } from '../hooks/useTokenApproval';

export type ChatInputProps = {
  handleSubmit: (e: React.FormEvent) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
};

export default function ChatInput({
  handleSubmit,
  userInput,
  setUserInput,
  handleKeyPress,
  disabled = false,
}: ChatInputProps) {
  const {
    hasEnoughBalance,
    hasEnoughAllowance,
    approveToken,
    isApproving,
    balance,
  } = useTokenApproval(
    process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string,
    process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS as string
  );

  const handleInputChange = useCallback(
    // TODO: sanitize
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setUserInput(e.target.value);
    },
    [setUserInput],
  );

  const handleApproveAndSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasEnoughBalance) return;

      if (!hasEnoughAllowance) {
        try {
          await approveToken();
        } catch (error) {
          console.error('Failed to approve token:', error);
          return;
        }
      }

      handleSubmit(e);
    },
    [handleSubmit, hasEnoughBalance, hasEnoughAllowance, approveToken],
  );

  const isSubmitDisabled = 
    disabled || 
    !/[a-zA-Z]/.test(userInput) || 
    !hasEnoughBalance || 
    isApproving;

  return (
    <form
      onSubmit={handleApproveAndSubmit}
      className="mt-auto flex w-full flex-col border-[#5788FA]/50 border-t bg-black p-4 pb-2 md:mt-0"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="h-24 w-full bg-black p-2 pr-10 text-gray-300 placeholder-[#5788FA] placeholder-opacity-50 lg:h-36"
            placeholder="Write here..."
            rows={1}
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`mt-auto rounded-sm p-1.5 transition-colors xl:hidden ${
              !isSubmitDisabled
                ? 'bg-[#5788FA] text-zinc-950 hover:bg-[#3D7BFF]'
                : 'cursor-not-allowed bg-[#5788FA] text-zinc-950 opacity-50'
            }`}
          >
            {isApproving ? 'Approving...' : <SendSvg />}
          </button>
        </div>

        {!hasEnoughBalance && (
          <div className="text-red-500 text-sm">
            Insufficient balance. You need at least 1 ADVRS token to send messages.
          </div>
        )}

        {!hasEnoughAllowance && hasEnoughBalance && (
          <div className="text-yellow-500 text-sm">
            You have {balance ? Number(balance / BigInt("1000000000000000000")) : '0'} ADVRS. Approval needed to send messages. Click send to approve.
          </div>
        )}

        <div className="flex w-full items-center justify-between gap-4 py-2">
          <div className="flex grow flex-col flex-wrap gap-2 overflow-x-auto text-xs lg:flex-row lg:text-sm">
            {/* <PremadeChatInput
              setUserInput={setUserInput}
              text="What actions can you take?"
            />
            <PremadeChatInput
              setUserInput={setUserInput}
              text="Deploy an NFT"
            /> */}
          </div>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`rounded-sm p-1.5 transition-colors max-xl:hidden ${
              !isSubmitDisabled
                ? 'bg-[#5788FA] text-zinc-950 hover:bg-[#3D7BFF]'
                : 'cursor-not-allowed bg-[#5788FA] text-zinc-950 opacity-50'
            }`}
          >
            {isApproving ? 'Approving...' : <SendSvg />}
          </button>
        </div>
      </div>
    </form>
  );
}
