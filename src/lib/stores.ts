import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { GraphData } from './types';

const defaultGraphData: GraphData = {
  node_types: {
    node_type_1: {
      colour: '#ef4444',
      label: 'Person',
      icon: 'user'
    },
    node_type_2: {
      colour: '#3b82f6',
      label: 'Location',
      icon: 'building'
    }
  },
  edge_types: {
    edge_type_1: {
      colour: '#22c55e',
      label: 'Knows'
    }
  },
  nodes: {},
  edges: {}
};

function createPersistentStore<T>(key: string, defaultValue: T) {
  let initial = defaultValue;
  
  if (browser) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        initial = JSON.parse(stored);
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
      }
    }
  }
  
  const store = writable<T>(initial);
  
  if (browser) {
    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }
  
  return store;
}

export const graphData = createPersistentStore<GraphData>('graphedit-data', defaultGraphData);
export const darkMode = createPersistentStore<boolean>('graphedit-darkmode', true);

export const selectedNodeId = writable<string | null>(null);
export const selectedEdgeId = writable<string | null>(null);
export const activeNodeType = writable<string>('node_type_1');
export const activeEdgeType = writable<string>('edge_type_1');
export const isDragging = writable<boolean>(false);
export const isCreatingEdge = writable<boolean>(false);
export const edgeStartNode = writable<string | null>(null);
export const canvasZoom = createPersistentStore<number>('graphedit-zoom', 1);
export const canvasPan = createPersistentStore<{ x: number; y: number }>('graphedit-pan', { x: 0, y: 0 });

export function resetGraph() {
  graphData.set(JSON.parse(JSON.stringify(defaultGraphData)));
  selectedNodeId.set(null);
  selectedEdgeId.set(null);
  canvasZoom.set(1);
  canvasPan.set({ x: 0, y: 0 });
}

export { defaultGraphData };
