'use client';

import { useAgentParams } from './hooks/useAgentParams';
import AgentComponent from './components/Agent';

export default function App() {
  const { isLoading } = useAgentParams();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="loading loading-spinner loading-lg text-[#5788FA]" />
      </div>
    );
  }

  return <AgentComponent />;
}
