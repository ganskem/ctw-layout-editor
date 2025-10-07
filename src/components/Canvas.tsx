import { useState, useCallback, useRef } from 'react';
import {
  Tool,
  NodeType,
  EdgeType,
  Team,
  type MapLayout,
  type Node,
  type Edge,
} from '../types';
import { snapToGridCenter } from '../utils';

interface CanvasProps {
  layout: MapLayout;
  activeTool: Tool;
  selectedNodeType: NodeType;
  nodes: Node[];
  edges: Edge[];
  selectedId: string | null;
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onSelectionChange: (id: string | null) => void;
}

export default function Canvas({
  layout,
  activeTool,
  selectedNodeType,
  nodes,
  edges,
  selectedId,
  onNodesChange,
  onEdgesChange,
  onSelectionChange,
}: CanvasProps) {
  const [selectedNodeForEdge, setSelectedNodeForEdge] = useState<string | null>(null);

  const nodeIdCounter = useRef(1);
  const edgeIdCounter = useRef(1);

  // Calculate canvas dimensions
  const gridSize = 50;
  const canvasWidth = (layout.teamSideWidth * 2 + layout.middleGapWidth) * gridSize;
  const canvasHeight = layout.teamSideHeight * gridSize;
  const middleX = (layout.teamSideWidth + layout.middleGapWidth / 2) * gridSize;

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const rawX = event.clientX - rect.left;
      const rawY = event.clientY - rect.top;

      // Snap to grid center
      const snapped = snapToGridCenter({ x: rawX, y: rawY }, gridSize);

      if (activeTool === Tool.ADD_NODE) {
        // Check if a node already exists at these coordinates
        const nodeExists = nodes.some((node) => node.x === snapped.x && node.y === snapped.y);

        if (!nodeExists) {
          // Create new node
          const newNode: Node = {
            id: `node-${nodeIdCounter.current++}`,
            x: snapped.x,
            y: snapped.y,
            team: Team.WHITE,
            type: selectedNodeType,
            name: `Node ${nodeIdCounter.current - 1}`,
            isClassified: false,
          };
          onNodesChange([...nodes, newNode]);
        }
      } else if (activeTool === Tool.SELECT) {
        // Deselect
        onSelectionChange(null);
        setSelectedNodeForEdge(null);
      }
    },
    [activeTool, selectedNodeType, gridSize, nodes, onNodesChange, onSelectionChange]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();

      if (activeTool === Tool.SELECT) {
        onSelectionChange(nodeId);
      } else if (activeTool === Tool.DELETE) {
        // Delete node and connected edges
        onNodesChange(nodes.filter((n) => n.id !== nodeId));
        onEdgesChange(edges.filter((e) => e.startNodeId !== nodeId && e.endNodeId !== nodeId));
      } else if (activeTool === Tool.ADD_EDGE) {
        if (!selectedNodeForEdge) {
          // First node selected
          setSelectedNodeForEdge(nodeId);
        } else if (selectedNodeForEdge === nodeId) {
          // Deselect same node
          setSelectedNodeForEdge(null);
        } else {
          // Create edge
          const startNode = nodes.find((n) => n.id === selectedNodeForEdge);
          const endNode = nodes.find((n) => n.id === nodeId);

          if (startNode && endNode) {
            const dx = endNode.x - startNode.x;
            const dy = endNode.y - startNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            const newEdge: Edge = {
              id: `edge-${edgeIdCounter.current++}`,
              startNodeId: selectedNodeForEdge,
              endNodeId: nodeId,
              team: Team.WHITE,
              type: EdgeType.WALKWAY,
              weight: Math.round(length / gridSize),
            };
            onEdgesChange([...edges, newEdge]);
          }
          setSelectedNodeForEdge(null);
        }
      }
    },
    [activeTool, selectedNodeForEdge, nodes, edges, gridSize, onNodesChange, onEdgesChange, onSelectionChange]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edgeId: string) => {
      event.stopPropagation();

      if (activeTool === Tool.SELECT) {
        onSelectionChange(edgeId);
      } else if (activeTool === Tool.DELETE) {
        onEdgesChange(edges.filter((e) => e.id !== edgeId));
      }
    },
    [activeTool, edges, onEdgesChange, onSelectionChange]
  );

  // Render grid
  const renderGrid = () => {
    const lines = [];
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  // Render node
  const renderNode = (node: Node) => {
    const isSelected = selectedId === node.id;
    const isHighlighted = selectedNodeForEdge === node.id;
    const size = node.type === NodeType.SPAWN ? 20 : node.type === NodeType.WOOL_ROOM ? 24 : 16;
    const color = node.type === NodeType.SPAWN ? '#3b82f6' : node.type === NodeType.WOOL_ROOM ? '#f59e0b' : '#6b7280';

    if (node.type === NodeType.SPAWN) {
      // Square
      return (
        <rect
          key={node.id}
          x={node.x - size / 2}
          y={node.y - size / 2}
          width={size}
          height={size}
          fill={color}
          stroke={isSelected ? '#1e40af' : isHighlighted ? '#3b82f6' : '#1e3a8a'}
          strokeWidth={isSelected ? 3 : isHighlighted ? 3 : 1}
          style={{ cursor: 'pointer' }}
          onClick={(e) => handleNodeClick(e, node.id)}
        />
      );
    } else if (node.type === NodeType.WOOL_ROOM) {
      // Hexagon
      const points = [
        `${node.x},${node.y - size / 2}`,
        `${node.x + size / 2},${node.y - size / 4}`,
        `${node.x + size / 2},${node.y + size / 4}`,
        `${node.x},${node.y + size / 2}`,
        `${node.x - size / 2},${node.y + size / 4}`,
        `${node.x - size / 2},${node.y - size / 4}`,
      ].join(' ');

      return (
        <polygon
          key={node.id}
          points={points}
          fill={color}
          stroke={isSelected ? '#b45309' : isHighlighted ? '#f59e0b' : '#d97706'}
          strokeWidth={isSelected ? 3 : isHighlighted ? 3 : 1}
          style={{ cursor: 'pointer' }}
          onClick={(e) => handleNodeClick(e, node.id)}
        />
      );
    } else {
      // Circle (default)
      return (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={size / 2}
          fill={color}
          stroke={isSelected ? '#1f2937' : isHighlighted ? '#6b7280' : '#374151'}
          strokeWidth={isSelected ? 3 : isHighlighted ? 3 : 1}
          style={{ cursor: 'pointer' }}
          onClick={(e) => handleNodeClick(e, node.id)}
        />
      );
    }
  };

  // Render edge
  const renderEdge = (edge: Edge) => {
    const startNode = nodes.find((n) => n.id === edge.startNodeId);
    const endNode = nodes.find((n) => n.id === edge.endNodeId);

    if (!startNode || !endNode) return null;

    const isSelected = selectedId === edge.id;

    return (
      <line
        key={edge.id}
        x1={startNode.x}
        y1={startNode.y}
        x2={endNode.x}
        y2={endNode.y}
        stroke={isSelected ? '#3b82f6' : '#9ca3af'}
        strokeWidth={isSelected ? 3 : 2}
        style={{ cursor: 'pointer' }}
        onClick={(e) => handleEdgeClick(e, edge.id)}
      />
    );
  };

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{
        width: '100%',
        height: '100%',
        cursor: activeTool === Tool.ADD_NODE ? 'crosshair' : 'default',
      }}
      onClick={handleCanvasClick}
    >
      {/* Grid */}
      {renderGrid()}

      {/* Middle line */}
      <line
        x1={middleX}
        y1={0}
        x2={middleX}
        y2={canvasHeight}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="5,5"
      />

      {/* Edges (render first so they're behind nodes) */}
      {edges.map(renderEdge)}

      {/* Nodes */}
      {nodes.map(renderNode)}

      {/* Helper text */}
      {selectedNodeForEdge && (
        <text
          x={canvasWidth / 2}
          y={20}
          textAnchor="middle"
          fill="#3b82f6"
          fontSize={14}
          fontWeight="bold"
        >
          Select second node to create edge
        </text>
      )}
    </svg>
  );
}
