'use client';

import { Suspense } from 'react';
import Agent from './components/Agent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Agent />
    </Suspense>
  );
}
