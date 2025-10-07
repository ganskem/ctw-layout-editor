import type { MapLayout } from '../types';

interface MapSettingsProps {
  layout: MapLayout;
  onLayoutChange: (layout: MapLayout) => void;
}

export default function MapSettings({ layout, onLayoutChange }: MapSettingsProps) {
  const handleChange = (field: keyof MapLayout, value: number) => {
    onLayoutChange({
      ...layout,
      [field]: value,
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: 250,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 12, fontSize: 14, fontWeight: 'bold' }}>
        Map Settings
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Team Side Width */}
        <div>
          <label
            htmlFor="teamSideWidth"
            style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#6b7280' }}
          >
            Team Side Width
          </label>
          <input
            id="teamSideWidth"
            type="number"
            min="1"
            value={layout.teamSideWidth}
            onChange={(e) => handleChange('teamSideWidth', parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: 6,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>

        {/* Team Side Height */}
        <div>
          <label
            htmlFor="teamSideHeight"
            style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#6b7280' }}
          >
            Team Side Height
          </label>
          <input
            id="teamSideHeight"
            type="number"
            min="1"
            value={layout.teamSideHeight}
            onChange={(e) => handleChange('teamSideHeight', parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: 6,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>

        {/* Middle Gap Width */}
        <div>
          <label
            htmlFor="middleGapWidth"
            style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#6b7280' }}
          >
            Middle Gap Width
          </label>
          <input
            id="middleGapWidth"
            type="number"
            min="0"
            value={layout.middleGapWidth}
            onChange={(e) => handleChange('middleGapWidth', parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: 6,
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>

        {/* Calculated Dimensions */}
        <div
          style={{
            marginTop: 8,
            padding: 8,
            backgroundColor: '#f3f4f6',
            borderRadius: 4,
            fontSize: 11,
            color: '#6b7280',
          }}
        >
          <div>Total Width: {layout.teamSideWidth * 2 + layout.middleGapWidth} units</div>
          <div>Total Height: {layout.teamSideHeight} units</div>
        </div>
      </div>
    </div>
  );
}
