import { useCallback, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  }
] as const;

export function useTokenApproval(tokenAddress: string, spenderAddress: string) {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  const { data: allowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, spenderAddress as `0x${string}`],
  });

  const { writeContractAsync: approve } = useWriteContract();

  const hasEnoughBalance = balance ? balance >= parseEther('1') : false;
  const hasEnoughAllowance = allowance ? allowance >= parseEther('1') : false;

  const approveToken = useCallback(async () => {
    if (!address) return;
    setIsApproving(true);
    try {
      await approve({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, parseEther('1000')]
      });
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    } finally {
      setIsApproving(false);
    }
  }, [address, approve, spenderAddress, tokenAddress]);

  return {
    hasEnoughBalance,
    hasEnoughAllowance,
    approveToken,
    isApproving,
    balance,
  };
}