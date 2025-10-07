/**
 * Snap a position to the center of a grid cell
 * @param position Raw position coordinates
 * @param gridSize Size of grid cells in pixels
 * @returns Position snapped to grid cell center
 */
export function snapToGridCenter(
  position: { x: number; y: number },
  gridSize: number = 50
): { x: number; y: number } {
  // Calculate which grid cell the position is in
  const cellX = Math.floor(position.x / gridSize);
  const cellY = Math.floor(position.y / gridSize);

  // Return the center of that cell
  return {
    x: cellX * gridSize + gridSize / 2,
    y: cellY * gridSize + gridSize / 2,
  };
}
