import { writable, get } from 'svelte/store';
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
      label: 'Knows',
      line_style: 'solid'
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
export const selectedNodeIds = writable<string[]>([]);
export const selectedEdgeIds = writable<string[]>([]);
export const activeNodeType = writable<string>('node_type_1');
export const activeEdgeType = writable<string>('edge_type_1');
export const isDragging = writable<boolean>(false);
export const isCreatingEdge = writable<boolean>(false);
export const edgeStartNode = writable<string | null>(null);
export const canvasZoom = createPersistentStore<number>('graphedit-zoom', 1);
export const canvasPan = createPersistentStore<{ x: number; y: number }>('graphedit-pan', { x: 0, y: 0 });
export const snapToGrid = createPersistentStore<boolean>('graphedit-snap', false);
export const magnetRadius = createPersistentStore<number>('graphedit-magnet', 12);
export const undoStack = writable<GraphData[]>([]);
export const redoStack = writable<GraphData[]>([]);

export function resetGraph() {
  graphData.set(JSON.parse(JSON.stringify(defaultGraphData)));
  selectedNodeId.set(null);
  selectedEdgeId.set(null);
  selectedNodeIds.set([]);
  selectedEdgeIds.set([]);
  canvasZoom.set(1);
  canvasPan.set({ x: 0, y: 0 });
  undoStack.set([]);
  redoStack.set([]);
}

export function pushHistory() {
  if (!browser) return;
  const snapshot = JSON.parse(JSON.stringify(get(graphData)));
  undoStack.update((stack) => {
    const next = [...stack, snapshot];
    return next.slice(-50);
  });
  redoStack.set([]);
}

export function undo() {
  if (!browser) return;
  const current = JSON.parse(JSON.stringify(get(graphData)));
  let prev: GraphData | undefined;
  undoStack.update((stack) => {
    const copy = [...stack];
    prev = copy.pop();
    return copy;
  });
  if (prev) {
    redoStack.update((stack) => [...stack, current].slice(-50));
    graphData.set(prev);
  }
}

export function redo() {
  if (!browser) return;
  const current = JSON.parse(JSON.stringify(get(graphData)));
  let next: GraphData | undefined;
  redoStack.update((stack) => {
    const copy = [...stack];
    next = copy.pop();
    return copy;
  });
  if (next) {
    undoStack.update((stack) => [...stack, current].slice(-50));
    graphData.set(next);
  }
}

export { defaultGraphData };
