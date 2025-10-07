import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/**
 * Spawn node component - rendered as a square
 */
function SpawnNode({ data, selected }: NodeProps) {
  const size = 20;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: data.color || '#3b82f6',
          border: selected ? '2px solid #1e40af' : '1px solid #1e3a8a',
          cursor: 'pointer',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export default memo(SpawnNode);
