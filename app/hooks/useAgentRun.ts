import { useReadContract } from 'wagmi';
import AgentGameABI from '../contracts/AgentGame';

interface AgentRun {
  owner: string;
  creator: string;
  name: string;
  prompt: string;
  groupImage: string;
  groupId: string;
  responsesCount: bigint;
  max_iterations: number;
  is_finished: boolean;
  prizePool: bigint;
}

// Define the type for the array returned by the contract
type AgentRunTuple = [
  string,    // owner
  string,    // creator
  string,    // name
  string,    // prompt
  string,    // groupImage
  string,    // groupId
  bigint,    // responsesCount
  number,    // max_iterations
  boolean,    // is_finished
  bigint,    // prizePool
];

export function useAgentRun(contractAddress: string, runId: string) {
  const { data: agentRunArray } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: AgentGameABI,
    functionName: 'agentRuns',
    args: [BigInt(runId)],
  }) as { data: AgentRunTuple | undefined };

  const agentRun = agentRunArray ? {
    owner: agentRunArray[0],
    creator: agentRunArray[1],
    name: agentRunArray[2],
    prompt: agentRunArray[3],
    groupImage: agentRunArray[4],
    groupId: agentRunArray[5],
    responsesCount: agentRunArray[6],
    max_iterations: Number(agentRunArray[7]),
    is_finished: agentRunArray[8],
    prizePool: agentRunArray[9]
  } as AgentRun : undefined;

  return {
    agentRun,
    isLoading: !agentRunArray
  };
}