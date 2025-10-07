import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/**
 * Wool node component - rendered as a hexagon
 */
function WoolNode({ data, selected }: NodeProps) {
  const size = 24;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ cursor: 'pointer' }}
      >
        <polygon
          points="50,5 90,30 90,70 50,95 10,70 10,30"
          fill={data.color || '#f59e0b'}
          stroke={selected ? '#b45309' : '#d97706'}
          strokeWidth={selected ? 8 : 4}
        />
      </svg>
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

export default memo(WoolNode);
