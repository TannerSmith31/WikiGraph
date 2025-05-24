/**
 * Interface representing a Wikipedia article and its links
 */
interface WikiArticle {
  title: string;    // The title of the Wikipedia article
  links: string[];  // Array of titles of articles linked from this article
}

/**
 * Fetches a Wikipedia article and its links using the Wikipedia API
 * @param url - The full Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Artificial_intelligence)
 * @returns Promise resolving to a WikiArticle object containing the article title and its links
 * @throws Error if the article is not found
 */
export async function fetchWikipediaArticle(url: string): Promise<WikiArticle> {
  // Extract the article title from the URL by:
  // 1. Splitting on '/' and taking the last part
  // 2. Replacing underscores with spaces
  const title = url.split('/').pop()?.replace(/_/g, ' ') || '';
  
  // Construct the Wikipedia API URL with parameters:
  // - action=query: Basic query action
  // - titles: The article title to fetch
  // - prop=links: Request the links from the article
  // - pllimit=500: Limit to 500 links (max allowed)
  // - format=json: Return JSON format
  // - origin=*: Allow CORS requests
  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?` +
    `action=query&` +
    `titles=${encodeURIComponent(title)}&` +
    `prop=links&` +
    `pllimit=500&` +
    `format=json&` +
    `origin=*`
  );

  // Parse the JSON response
  const data = await response.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  // Check if the article exists
  if (page.missing) {
    throw new Error('Article not found');
  }

  // Extract and map the links from the response
  // Each link object contains a 'title' property
  const links = page.links?.map((link: any) => link.title) || [];

  return {
    title: page.title,
    links
  };
}

/**
 * Processes a WikiArticle into the format needed for the D3 graph visualization
 * @param article - The WikiArticle to process
 * @returns Object containing nodes and links arrays for D3 force-directed graph
 */
export function processWikiData(article: WikiArticle) {
  // Create nodes array:
  // - First node is the main article
  // - Additional nodes are created for each linked article
  const nodes = [
    { id: article.title, title: article.title },
    ...article.links.map(link => ({ id: link, title: link }))
  ];

  // Create links array:
  // - Each link connects the main article to one of its linked articles
  const links = article.links.map(link => ({
    source: article.title,
    target: link
  }));

  return { nodes, links };
} 