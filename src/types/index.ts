// Type definitions for CTW Map Editor

/**
 * Minecraft wool colors representing team colors and wool objectives
 * Includes all 16 standard Minecraft wool colors
 */
export enum Team {
  WHITE = 'WHITE',
  ORANGE = 'ORANGE',
  MAGENTA = 'MAGENTA',
  LIGHT_BLUE = 'LIGHT_BLUE',
  YELLOW = 'YELLOW',
  LIME = 'LIME',
  PINK = 'PINK',
  GRAY = 'GRAY',
  LIGHT_GRAY = 'LIGHT_GRAY',
  CYAN = 'CYAN',
  PURPLE = 'PURPLE',
  BLUE = 'BLUE',
  BROWN = 'BROWN',
  GREEN = 'GREEN',
  RED = 'RED',
  BLACK = 'BLACK'
}

/**
 * Minecraft wool colors for wool objectives
 * Alias of Team enum for semantic clarity
 */
export enum WoolColor {
  WHITE = 'WHITE',
  ORANGE = 'ORANGE',
  MAGENTA = 'MAGENTA',
  LIGHT_BLUE = 'LIGHT_BLUE',
  YELLOW = 'YELLOW',
  LIME = 'LIME',
  PINK = 'PINK',
  GRAY = 'GRAY',
  LIGHT_GRAY = 'LIGHT_GRAY',
  CYAN = 'CYAN',
  PURPLE = 'PURPLE',
  BLUE = 'BLUE',
  BROWN = 'BROWN',
  GREEN = 'GREEN',
  RED = 'RED',
  BLACK = 'BLACK'
}

/**
 * Types of nodes in a CTW map layout
 */
export enum NodeType {
  /** Team spawn point */
  SPAWN = 'SPAWN',
  /** Room containing wool objective */
  WOOL_ROOM = 'WOOL_ROOM',
  /** Default/generic node */
  DEFAULT = 'DEFAULT',
  /** Entry point to wool room */
  WOOL_ENTRY = 'WOOL_ENTRY',
  /** Entry point from spawn */
  SPAWN_ENTRY = 'SPAWN_ENTRY',
  /** Central hub or junction point */
  HUB = 'HUB',
  /** Frontline combat area */
  FRONTLINE = 'FRONTLINE',
  /** Corridor or passageway */
  CORRIDOR = 'CORRIDOR'
}

/**
 * Types of edges connecting nodes in the map
 */
export enum EdgeType {
  /** Standard walkway connection */
  WALKWAY = 'WALKWAY',
  /** Bridge connection (typically elevated or over void) */
  BRIDGE = 'BRIDGE'
}

/**
 * Map symmetry types
 */
export enum Symmetry {
  /** Mirror symmetry across vertical axis */
  MIRROR = 'MIRROR',
  /** 180-degree rotational symmetry */
  ROTATE = 'ROTATE'
}

/**
 * Editor tools for map manipulation
 */
export enum Tool {
  /** Select and move nodes/edges */
  SELECT = 'SELECT',
  /** Add new node */
  ADD_NODE = 'ADD_NODE',
  /** Add new edge */
  ADD_EDGE = 'ADD_EDGE',
  /** Draw rectangle selection */
  RECTANGLE = 'RECTANGLE',
  /** Find path between nodes */
  FIND_PATH = 'FIND_PATH',
  /** Delete nodes/edges */
  DELETE = 'DELETE',
  /** Clear all nodes/edges */
  CLEAR = 'CLEAR'
}

/**
 * Node representing a location or point of interest in the CTW map
 */
export interface Node {
  /** Unique identifier for the node */
  id: string;
  /** X coordinate in the grid */
  x: number;
  /** Y coordinate in the grid */
  y: number;
  /** Team that controls or owns this node */
  team: Team;
  /** Type of node (spawn, wool room, etc.) */
  type: NodeType;
  /** Human-readable name for the node */
  name: string;
  /** ID of the mirrored/symmetric counterpart node (if symmetry is enabled) */
  mirroredId?: string;
  /** Wool color for wool room nodes */
  woolColor?: WoolColor;
  /**
   * Whether this node type has been classified/determined automatically
   * false = manually placed, true = auto-classified by algorithm
   */
  isClassified?: boolean;
}

/**
 * Edge representing a connection between two nodes
 */
export interface Edge {
  /** Unique identifier for the edge */
  id: string;
  /** ID of the starting node */
  startNodeId: string;
  /** ID of the ending node */
  endNodeId: string;
  /** Team that controls or owns this edge */
  team: Team;
  /** Type of edge (walkway, bridge, etc.) */
  type: EdgeType;
  /** Weight/cost for pathfinding algorithms */
  weight: number;
  /** ID of the mirrored/symmetric counterpart edge (if symmetry is enabled) */
  mirroredId?: string;
}

/**
 * Layout configuration defining the map structure and symmetry
 */
export interface MapLayout {
  /** Name of the map layout */
  name: string;
  /** Width of each team's side in grid units */
  teamSideWidth: number;
  /** Width of the middle gap/neutral zone in grid units */
  middleGapWidth: number;
  /** Height of team sides in grid units */
  teamSideHeight: number;
  /** Whether teams have internal symmetry within their own side */
  internalTeamSymmetry?: boolean;
  /** Type of symmetry between team sides */
  symmetry: Symmetry;
}

/**
 * Complete state of the map editor
 */
export interface MapState {
  /** Current layout configuration */
  layout: MapLayout;
  /** All nodes in the map */
  nodes: Node[];
  /** All edges in the map */
  edges: Edge[];
  /** ID of currently selected node or edge (if any) */
  selectedId: string | null;
  /** Color assignments for each team */
  teamColors: Map<Team, string>;
}

/**
 * Path result containing sequence of nodes and edges
 * Used for pathfinding and route visualization
 */
export interface Path {
  /** Ordered sequence of node IDs forming the path */
  nodes: string[];
  /** Ordered sequence of edge IDs forming the path */
  edges: string[];
  /** Total weight/cost of the path */
  totalWeight: number;
}
