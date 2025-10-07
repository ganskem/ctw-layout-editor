import type { MapLayout } from '../types';

/**
 * Calculate the X position of the middle line (map center)
 * Position is either the middle of the gap or the edge of the team side
 * @param layout Map layout configuration
 * @param cellSize Size of each grid cell in pixels
 * @returns X coordinate in pixels
 */
export function calculateMiddleLinePosition(
  layout: MapLayout,
  cellSize: number = 50
): number {
  // Middle is at teamSideWidth + (middleGapWidth / 2)
  return (layout.teamSideWidth + layout.middleGapWidth / 2) * cellSize;
}
