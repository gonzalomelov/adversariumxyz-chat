import { useSearchParams } from 'next/navigation';

interface UseAgentParamsResult {
  conversationId: string;
  agentGame: string;
  isLoading: boolean;
}

export function useAgentParams(): UseAgentParamsResult {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId') || '';
  const agentGame = searchParams.get('agentGame') || '';
 
  const isLoading = !conversationId || !agentGame;

  return {
    conversationId,
    agentGame,
    isLoading,
  };
} 