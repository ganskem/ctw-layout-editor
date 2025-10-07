import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node as RFNode,
  type Edge as RFEdge,
  type OnConnect,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Toolbar from './components/Toolbar';
import MapSettings from './components/MapSettings';
import DetailsPanel from './components/DetailsPanel';
import { SpawnNode, WoolNode, DefaultNode } from './components/nodes';
import {
  Tool,
  NodeType,
  EdgeType,
  Team,
  Symmetry,
  type MapLayout,
  type Node,
  type Edge,
} from './types';
import { calculateCanvasSize, calculateMiddleLinePosition } from './utils';

// Define custom node types for ReactFlow
const nodeTypes: NodeTypes = {
  spawn: SpawnNode,
  wool: WoolNode,
  default: DefaultNode,
};

// Initial layout configuration
const initialLayout: MapLayout = {
  name: 'New Map',
  teamSideWidth: 10,
  teamSideHeight: 10,
  middleGapWidth: 2,
  symmetry: Symmetry.MIRROR,
};

function App() {
  // State management
  const [layout, setLayout] = useState<MapLayout>(initialLayout);
  const [activeTool, setActiveTool] = useState<Tool>(Tool.SELECT);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>(NodeType.DEFAULT);
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeForConnection, setSelectedEdgeForConnection] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<{ nodes: RFNode[]; edges: RFEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Counter for generating unique IDs
  const nodeIdCounter = useRef(1);
  const edgeIdCounter = useRef(1);

  // Custom nodes and edges state (matching our types)
  const [customNodes, setCustomNodes] = useState<Node[]>([]);
  const [customEdges, setCustomEdges] = useState<Edge[]>([]);

  // Calculate canvas dimensions
  const canvasSize = calculateCanvasSize(layout, 50);
  const middleLineX = calculateMiddleLinePosition(layout, 50);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Handle canvas click
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool === Tool.ADD_NODE) {
        // Get click position relative to ReactFlow pane
        const reactFlowBounds = (event.target as HTMLElement)
          .closest('.react-flow')
          ?.getBoundingClientRect();

        if (!reactFlowBounds) return;

        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        // Determine node type for ReactFlow
        let rfNodeType = 'default';
        if (selectedNodeType === NodeType.SPAWN) rfNodeType = 'spawn';
        else if (selectedNodeType === NodeType.WOOL_ROOM) rfNodeType = 'wool';

        // Create new node
        const newNode: RFNode = {
          id: `node-${nodeIdCounter.current++}`,
          type: rfNodeType,
          position,
          data: {
            label: `N${nodeIdCounter.current - 1}`,
            color:
              selectedNodeType === NodeType.SPAWN
                ? '#3b82f6'
                : selectedNodeType === NodeType.WOOL_ROOM
                ? '#f59e0b'
                : '#6b7280',
          },
        };

        saveToHistory();
        setNodes((nds) => [...nds, newNode]);

        // Also add to custom nodes
        const customNode: Node = {
          id: newNode.id,
          x: position.x,
          y: position.y,
          team: Team.WHITE,
          type: selectedNodeType,
          name: `Node ${nodeIdCounter.current - 1}`,
          isClassified: false,
        };
        setCustomNodes((ns) => [...ns, customNode]);
      } else if (activeTool === Tool.SELECT) {
        // Deselect when clicking empty space
        setSelectedId(null);
      }
    },
    [activeTool, selectedNodeType, saveToHistory, setNodes]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode) => {
      if (activeTool === Tool.SELECT) {
        setSelectedId(node.id);
      } else if (activeTool === Tool.DELETE) {
        saveToHistory();
        // Delete node and connected edges
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
        setCustomNodes((ns) => ns.filter((n) => n.id !== node.id));
        setCustomEdges((es) => es.filter((e) => e.startNodeId !== node.id && e.endNodeId !== node.id));
      } else if (activeTool === Tool.ADD_EDGE) {
        if (!selectedEdgeForConnection) {
          // First node selected
          setSelectedEdgeForConnection(node.id);
        } else if (selectedEdgeForConnection === node.id) {
          // Same node clicked - deselect
          setSelectedEdgeForConnection(null);
        } else {
          // Second node selected - create edge
          const newEdge: RFEdge = {
            id: `edge-${edgeIdCounter.current++}`,
            source: selectedEdgeForConnection,
            target: node.id,
            type: 'straight',
          };

          saveToHistory();
          setEdges((eds) => [...eds, newEdge]);

          // Also add to custom edges
          const customEdge: Edge = {
            id: newEdge.id,
            startNodeId: selectedEdgeForConnection,
            endNodeId: node.id,
            team: Team.WHITE,
            type: EdgeType.WALKWAY,
            weight: 1,
          };
          setCustomEdges((es) => [...es, customEdge]);

          setSelectedEdgeForConnection(null);
        }
      }
    },
    [activeTool, selectedEdgeForConnection, saveToHistory, setNodes, setEdges]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: RFEdge) => {
      if (activeTool === Tool.SELECT) {
        setSelectedId(edge.id);
      } else if (activeTool === Tool.DELETE) {
        saveToHistory();
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        setCustomEdges((es) => es.filter((e) => e.id !== edge.id));
      }
    },
    [activeTool, saveToHistory, setEdges]
  );

  // Handle ReactFlow connection
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (activeTool === Tool.ADD_EDGE || activeTool === Tool.SELECT) {
        const newEdge: RFEdge = {
          id: `edge-${edgeIdCounter.current++}`,
          source: connection.source!,
          target: connection.target!,
          type: 'straight',
        };

        saveToHistory();
        setEdges((eds) => [...eds, newEdge]);

        // Also add to custom edges
        const customEdge: Edge = {
          id: newEdge.id,
          startNodeId: connection.source!,
          endNodeId: connection.target!,
          team: Team.WHITE,
          type: EdgeType.WALKWAY,
          weight: 1,
        };
        setCustomEdges((es) => [...es, customEdge]);
      }
    },
    [activeTool, saveToHistory, setEdges]
  );

  // Handle clear tool
  const handleToolChange = useCallback(
    (tool: Tool) => {
      if (tool === Tool.CLEAR) {
        if (confirm('Are you sure you want to clear all nodes and edges?')) {
          saveToHistory();
          setNodes([]);
          setEdges([]);
          setCustomNodes([]);
          setCustomEdges([]);
          setSelectedId(null);
          setSelectedEdgeForConnection(null);
        }
      } else {
        setActiveTool(tool);
        setSelectedEdgeForConnection(null);
      }
    },
    [saveToHistory, setNodes, setEdges]
  );

  // Get selected node/edge for details panel
  const selectedNode = customNodes.find((n) => n.id === selectedId);
  const selectedEdge = customEdges.find((e) => e.id === selectedId);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'auto', backgroundColor: '#f3f4f6' }}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        selectedNodeType={selectedNodeType}
        onNodeTypeChange={setSelectedNodeType}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <MapSettings layout={layout} onLayoutChange={setLayout} />

      <DetailsPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        nodes={customNodes}
        edges={customEdges}
      />

      {/* Canvas Container - centered with calculated dimensions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '80px 20px 20px 200px',
        }}
      >
        <div
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            border: '2px solid #d1d5db',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            position: 'relative',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: '100%', height: '100%' }}
            
            // Constrain viewport and nodes to map boundaries
            translateExtent={[[0, 0], [canvasSize.width, canvasSize.height]]}
            nodeExtent={[[0, 0], [canvasSize.width, canvasSize.height]]}
            
            // Optional: snap to grid
            snapToGrid={true}
            snapGrid={[50, 50]}
            
            // Zoom limits
            minZoom={0.5}
            maxZoom={2}
            
            // Start at origin
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Lines} gap={50} size={1} />
            
            {/* Middle Line */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <line
                x1={middleLineX}
                y1={0}
                x2={middleLineX}
                y2={canvasSize.height}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            </svg>
          </ReactFlow>
        </div>
      </div>

      {/* Highlight selected node for edge connection */}
      {selectedEdgeForConnection && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 10,
          }}
        >
          Select second node to create edge
        </div>
      )}
    </div>
  );
}

export default App;
