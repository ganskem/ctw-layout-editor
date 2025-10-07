import type { Node } from '../types';

/**
 * Calculate the Euclidean distance between two nodes
 * @param node1 First node
 * @param node2 Second node
 * @returns Distance between the nodes
 */
export function calculateEdgeLength(node1: Node, node2: Node): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
