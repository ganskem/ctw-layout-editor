import { useState } from 'react';

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
      }
    } else {
      setActiveTool(tool);
    }
  };

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
