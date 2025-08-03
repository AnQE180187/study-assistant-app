'use client';

import { ApiTest } from '@/components/debug/api-test';

export default function DebugPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        <ApiTest />
      </div>
    </div>
  );
}
