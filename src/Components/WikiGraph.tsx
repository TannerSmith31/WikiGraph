'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles/graph.module.css';

/**
 * Interface representing a node in the graph
 * Includes D3 force simulation properties (x, y, fx, fy)
 */
interface WikiNode {
  id: string;
  title: string;
  x?: number;      // Current x position
  y?: number;      // Current y position
  fx?: number | null;  // Fixed x position (for dragging)
  fy?: number | null;  // Fixed y position (for dragging)
}

/**
 * Interface representing a link between nodes
 * Source and target can be either string IDs or WikiNode objects
 */
interface WikiLink {
  source: string | WikiNode;
  target: string | WikiNode;
}

/**
 * Props for the WikiGraph component
 */
interface WikiGraphProps {
  nodes: WikiNode[];
  links: WikiLink[];
}

/**
 * A D3 force-directed graph component for visualizing Wikipedia article relationships
 * Features:
 * - Interactive force simulation
 * - Draggable nodes
 * - Node labels
 * - Automatic layout
 */
export default function WikiGraph({ nodes, links }: WikiGraphProps) {
  // Reference to the SVG element
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup dimensions
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Setup force simulation
    const simulation = d3.forceSimulation<WikiNode>(nodes)
      .force('link', d3.forceLink<WikiNode, WikiLink>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', styles.link);

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', styles.node)
      .call(drag(simulation) as any);

    // Create labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('class', styles.label)
      .text(d => d.title);

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as WikiNode).x || 0)
        .attr('y1', d => (d.source as WikiNode).y || 0)
        .attr('x2', d => (d.target as WikiNode).x || 0)
        .attr('y2', d => (d.target as WikiNode).y || 0);

      node
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);

      label
        .attr('x', d => d.x || 0)
        .attr('y', d => d.y || 0);
    });

    /**
     * Creates a drag behavior for the nodes
     * @param simulation - The D3 force simulation
     * @returns A D3 drag behavior
     */
    function drag(simulation: d3.Simulation<WikiNode, undefined>) {
      // Start dragging: fix the node's position
      function dragstarted(event: d3.D3DragEvent<SVGCircleElement, WikiNode, WikiNode>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      // During drag: update the node's position
      function dragged(event: d3.D3DragEvent<SVGCircleElement, WikiNode, WikiNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      // End drag: release the node to continue simulation
      function dragended(event: d3.D3DragEvent<SVGCircleElement, WikiNode, WikiNode>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<SVGCircleElement, WikiNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [nodes, links]);

  return <svg ref={svgRef} className={styles.svg} />;
} 