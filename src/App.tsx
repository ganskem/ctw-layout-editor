import { useState, useEffect, useRef } from 'react';

import Toolbar from './components/Toolbar';
import MapSettings from './components/MapSettings';
import DetailsPanel from './components/DetailsPanel';
import Canvas from './components/Canvas';
import {
  Tool,
  NodeType,
  Symmetry,
  type MapLayout,
  type Node,
  type Edge,
} from './types';
import { calculateCanvasSize } from './utils';

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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

   // Track temporary tool override with keyboard
  const temporaryToolRef = useRef<Tool | null>(null);
  const permanentToolRef = useRef<Tool>(Tool.SELECT);

  // Calculate canvas dimensions
  const canvasSize = calculateCanvasSize(layout, 50);

  // Get selected node/edge for details panel
  const selectedNode = nodes.find((n) => n.id === selectedId);
  const selectedEdge = edges.find((e) => e.id === selectedId);

  // Undo/Redo handlers (placeholders for now)
  const handleUndo = () => {
    console.log('Undo');
  };

  const handleRedo = () => {
    console.log('Redo');
  };

  // Handle tool change
  const handleToolChange = (tool: Tool) => {
    if (tool === Tool.CLEAR) {
      if (confirm('Are you sure you want to clear all nodes and edges?')) {
        setNodes([]);
        setEdges([]);
        setSelectedId(null);
        setActiveTool(Tool.SELECT);
        permanentToolRef.current = tool;
      }
    } else {
      setActiveTool(tool);
      permanentToolRef.current = tool;
    }
  };

    // Keyboard shortcuts for temporary tool switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Map keys to tools
      const keyToolMap: Record<string, Tool> = {
        'v': Tool.SELECT,        // V for select (like in Adobe tools)
        'n': Tool.ADD_NODE,      // N for node
        'e': Tool.ADD_EDGE,      // E for edge
        'r': Tool.RECTANGLE,     // R for rectangle
        'f': Tool.FIND_PATH,     // F for find path
        'd': Tool.DELETE,        // D for delete
      };

      const tool = keyToolMap[event.key.toLowerCase()];
      if (tool && !temporaryToolRef.current) {
        temporaryToolRef.current = tool;
        setActiveTool(tool);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyToolMap: Record<string, Tool> = {
        'v': Tool.SELECT,
        'n': Tool.ADD_NODE,
        'e': Tool.ADD_EDGE,
        'r': Tool.RECTANGLE,
        'f': Tool.FIND_PATH,
        'd': Tool.DELETE,
      };

      const tool = keyToolMap[event.key.toLowerCase()];
      if (tool && temporaryToolRef.current === tool) {
        // Return to permanent tool
        temporaryToolRef.current = null;
        setActiveTool(permanentToolRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'auto', backgroundColor: '#f3f4f6' }}>
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        selectedNodeType={selectedNodeType}
        onNodeTypeChange={setSelectedNodeType}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={false}
        canRedo={false}
      />

      <MapSettings layout={layout} onLayoutChange={setLayout} />

      <DetailsPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        nodes={nodes}
        edges={edges}
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
          <Canvas
            layout={layout}
            activeTool={activeTool}
            selectedNodeType={selectedNodeType}
            nodes={nodes}
            edges={edges}
            selectedId={selectedId}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onSelectionChange={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
