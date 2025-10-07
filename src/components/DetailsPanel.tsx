import type { Node, Edge } from '../types';
import { calculateEdgeLength } from '../utils';

interface DetailsPanelProps {
  selectedNode?: Node;
  selectedEdge?: Edge;
  nodes: Node[];
  edges: Edge[];
}

export default function DetailsPanel({
  selectedNode,
  selectedEdge,
  nodes,
}: DetailsPanelProps) {
  // Don't render if nothing is selected
  if (!selectedNode && !selectedEdge) {
    return null;
  }

  // Calculate edge length if an edge is selected
  let edgeLength = 0;
  if (selectedEdge) {
    const startNode = nodes.find((n) => n.id === selectedEdge.startNodeId);
    const endNode = nodes.find((n) => n.id === selectedEdge.endNodeId);
    if (startNode && endNode) {
      edgeLength = calculateEdgeLength(startNode, endNode);
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 200,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 12, fontSize: 14, fontWeight: 'bold' }}>
        {selectedNode ? 'Node Details' : 'Edge Details'}
      </h3>

      {selectedNode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Name</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedNode.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Type</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedNode.type}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Team</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedNode.team}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Coordinates</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              ({selectedNode.x.toFixed(0)}, {selectedNode.y.toFixed(0)})
            </div>
          </div>
          {selectedNode.woolColor && (
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Wool Color</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedNode.woolColor}</div>
            </div>
          )}
        </div>
      )}

      {selectedEdge && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>ID</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEdge.id}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Type</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEdge.type}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Team</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEdge.team}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Length</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{edgeLength.toFixed(2)} units</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Weight</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEdge.weight}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Connection</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {selectedEdge.startNodeId} → {selectedEdge.endNodeId}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
