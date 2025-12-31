export type HexColor = string;
export type NodeIcon = 'circle' | 'square' | 'diamond' | 'star' | 'hexagon' | 'triangle' | 'user' | 'building' | 'folder' | 'file' | 'database' | 'server' | 'globe' | 'heart' | 'zap' | 'shield';

export const NODE_ICONS: NodeIcon[] = ['circle', 'square', 'diamond', 'star', 'hexagon', 'triangle', 'user', 'building', 'folder', 'file', 'database', 'server', 'globe', 'heart', 'zap', 'shield'];

export interface NodeType {
  colour: HexColor;
  label: string;
  icon?: NodeIcon;
}

export interface EdgeType {
  colour: HexColor;
  label: string;
}

export interface Node {
  node_type: string;
  label: string;
  properties: Record<string, string>;
  layout_properties: {
    x_pos: number;
    y_pos: number;
  };
}

export interface Edge {
  from_node: string;
  to_node: string;
  edge_type: string;
  weight: number;
  properties: Record<string, string>;
}

export interface GraphData {
  node_types: Record<string, NodeType>;
  edge_types: Record<string, EdgeType>;
  nodes: Record<string, Node>;
  edges: Record<string, Edge>;
}
