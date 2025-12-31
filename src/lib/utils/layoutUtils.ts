import type { GraphData } from '../types';
import { get } from 'svelte/store';
import { graphData, pushHistory } from '../stores';

export function gridLayout() {
  pushHistory();
  const data = get(graphData);
  const nodeIds = Object.keys(data.nodes);
  const nodeCount = nodeIds.length;
  
  if (nodeCount === 0) return;
  
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const spacing = 150;
  const startX = 100;
  const startY = 100;
  
  graphData.update(d => {
    nodeIds.forEach((nodeId, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      d.nodes[nodeId].layout_properties.x_pos = startX + col * spacing;
      d.nodes[nodeId].layout_properties.y_pos = startY + row * spacing;
    });
    return d;
  });
}

export function forceDirectedLayout() {
  pushHistory();
  const data = get(graphData);
  const nodeIds = Object.keys(data.nodes);
  const nodeCount = nodeIds.length;
  
  if (nodeCount === 0) return;
  
  const iterations = 100;
  const k = Math.sqrt((800 * 600) / nodeCount);
  const repulsion = k * k;
  const attraction = 0.01;
  
  const positions: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
  nodeIds.forEach(id => {
    positions[id] = {
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      vx: 0,
      vy: 0
    };
  });
  
  for (let iter = 0; iter < iterations; iter++) {
    nodeIds.forEach(id1 => {
      let fx = 0, fy = 0;
      nodeIds.forEach(id2 => {
        if (id1 === id2) return;
        const dx = positions[id2].x - positions[id1].x;
        const dy = positions[id2].y - positions[id1].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
        const force = repulsion / dist;
        fx -= (dx / dist) * force;
        fy -= (dy / dist) * force;
      });
      
      Object.entries(data.edges).forEach(([, edge]) => {
        if (edge.from_node === id1) {
          const target = positions[edge.to_node];
          if (target) {
            const dx = target.x - positions[id1].x;
            const dy = target.y - positions[id1].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
            fx += (dx / dist) * dist * attraction;
            fy += (dy / dist) * dist * attraction;
          }
        } else if (edge.to_node === id1) {
          const source = positions[edge.from_node];
          if (source) {
            const dx = source.x - positions[id1].x;
            const dy = source.y - positions[id1].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
            fx += (dx / dist) * dist * attraction;
            fy += (dy / dist) * dist * attraction;
          }
        }
      });
      
      positions[id1].vx = (positions[id1].vx + fx) * 0.8;
      positions[id1].vy = (positions[id1].vy + fy) * 0.8;
      positions[id1].x += positions[id1].vx;
      positions[id1].y += positions[id1].vy;
    });
  }
  
  graphData.update(d => {
    nodeIds.forEach(id => {
      d.nodes[id].layout_properties.x_pos = Math.max(30, positions[id].x);
      d.nodes[id].layout_properties.y_pos = Math.max(30, positions[id].y);
    });
    return d;
  });
}

export function radialLayout() {
  pushHistory();
  const data = get(graphData);
  const nodeIds = Object.keys(data.nodes);
  const nodeCount = nodeIds.length;
  
  if (nodeCount === 0) return;
  
  const centerX = 400;
  const centerY = 300;
  const radius = Math.min(300, nodeCount * 20);
  const angleStep = (2 * Math.PI) / nodeCount;
  
  graphData.update(d => {
    nodeIds.forEach((nodeId, index) => {
      const angle = index * angleStep;
      d.nodes[nodeId].layout_properties.x_pos = centerX + radius * Math.cos(angle);
      d.nodes[nodeId].layout_properties.y_pos = centerY + radius * Math.sin(angle);
    });
    return d;
  });
}

export function treeLayout() {
  pushHistory();
  const data = get(graphData);
  const nodeIds = Object.keys(data.nodes);
  const nodeCount = nodeIds.length;
  
  if (nodeCount === 0) return;
  
  const rootId = nodeIds[0];
  const visited = new Set<string>();
  const levels: string[][] = [[rootId]];
  visited.add(rootId);
  
  let currentLevel = 0;
  while (levels[currentLevel].length > 0) {
    const nextLevel: string[] = [];
    levels[currentLevel].forEach(nodeId => {
      Object.values(data.edges).forEach(edge => {
        if (edge.from_node === nodeId && !visited.has(edge.to_node)) {
          nextLevel.push(edge.to_node);
          visited.add(edge.to_node);
        }
      });
    });
    if (nextLevel.length > 0) {
      levels.push(nextLevel);
      currentLevel++;
    } else {
      break;
    }
  }
  
  const levelHeight = 120;
  const startY = 100;
  const startX = 400;
  
  graphData.update(d => {
    levels.forEach((level, levelIndex) => {
      const y = startY + levelIndex * levelHeight;
      const spacing = Math.min(200, 800 / level.length);
      const totalWidth = (level.length - 1) * spacing;
      const startXLevel = startX - totalWidth / 2;
      
      level.forEach((nodeId, index) => {
        d.nodes[nodeId].layout_properties.x_pos = startXLevel + index * spacing;
        d.nodes[nodeId].layout_properties.y_pos = y;
      });
    });
    
    nodeIds.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        d.nodes[nodeId].layout_properties.x_pos = Math.random() * 600 + 100;
        d.nodes[nodeId].layout_properties.y_pos = Math.random() * 400 + 100;
      }
    });
    
    return d;
  });
}
