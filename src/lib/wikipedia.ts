// Interface representing a Wikipedia article and its links
interface WikiArticle {
  title: string;    // The title of the Wikipedia article
  links: string[];  // Array of titles of articles linked from this article
}

// fetch the article and its links from the Wikipedia API
export async function fetchWikipediaArticle(url: string): Promise<WikiArticle> {
  // Extract the article title from the URL by 1) splitting on '/' and taking the last part and 2) replacing underscores with spaces
  const title = url.split('/').pop()?.replace(/_/g, ' ') || '';
  
  // Construct the Wikipedia API URL
  // e.g. https://en.wikipedia.org/w/api.php?action=query&titles=Artificial%20intelligence&prop=links&pllimit=10&format=json&origin=*
  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?` +   // base url for all Wikipedia APIs
    `action=query&` +                         // action to be performed
    `titles=${encodeURIComponent(title)}&` +  // title of the article to be fetched
    `prop=links&` +                           // property to be fetched
    `pllimit=500&` +                          // limit the number of links to 500
    `format=json&` +                          // format of the response
    `origin=*`                                // allow CORS requests
  );

  // Parse the JSON response
  const data = await response.json(); // json response from the API
  const pages = data.query.pages;     // pages contains {links: [{ns: 0, title: 'Aardwolf'},...]}
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  // Check if the article exists
  if (page.missing) {
    throw new Error('Article not found');
  }

  // Extract and map the links from the response
  // Each link object contains a 'title' property
  const links = page.links?.map((link: any) => link.title) || []; // e.g. ['Dan Storper', 'Given name', 'Michael Storper', 'Surname', 'Talk:Storper', 'Wikipedia:Manual of Style/Linking']

  return {
    title: page.title,
    links: links
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