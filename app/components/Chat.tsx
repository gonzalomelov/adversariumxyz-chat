import { cn } from '@coinbase/onchainkit/theme';
import {
  useCallback,
  useEffect,
  // useMemo,
  useRef,
  useState
} from 'react';
import useChat from '../hooks/useChat';
import type { AgentMessage, StreamEntry } from '../types';
import { markdownToPlainText } from '../utils';
import { API_URL } from '../config';
import ChatInput from './ChatInput';
import StreamItem from './StreamItem';
import { useWriteContract } from 'wagmi';

type ChatProps = {
  className?: string;
  // getNFTs: () => void;
  // getTokens: () => void;
  conversationId: string;
  agentGame: string;
};

interface ConversationMessage {
  role: 'human' | 'agent';
  content: string;
}

function mapMessageToStreamEntry(message: ConversationMessage): StreamEntry {
  return {
    timestamp: new Date(),
    content: message.content,
    type: message.role === 'human' ? 'user' : 'agent',
  };
}

async function fetchConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}`);
  if (!response.ok) throw new Error('Failed to fetch conversation history');
  const data = await response.json();
  return data.messages;
}

export default function Chat({ className, conversationId, agentGame }: ChatProps) {
  const [userInput, setUserInput] = useState('');
  const [streamEntries, setStreamEntries] = useState<StreamEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // const [shouldRefetchNFTs, setShouldRefetchNFTs] = useState(false);
  // const [shouldRefetchTokens, setShouldRefetchTokens] = useState(false);

  useEffect(() => {
    async function loadConversationHistory() {
      try {
        const messages = await fetchConversationHistory(conversationId);
        const entries: StreamEntry[] = messages.map(mapMessageToStreamEntry);
        setStreamEntries(entries);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        // Fall back to default message on error
        setStreamEntries([{
          timestamp: new Date(),
          content: "Hi! I'm your AI assistant. I can help you deploy NFTs and tokens. What would you like to do?",
          type: 'agent',
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadConversationHistory();
  }, [conversationId]);

  // useEffect(() => {
  //   if (shouldRefetchNFTs) {
  //     getNFTs();
  //     setShouldRefetchNFTs(false);
  //   }
  // }, [getNFTs, shouldRefetchNFTs]);

  // useEffect(() => {
  //   if (shouldRefetchTokens) {
  //     getTokens();
  //     setShouldRefetchTokens(false);
  //   }
  // }, [getTokens, shouldRefetchTokens]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSuccess = useCallback((messages: AgentMessage[]) => {
    const functions =
      messages?.find((msg) => msg.event === 'tools')?.functions || [];
    if (functions?.includes('deploy_nft')) {
      // setShouldRefetchNFTs(true);
    }
    if (functions?.includes('deploy_token')) {
      // setShouldRefetchTokens(true);
    }

    let message = messages.find((res) => res.event === 'agent');
    if (!message) {
      message = messages.find((res) => res.event === 'tools');
    }
    if (!message) {
      message = messages.find((res) => res.event === 'error');
    }
    const streamEntry: StreamEntry = {
      timestamp: new Date(),
      content: markdownToPlainText(message?.data || ''),
      type: 'agent',
    };
    setStreamEntries((prev) => [...prev, streamEntry]);
  }, []);

  const { postChat, isLoading } = useChat({
    onSuccess: handleSuccess,
    conversationId,
    agentGame,
  });

  const { writeContractAsync: contributeToPool } = useWriteContract();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userInput.trim()) return;

      try {
        await contributeToPool({
          address: process.env.NEXT_PUBLIC_AGENT_CONTRACT_ADDRESS as `0x${string}`,
          abi: [
            {
              name: 'contributeToPool',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [{ name: 'runId', type: 'uint256' }],
              outputs: [{ type: 'bool' }]
            }
          ] as const,
          functionName: 'contributeToPool',
          args: [BigInt(agentGame)]
        });

        setUserInput('');
        const userMessage: StreamEntry = {
          timestamp: new Date(),
          type: 'user',
          content: userInput.trim(),
        };
        setStreamEntries((prev) => [...prev, userMessage]);
        postChat(userInput);
      } catch (error) {
        console.error('Failed to contribute to pool:', error);
        // Show error to user
      }
    },
    [postChat, userInput, contributeToPool, agentGame],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependency is required
  useEffect(() => {
    // scrolls to the bottom of the chat when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamEntries]);

  return (
    <div
      className={cn(
        'flex h-full flex-col border-[#5788FA]/50 max-w-4xl w-full',
        className,
      )}
    >
      <div className="flex grow flex-col overflow-y-auto p-4 pb-20">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center p-4">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : streamEntries.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-base-content/60">
            No messages yet.
          </div>
        ) : (
          <div className="mt-4 space-y-2" role="log" aria-live="polite">
            {streamEntries.map((entry, index) => (
              <StreamItem
                key={`${entry.timestamp.toDateString()}-${index}`}
                entry={entry}
              />
            ))}
          </div>
        )}

        <div className="mt-3" ref={bottomRef} />
      </div>

      <ChatInput
        userInput={userInput}
        handleKeyPress={handleKeyPress}
        handleSubmit={handleSubmit}
        setUserInput={setUserInput}
        disabled={isLoading || isLoadingHistory}
      />
    </div>
  );
}
