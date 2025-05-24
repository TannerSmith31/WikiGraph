# WikiGraph

WikiGraph is an interactive web application that visualizes the relationships between Wikipedia articles using a force-directed graph. The application allows users to input any Wikipedia article URL and generates a visual representation of that article's links.

## Features

- Interactive force-directed graph visualization
- Real-time Wikipedia article data fetching
- Draggable nodes for custom layout
- Responsive design
- Error handling for invalid URLs or missing articles

## Technical Overview

### Architecture

The application is built using:
- Next.js (React framework)
- TypeScript
- D3.js for graph visualization
- Wikipedia API for data fetching

### Key Components

#### 1. Main Page (`src/app/page.tsx`)
- Handles user input for Wikipedia URLs
- Manages application state (loading, error states)
- Renders the main UI components
- Processes Wikipedia data for visualization

#### 2. WikiGraph Component (`src/Components/WikiGraph.tsx`)
- Implements the D3.js force-directed graph
- Features:
  - Interactive node dragging
  - Automatic force simulation
  - Dynamic node and link rendering
  - Responsive layout
- Uses TypeScript interfaces for type safety:
  - `WikiNode`: Represents graph nodes with position data
  - `WikiLink`: Represents connections between nodes

#### 3. Wikipedia Integration (`src/lib/wikipedia.ts`)
- Handles Wikipedia API communication
- Two main functions:
  - `fetchWikipediaArticle`: Retrieves article data and its links
  - `processWikiData`: Transforms Wikipedia data into graph format

### Data Flow

1. User enters a Wikipedia URL
2. Application fetches article data using Wikipedia API
3. Data is processed into nodes and links
4. D3.js renders the interactive graph
5. Users can interact with the graph by dragging nodes

### Styling

The application uses CSS modules for styling:
- `page.module.css`: Main page layout and form styling
- `graph.module.css`: Graph-specific styling

## Development

### Prerequisites
- Node.js
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Customization

#### Modifying the Graph
- Adjust force simulation parameters in `WikiGraph.tsx`
- Modify node and link styling in `graph.module.css`
- Change the number of links fetched in `wikipedia.ts`

#### Adding Features
- New graph interactions can be added to `WikiGraph.tsx`
- Additional Wikipedia data can be fetched by modifying the API call in `wikipedia.ts`
- UI components can be enhanced in `page.tsx`

## API Usage

The application uses the Wikipedia API with the following parameters:
- `action=query`: Basic query action
- `prop=links`: Fetches article links
- `pllimit=500`: Maximum number of links to fetch
- `format=json`: JSON response format

## Error Handling

The application handles various error cases:
- Invalid Wikipedia URLs
- Missing articles
- API request failures
- Network issues

## Contributing

Feel free to submit issues and enhancement requests!
