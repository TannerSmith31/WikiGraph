'use client';

import { useState } from 'react';
import WikiGraph from '../Components/WikiGraph';
import { fetchWikipediaArticle, processWikiData } from '../lib/wikipedia';

export default function Home() {
  // State for the Wikipedia URL input
  const [url, setUrl] = useState('');
  
  // State for loading status during API calls
  const [loading, setLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // State for the graph data
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: []
  });

  /**
   * Handles form submission to fetch and visualize Wikipedia article data
   * @param e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch the article data from Wikipedia API
      const article = await fetchWikipediaArticle(url);
      
      // Process the article data into graph format
      const graphData = processWikiData(article);
      
      // Update the graph with new data
      setData(graphData);
    } catch (err) {
      // Handle any errors that occur during fetching or processing
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Wikipedia Article Graph</h1>
      
      {/* Search form for Wikipedia URLs */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Artificial_intelligence)"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Loading...' : 'Visualize'}
          </button>
        </div>
      </form>

      {/* Error message display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Graph container */}
      <div className="w-full h-[600px] bg-white rounded-lg shadow-lg">
        {data.nodes.length > 0 ? (
          // Render the graph if we have data
          <WikiGraph nodes={data.nodes} links={data.links} />
        ) : (
          // Show placeholder message if no data
          <div className="h-full flex items-center justify-center text-gray-500">
            Enter a Wikipedia URL to visualize its article graph
          </div>
        )}
      </div>
    </main>
  );
}
