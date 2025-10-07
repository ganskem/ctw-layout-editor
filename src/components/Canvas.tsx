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
  const [placementWarning, setPlacementWarning] =useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const nodeIdCounter = useRef(1);
  const edgeIdCounter = useRef(1);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate canvas dimensions
  const gridSize = 50;
  const canvasWidth = (layout.teamSideWidth * 2 + layout.middleGapWidth) * gridSize;
  const canvasHeight = layout.teamSideHeight * gridSize;
  const middleX = (layout.teamSideWidth + layout.middleGapWidth / 2) * gridSize;

  // Find the counterpart of a node in a mirrored pair
  function getMirroredNodeId(nodeId: string, nodes: Node[]): string | null {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    if (node.mirroredId) return node.mirroredId;

    const mirrored = nodes.find(n => n.mirroredId === nodeId);
    return mirrored ? mirrored.id : null;
  }

  // Find the counterpart of a node in a mirrored pair
  function getMirroredEdgeId(edgeId: string, edges: Edge[]): string | null {
    const edge = edges.find(n => n.id === edgeId);
    if (!edge) return null;

    if (edge.mirroredId) return edge.mirroredId;

    const mirrored = edges.find(e => e.mirroredId === edgeId);
    return mirrored ? mirrored.id : null;
  }

  // Convert screen coordinates to SVG coordinates (accounting for zoom and pan)
  const screenToSVG = useCallback(
    (screenX: number, screenY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: screenX, y: screenY };

      const rect = svg.getBoundingClientRect();
      const x = (screenX - rect.left - pan.x) / zoom;
      const y = (screenY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [zoom, pan]
  );
  
  // Handle mouse wheel for zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(0.1, zoom * delta), 5);

      // Zoom towards mouse cursor
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const newPan = {
          x: mouseX - ((mouseX - pan.x) / zoom) * newZoom,
          y: mouseY - ((mouseY - pan.y) / zoom) * newZoom,
        };

        setZoom(newZoom);
        setPan(newPan);
      }
    },
    [zoom, pan]
  );

  // Handle mouse down for panning (Shift + Left Click in any mode)
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event.button === 0 && event.shiftKey) {
        event.preventDefault();
        setIsPanning(true);
        setPanStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
      }
    },
    [pan]
  );

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (isPanning) {
        setPan({
          x: event.clientX - panStart.x,
          y: event.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart]
  );

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset view to default zoom and pan
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      // Don't process clicks if we were panning or shift is held
      if (isPanning || event.shiftKey) return;

      const coords = screenToSVG(event.clientX, event.clientY);

      // Snap to grid center
      const snapped = snapToGridCenter(coords, gridSize);

      if (activeTool === Tool.ADD_NODE) {
        // Check if the node is added to the left side of the grid
        const leftSideLimitX = (layout.teamSideWidth + (layout.middleGapWidth / 2)) * gridSize

        if (snapped.x > leftSideLimitX) {
          setPlacementWarning("Node placement restricted to the left team's area.")
          setTimeout(() => setPlacementWarning(null), 3000)
          return;
        }

        // Check if a node already exists at these coordinates
        const nodeExists = nodes.some((node) => node.x === snapped.x && node.y === snapped.y);

        if (!nodeExists) {
          const primaryIndex = nodeIdCounter.current++;
          const primaryId = `node-${primaryIndex}`;

          // Create new node
          const newNode: Node = {
            id: primaryId,
            x: snapped.x,
            y: snapped.y,
            team: Team.WHITE,
            type: selectedNodeType,
            name: `Node ${primaryIndex}`,
            isClassified: false,
          };

          const distanceToCenter = middleX - snapped.x;
          const mirroredX = middleX + distanceToCenter;

          const mirroredIndex = nodeIdCounter.current++
          const mirroredId = `node-${mirroredIndex}`;

          const mirroredNode: Node = {
            id: mirroredId,
            x: mirroredX,
            y: snapped.y,
            team: Team.BLACK,
            type: selectedNodeType,
            name: `Node ${mirroredIndex}`,
            isClassified: false,
            mirroredId: primaryId,
          };
          onNodesChange([...nodes, newNode, mirroredNode]);
        }
      } else if (activeTool === Tool.SELECT) {
        // Deselect
        onSelectionChange(null);
        setSelectedNodeForEdge(null);
      }
    },
    [activeTool, selectedNodeType, gridSize, nodes, onNodesChange, onSelectionChange, isPanning, screenToSVG]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();

      if (activeTool === Tool.SELECT) {
        onSelectionChange(nodeId);
      } else if (activeTool === Tool.DELETE) {
        const counterpartId = getMirroredNodeId(nodeId, nodes);

        const toDelete = new Set<string>([nodeId]);
        if (counterpartId) toDelete.add(counterpartId);

        const remainingNodes = nodes.filter(n => !toDelete.has(n.id));
        const remainingEdges = edges.filter(
          e => !toDelete.has(e.startNodeId) && !toDelete.has(e.endNodeId)
        );

        onNodesChange(remainingNodes);
        onEdgesChange(remainingEdges);

        // Clear selection if it referenced a deleted element
        if (selectedId && (toDelete.has(selectedId) ||
            edges.some(e => e.id === selectedId) && !remainingEdges.some(e => e.id === selectedId))) {
          onSelectionChange(null);
        }
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

            const primaryIndex = edgeIdCounter.current++;
            const primaryId = `edge-${primaryIndex}`;

            const newEdge: Edge = {
              id: primaryId,
              startNodeId: selectedNodeForEdge,
              endNodeId: nodeId,
              team: Team.WHITE,
              type: EdgeType.WALKWAY,
              weight: Math.round(length / gridSize),
            };

            const mirroredIndex = edgeIdCounter.current++
            const mirroredId = `edge-${mirroredIndex}`;
            const mirroredStartNodeId = getMirroredNodeId(selectedNodeForEdge, nodes);
            const mirroredEndNodeId = getMirroredNodeId(nodeId, nodes);
            
            if (mirroredStartNodeId && mirroredEndNodeId) {
              const mirroredEdge: Edge = {
                id: mirroredId,
                startNodeId: mirroredStartNodeId,
                endNodeId: mirroredEndNodeId,
                team: Team.BLACK,
                type: newEdge.type,
                weight: newEdge.weight,
                mirroredId: newEdge.id,
              }

              onEdgesChange([...edges, newEdge, mirroredEdge]);
            } else {
              onEdgesChange([...edges, newEdge]);
            }           
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
        const counterpartId = getMirroredEdgeId(edgeId, edges);

        const toDelete = new Set<string>([edgeId]);
        if (counterpartId) toDelete.add(counterpartId);

        const remainingEdges = edges.filter(e => !toDelete.has(e.id));
        onEdgesChange(remainingEdges)

        if (selectedId && toDelete.has(selectedId)) {
          onSelectionChange(null);
        }
      }
    },
    [activeTool, edges, selectedId, onEdgesChange, onSelectionChange]
  );

  // Render grid
  const renderGrid = () => {
    const elements = [];

    // Calculate middle gap boundaries
    const middleGapStartX = layout.teamSideWidth * gridSize;
    const middleGapEndX = (layout.teamSideWidth + layout.middleGapWidth) * gridSize;

    // Render middle gap background cells
    for (let x = middleGapStartX; x < middleGapEndX; x += gridSize) {
      for (let y = 0; y < canvasHeight; y += gridSize) {
        elements.push(
          <rect
            key={`gap-${x}-${y}`}
            x={x}
            y={y}
            width={gridSize}
            height={gridSize}
            fill="#fee2e2"
            stroke="none"
          />
        );
      }
    }

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      elements.push(
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
      elements.push(
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
    return elements;
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
      ref={svgRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        width: '100%',
        height: '100%',
        cursor: isPanning ? 'grabbing' : activeTool === Tool.ADD_NODE ? 'crosshair' : 'default',
      }}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
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

        {/* Node placement warning */}
        {placementWarning && (
          <text
            x={canvasWidth / 2}
            y={20}
            textAnchor="middle"
            fill="#dc2626"
            fontSize={14}
            fontWeight="bold"
          >
            {placementWarning}
          </text>
        )}
      </g>

      {/* Controls info - positioned outside the transform group */}
      <g>
        <rect
          x={10}
          y={10}
          width={200}
          height={145}
          fill="white"
          stroke="#d1d5db"
          strokeWidth={1}
          rx={4}
          opacity={0.95}
        />
        <text x={20} y={30} fontSize={12} fill="#374151" fontWeight="bold">
          Canvas Controls
        </text>
        <text x={20} y={48} fontSize={11} fill="#6b7280">
          Mouse Wheel: Zoom in/out
        </text>
        <text x={20} y={64} fontSize={11} fill="#6b7280">
          Shift + Drag: Pan canvas
        </text>
        <text x={20} y={85} fontSize={12} fill="#374151" fontWeight="bold">
          Keyboard Shortcuts (Hold)
        </text>
        <text x={20} y={101} fontSize={10} fill="#6b7280">
          V: Select  |  N: Add Node  |  E: Add Edge
        </text>
        <text x={20} y={115} fontSize={10} fill="#6b7280">
          R: Rectangle  |  F: Find Path  |  D: Delete
        </text>
        <text
          x={20}
          y={135}
          fontSize={11}
          fill="#3b82f6"
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={handleResetView}
        >
          Click here to reset view
        </text>
      </g>
    </svg>
  );
}
