import type { MapLayout } from '../types';

/**
 * Calculate the canvas dimensions based on map layout
 * @param layout Map layout configuration
 * @param cellSize Size of each grid cell in pixels
 * @returns Object containing width and height in pixels
 */
export function calculateCanvasSize(
  layout: MapLayout,
  cellSize: number = 50
): { width: number; height: number } {
  const totalWidth = layout.teamSideWidth * 2 + layout.middleGapWidth;
  const totalHeight = layout.teamSideHeight;

  return {
    width: totalWidth * cellSize,
    height: totalHeight * cellSize,
  };
}
