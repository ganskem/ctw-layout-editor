import {
  CursorArrowRaysIcon,
  PlusCircleIcon,
  ArrowsPointingOutIcon,
  RectangleGroupIcon,
  MapIcon,
  TrashIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { Tool, NodeType } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedNodeType: NodeType;
  onNodeTypeChange: (type: NodeType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const toolConfig = [
  { tool: Tool.SELECT, icon: CursorArrowRaysIcon, label: 'Select' },
  { tool: Tool.ADD_NODE, icon: PlusCircleIcon, label: 'Add Node' },
  { tool: Tool.ADD_EDGE, icon: ArrowsPointingOutIcon, label: 'Add Edge' },
  { tool: Tool.RECTANGLE, icon: RectangleGroupIcon, label: 'Rectangle' },
  { tool: Tool.FIND_PATH, icon: MapIcon, label: 'Find Path' },
  { tool: Tool.DELETE, icon: TrashIcon, label: 'Delete' },
  { tool: Tool.CLEAR, icon: XMarkIcon, label: 'Clear' },
];

const nodeTypeConfig = [
  { type: NodeType.SPAWN, label: 'Spawn', color: '#3b82f6' },
  { type: NodeType.WOOL_ROOM, label: 'Wool', color: '#f59e0b' },
  { type: NodeType.DEFAULT, label: 'Default', color: '#6b7280' },
];

export default function Toolbar({
  activeTool,
  onToolChange,
  selectedNodeType,
  onNodeTypeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
        CTW Map Editor
      </div>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            padding: 8,
            border: '1px solid #d1d5db',
            borderRadius: 4,
            backgroundColor: canUndo ? 'white' : '#f3f4f6',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Undo"
        >
          <ArrowUturnLeftIcon style={{ width: 20, height: 20 }} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            padding: 8,
            border: '1px solid #d1d5db',
            borderRadius: 4,
            backgroundColor: canRedo ? 'white' : '#f3f4f6',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Redo"
        >
          <ArrowUturnRightIcon style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e5e7eb' }} />

      {/* Tools */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {toolConfig.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            style={{
              padding: 8,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              backgroundColor: activeTool === tool ? '#3b82f6' : 'white',
              color: activeTool === tool ? 'white' : '#1f2937',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
            title={label}
          >
            <Icon style={{ width: 20, height: 20 }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Node Type Selector (shown when ADD_NODE is active) */}
      {activeTool === Tool.ADD_NODE && (
        <>
          <div style={{ borderTop: '1px solid #e5e7eb' }} />
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280' }}>
            Node Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {nodeTypeConfig.map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => onNodeTypeChange(type)}
                style={{
                  padding: 8,
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  backgroundColor: selectedNodeType === type ? color : 'white',
                  color: selectedNodeType === type ? 'white' : '#1f2937',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: color,
                    borderRadius:
                      type === NodeType.DEFAULT
                        ? '50%'
                        : type === NodeType.SPAWN
                        ? '0'
                        : '2px',
                  }}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
