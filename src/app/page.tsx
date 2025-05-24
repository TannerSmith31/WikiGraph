'use client';

import { useState } from 'react';
import WikiGraph from '../Components/WikiGraph';
import { fetchWikipediaArticle, processWikiData } from '../lib/wikipedia';
import styles from '../styles/page.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const article = await fetchWikipediaArticle(url);
      const data = processWikiData(article);
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>WikiGraph</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Artificial_intelligence)"
          className={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Loading...' : 'Visualize'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.graphContainer}>
        {graphData.nodes.length > 0 ? (
          <WikiGraph nodes={graphData.nodes} links={graphData.links} />
        ) : (
          <div className={styles.placeholder}>
            Enter a Wikipedia URL to visualize its article graph
          </div>
        )}
      </div>
    </main>
  );
}
