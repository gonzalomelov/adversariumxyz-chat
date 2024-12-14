import { useSearchParams } from 'next/navigation';

interface UseAgentParamsResult {
  conversationId: string;
  isLoading: boolean;
}

export function useAgentParams(): UseAgentParamsResult {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId') || '';
 
  const isLoading = !conversationId;

  return {
    conversationId,
    isLoading,
  };
} 