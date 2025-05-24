'use client';

import { useState } from 'react';
import WikiGraph from '../Components/WikiGraph';

// Sample data - replace this with actual Wikipedia API data
const sampleData = {
  nodes: [
    { id: '1', title: 'Artificial Intelligence' },
    { id: '2', title: 'Machine Learning' },
    { id: '3', title: 'Deep Learning' },
    { id: '4', title: 'Neural Networks' },
    { id: '5', title: 'Computer Science' },
  ],
  links: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '1', target: '5' },
    { source: '2', target: '5' },
  ],
};

export default function Home() {
  const [data, setData] = useState(sampleData);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Wikipedia Article Graph</h1>
      <div className="w-full h-[600px] bg-white rounded-lg shadow-lg">
        <WikiGraph nodes={data.nodes} links={data.links} />
      </div>
    </main>
  );
}
