import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/**
 * Default node component - rendered as a circle
 */
function DefaultNode({ data, selected }: NodeProps) {
  const size = 16;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ cursor: 'pointer' }}
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={data.color || '#6b7280'}
          stroke={selected ? '#1f2937' : '#374151'}
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

export default memo(DefaultNode);
