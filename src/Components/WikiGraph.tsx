'use client';

import { useEffect, useRef, useState } from 'react';
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
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [linkDistance, setLinkDistance] = useState(300);
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [collisionRadius, setCollisionRadius] = useState(1);
  const [collisionStrength, setCollisionStrength] = useState(0.05);
  const [velocityDecay, setVelocityDecay] = useState(0.5);
  const simulationRef = useRef<d3.Simulation<WikiNode, undefined> | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create a group for all elements
    const g = svg.append('g');

    // Setup force simulation
    const simulation = d3.forceSimulation<WikiNode>(nodes)
      .force('link', d3.forceLink<WikiNode, WikiLink>(links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(collisionRadius).strength(collisionStrength))
      .alphaDecay(0.2)
      .velocityDecay(velocityDecay);

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', styles.link);

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', styles.node)
      .attr('r', 8)
      .call(drag(simulation) as any);

    // Create labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('class', styles.label)
      .text(d => d.title)
      .attr('dy', -10);

    // Add tooltips
    node.append('title')
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

    // Set loading to false when simulation is stable
    simulation.on('end', () => {
      setIsLoading(false);
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
  }, [nodes, links, dimensions, linkDistance, chargeStrength, collisionRadius, collisionStrength, velocityDecay]);

  const updateSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current
        .force('link', d3.forceLink<WikiNode, WikiLink>(links).id(d => d.id).distance(linkDistance))
        .force('charge', d3.forceManyBody().strength(chargeStrength))
        .force('collision', d3.forceCollide().radius(collisionRadius).strength(collisionStrength))
        .velocityDecay(velocityDecay)
        .alpha(0.3)
        .restart();
    }
  };

  const handleDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLinkDistance(parseInt(event.target.value));
    updateSimulation();
  };

  const handleChargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChargeStrength(parseInt(event.target.value));
    updateSimulation();
  };

  const handleCollisionRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCollisionRadius(parseInt(event.target.value));
    updateSimulation();
  };

  const handleCollisionStrengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCollisionStrength(parseFloat(event.target.value));
    updateSimulation();
  };

  const handleVelocityDecayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVelocityDecay(parseFloat(event.target.value));
    updateSimulation();
  };

  return (
    <div className={styles.graphContainer}>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="distance">Link Distance: {linkDistance}px</label>
          <input
            id="distance"
            type="range"
            min="50"
            max="500"
            value={linkDistance}
            onChange={handleDistanceChange}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="charge">Charge Strength: {chargeStrength}</label>
          <input
            id="charge"
            type="range"
            min="-500"
            max="-50"
            value={chargeStrength}
            onChange={handleChargeChange}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="collisionRadius">Collision Radius: {collisionRadius}</label>
          <input
            id="collisionRadius"
            type="range"
            min="1"
            max="30"
            value={collisionRadius}
            onChange={handleCollisionRadiusChange}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="collisionStrength">Collision Strength: {collisionStrength.toFixed(2)}</label>
          <input
            id="collisionStrength"
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={collisionStrength}
            onChange={handleCollisionStrengthChange}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="velocityDecay">Velocity Decay: {velocityDecay.toFixed(2)}</label>
          <input
            id="velocityDecay"
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={velocityDecay}
            onChange={handleVelocityDecayChange}
            className={styles.slider}
          />
        </div>
      </div>
      {isLoading && <div className={styles.loading}>Loading graph...</div>}
      <svg ref={svgRef} className={styles.svg} />
    </div>
  );
} 