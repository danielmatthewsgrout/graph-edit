<script lang="ts">
  import { onMount } from 'svelte';
  import { graphData, selectedNodeId, selectedEdgeId, selectedNodeIds, selectedEdgeIds, activeNodeType, activeEdgeType, isDragging, isCreatingEdge, edgeStartNode, darkMode, canvasZoom, canvasPan, snapToGrid, magnetRadius, pushHistory, undo, redo } from '../stores';
  import type { Edge, NodeIcon, EdgeLineStyle } from '../types';
  import { get } from 'svelte/store';
  import CanvasToolbar from './CanvasToolbar.svelte';
  import CanvasSearch from './CanvasSearch.svelte';
  import EdgeStylingPanel from './EdgeStylingPanel.svelte';
  import KeyboardShortcutsModal from './KeyboardShortcutsModal.svelte';
  import GraphRenderer from './GraphRenderer.svelte';
  import GraphMinimap from './GraphMinimap.svelte';
  import { gridLayout, forceDirectedLayout, radialLayout, treeLayout } from '../utils/layoutUtils';

  let svgElement: SVGSVGElement;
  let containerElement = $state<HTMLDivElement>() as HTMLDivElement;
  let canvasWidth = $state(2000);
  let canvasHeight = $state(2000);
  let dragNodeId: string | null = $state(null);
  let dragStartPositions: Record<string, { x: number; y: number }> = $state({});
  let dragOffset = $state({ x: 0, y: 0 });
  let mousePos = $state({ x: 0, y: 0 });
  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0 });
  let searchTerm = $state('');
  let showHotkeys = $state(false);
  let validationMessage = $state('');
  let clipboard: { nodes: Record<string, any>; edges: Record<string, any>; offset: { x: number; y: number } } | null = $state(null);

  export const api = {
    addNode: () => addNode(),
    zoomIn: () => zoomIn(),
    zoomOut: () => zoomOut(),
    resetZoom: () => resetZoom(),
    centerView: () => centerView(),
    exportSVG: () => exportSVG(),
    exportPNG: () => exportPNG(),
    applyValidation: () => applyValidation(),
    copy: () => copySelected(),
    paste: () => pasteClipboard()
  };

  function applySnap(value: number): number {
    if (!$snapToGrid) return value;
    const grid = 20;
    const snapped = Math.round(value / grid) * grid;
    const delta = Math.abs(snapped - value);
    return delta <= $magnetRadius ? snapped : value;
  }

  function getNodePosition(nodeId: string): { x: number; y: number } {
    const data = get(graphData);
    const node = data.nodes[nodeId];
    return node ? { x: node.layout_properties.x_pos, y: node.layout_properties.y_pos } : { x: 0, y: 0 };
  }

  function getEdgeCurveOffset(edgeId: string, allEdges: Record<string, Edge>): number {
    const edge = allEdges[edgeId];
    if (!edge) return 0;

    const samePairEdges = Object.entries(allEdges).filter(([id, e]) =>
      (e.from_node === edge.from_node && e.to_node === edge.to_node) ||
      (e.from_node === edge.to_node && e.to_node === edge.from_node)
    );

    const currentIndex = samePairEdges.findIndex(([id]) => id === edgeId);
    const total = samePairEdges.length;

    if (total <= 1) return 0;

    return (currentIndex - (total - 1) / 2) * 30;
  }

  function getEdgePath(edge: Edge, allEdges: Record<string, Edge>, edgeId: string): string {
    const fromPos = getNodePosition(edge.from_node);
    const toPos = getNodePosition(edge.to_node);
    const offset = getEdgeCurveOffset(edgeId, allEdges);

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const normX = len > 0 ? dx / len : 0;
    const normY = len > 0 ? dy / len : 0;

    const startX = fromPos.x + normX * 32;
    const startY = fromPos.y + normY * 32;
    const endX = toPos.x - normX * 32;
    const endY = toPos.y - normY * 32;

    if (offset === 0) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const perpX = -normY;
    const perpY = normX;

    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  function centerOnNode(nodeX: number, nodeY: number) {
    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const centerX = rect.width / 2 / zoom;
    const centerY = rect.height / 2 / zoom;
    canvasPan.set({ x: centerX - nodeX, y: centerY - nodeY });
  }

  function centerView() {
    const data = get(graphData);
    const nodeIds = Object.keys(data.nodes);
    if (nodeIds.length === 0) {
      canvasPan.set({ x: 0, y: 0 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodeIds.forEach(id => {
      const node = data.nodes[id];
      minX = Math.min(minX, node.layout_properties.x_pos);
      minY = Math.min(minY, node.layout_properties.y_pos);
      maxX = Math.max(maxX, node.layout_properties.x_pos);
      maxY = Math.max(maxY, node.layout_properties.y_pos);
    });

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    centerOnNode(cx, cy);
  }

  function handleNodeMouseDown(nodeId: string, event: MouseEvent) {
    if ($isCreatingEdge) {
      finishEdgeCreation(nodeId);
      return;
    }

    event.stopPropagation();
    pushHistory();
    const data = get(graphData);
    const node = data.nodes[nodeId];
    if (!node) return;

    const rect = svgElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const pan = get(canvasPan);

    const currentSelection = event.shiftKey || event.ctrlKey || event.metaKey
      ? (new Set([...$selectedNodeIds, nodeId]))
      : new Set([nodeId]);
    selectedNodeIds.set(Array.from(currentSelection));

    dragStartPositions = {};
    Array.from(currentSelection).forEach(id => {
      const n = data.nodes[id];
      if (n) dragStartPositions[id] = { x: n.layout_properties.x_pos, y: n.layout_properties.y_pos };
    });

    dragNodeId = nodeId;
    dragOffset.x = (event.clientX - rect.left) / zoom - pan.x - node.layout_properties.x_pos;
    dragOffset.y = (event.clientY - rect.top) / zoom - pan.y - node.layout_properties.y_pos;
    isDragging.set(true);
    selectedNodeId.set(nodeId);
    selectedEdgeId.set(null);
    selectedEdgeIds.set([]);
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = svgElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const pan = get(canvasPan);

    mousePos.x = (event.clientX - rect.left) / zoom - pan.x;
    mousePos.y = (event.clientY - rect.top) / zoom - pan.y;

    if (isPanning) {
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      canvasPan.update(p => ({ x: p.x + dx / zoom, y: p.y + dy / zoom }));
      panStart = { x: event.clientX, y: event.clientY };
      return;
    }

    if (dragNodeId) {
      graphData.update(data => {
        const targets = $selectedNodeIds.length ? $selectedNodeIds : [dragNodeId!];
        targets.forEach(id => {
          const start = dragStartPositions[id];
          const node = data.nodes[id];
          if (!start || !node) return;
          const dx = mousePos.x - dragOffset.x - start.x;
          const dy = mousePos.y - dragOffset.y - start.y;
          const nextX = applySnap(start.x + dx);
          const nextY = applySnap(start.y + dy);
          node.layout_properties.x_pos = nextX;
          node.layout_properties.y_pos = nextY;
        });
        return data;
      });
    }
  }

  function handleMouseUp() {
    if (dragNodeId) {
      dragNodeId = null;
      isDragging.set(false);
    }
    isPanning = false;
  }

  function handleNodeClick(nodeId: string, event: MouseEvent) {
    event.stopPropagation();

    if ($isCreatingEdge) {
      finishEdgeCreation(nodeId);
      return;
    }

    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      const current = new Set($selectedNodeIds);
      current.has(nodeId) ? current.delete(nodeId) : current.add(nodeId);
      const arr = Array.from(current);
      selectedNodeIds.set(arr);
      selectedNodeId.set(arr[0] || null);
    } else {
      selectedNodeIds.set([nodeId]);
      selectedNodeId.set(nodeId);
    }
    selectedEdgeId.set(null);
    selectedEdgeIds.set([]);
  }

  function finishEdgeCreation(nodeId: string) {
    if ($edgeStartNode && nodeId !== $edgeStartNode) {
      pushHistory();
      const newEdgeId = `edge_${Date.now()}`;
      graphData.update(data => {
        data.edges[newEdgeId] = {
          from_node: $edgeStartNode!,
          to_node: nodeId,
          edge_type: get(activeEdgeType),
          weight: 1,
          properties: {}
        };
        return data;
      });
    }
    isCreatingEdge.set(false);
    edgeStartNode.set(null);
  }

  function startEdgeCreation(nodeId: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    isCreatingEdge.set(true);
    edgeStartNode.set(nodeId);
    selectedNodeId.set(null);
    selectedNodeIds.set([]);
    selectedEdgeId.set(null);
    selectedEdgeIds.set([]);
  }

  function handleEdgeClick(edgeId: string, event: MouseEvent) {
    event.stopPropagation();
    if ($isCreatingEdge) {
      isCreatingEdge.set(false);
      edgeStartNode.set(null);
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      const current = new Set($selectedEdgeIds);
      current.has(edgeId) ? current.delete(edgeId) : current.add(edgeId);
      const arr = Array.from(current);
      selectedEdgeIds.set(arr);
      selectedEdgeId.set(arr[0] || null);
    } else {
      selectedEdgeIds.set([edgeId]);
      selectedEdgeId.set(edgeId);
    }
    selectedNodeIds.set([]);
    selectedNodeId.set(null);
  }

  function addNode(x?: number, y?: number) {
    pushHistory();
    const newNodeId = `node_${Date.now()}`;
    const nodeX = x ?? 300;
    const nodeY = y ?? 300;

    graphData.update(d => {
      d.nodes[newNodeId] = {
        node_type: get(activeNodeType),
        label: `Node ${Object.keys(d.nodes).length + 1}`,
        properties: {},
        layout_properties: { x_pos: nodeX, y_pos: nodeY }
      };
      return d;
    });

    selectedNodeId.set(newNodeId);
    selectedNodeIds.set([newNodeId]);
    selectedEdgeId.set(null);
    selectedEdgeIds.set([]);

    setTimeout(() => centerOnNode(nodeX, nodeY), 10);
  }

  function handleCanvasDoubleClick(event: MouseEvent) {
    if ($isCreatingEdge) {
      isCreatingEdge.set(false);
      edgeStartNode.set(null);
      return;
    }

    const rect = svgElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const pan = get(canvasPan);
    const x = (event.clientX - rect.left) / zoom - pan.x;
    const y = (event.clientY - rect.top) / zoom - pan.y;

    addNode(x, y);
  }

  function handleCanvasClick(event: MouseEvent) {
    if ($isCreatingEdge) {
      isCreatingEdge.set(false);
      edgeStartNode.set(null);
    }
    if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
      selectedNodeId.set(null);
      selectedEdgeId.set(null);
      selectedNodeIds.set([]);
      selectedEdgeIds.set([]);
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    canvasZoom.update(z => Math.max(0.1, Math.min(3, z * delta)));
  }

  function handleMiddleMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      event.preventDefault();
      isPanning = true;
      panStart = { x: event.clientX, y: event.clientY };
    }
  }

  function zoomIn() {
    canvasZoom.update(z => Math.min(3, z * 1.2));
  }

  function zoomOut() {
    canvasZoom.update(z => Math.max(0.1, z / 1.2));
  }

  function resetZoom() {
    canvasZoom.set(1);
    canvasPan.set({ x: 0, y: 0 });
  }

  function getDashArray(style: EdgeLineStyle | undefined): string | undefined {
    switch (style) {
      case 'dashed': return '10 6';
      case 'dotted': return '2 6';
      case 'dashdot': return '12 6 2 6';
      default: return undefined;
    }
  }

  function applyValidation() {
    const data = get(graphData);
    const missingNodes = new Set<string>();
    const invalidEdges: string[] = [];
    Object.entries(data.edges).forEach(([id, e]) => {
      if (!data.nodes[e.from_node]) missingNodes.add(e.from_node);
      if (!data.nodes[e.to_node]) missingNodes.add(e.to_node);
      if (!data.edge_types[e.edge_type]) invalidEdges.push(id);
    });
    if (!missingNodes.size && !invalidEdges.length) {
      validationMessage = 'No issues found.';
      return;
    }
    pushHistory();
    graphData.update(d => {
      invalidEdges.forEach(id => delete d.edges[id]);
      Object.entries(d.edges).forEach(([id, e]) => {
        if (!d.nodes[e.from_node] || !d.nodes[e.to_node]) delete d.edges[id];
      });
      return d;
    });
    validationMessage = `Removed ${invalidEdges.length} invalid edges and edges with missing nodes.`;
  }

  function searchAndSelect() {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const data = get(graphData);
    const nodeEntry = Object.entries(data.nodes).find(([, n]) => n.label.toLowerCase().includes(term));
    if (nodeEntry) {
      const [id, node] = nodeEntry;
      selectedNodeIds.set([id]);
      selectedNodeId.set(id);
      selectedEdgeId.set(null);
      selectedEdgeIds.set([]);
      centerOnNode(node.layout_properties.x_pos, node.layout_properties.y_pos);
      return;
    }
    const edgeEntry = Object.entries(data.edges).find(([, e]) => {
      const type = data.edge_types[e.edge_type];
      return type?.label.toLowerCase().includes(term);
    });
    if (edgeEntry) {
      const [id] = edgeEntry;
      selectedEdgeIds.set([id]);
      selectedEdgeId.set(id);
      selectedNodeId.set(null);
      selectedNodeIds.set([]);
    }
  }

  function exportSVG() {
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPNG() {
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.clientWidth || 1200;
      canvas.height = svgElement.clientHeight || 800;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'graph.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
  }

  function copySelected() {
    const nodeIds = new Set($selectedNodeIds);
    const edgeIds = new Set($selectedEdgeIds);
    if (!nodeIds.size && !edgeIds.size && $selectedNodeId) nodeIds.add($selectedNodeId);
    if (!nodeIds.size && !edgeIds.size) return;

    const data = get(graphData);
    const copiedNodes: Record<string, any> = {};
    const copiedEdges: Record<string, any> = {};

    let minX = Infinity, minY = Infinity;
    nodeIds.forEach(id => {
      const node = data.nodes[id];
      if (node) {
        copiedNodes[id] = JSON.parse(JSON.stringify(node));
        minX = Math.min(minX, node.layout_properties.x_pos);
        minY = Math.min(minY, node.layout_properties.y_pos);
      }
    });

    edgeIds.forEach(id => {
      const edge = data.edges[id];
      if (edge && nodeIds.has(edge.from_node) && nodeIds.has(edge.to_node)) {
        copiedEdges[id] = JSON.parse(JSON.stringify(edge));
      }
    });

    clipboard = {
      nodes: copiedNodes,
      edges: copiedEdges,
      offset: { x: minX, y: minY }
    };
  }

  function pasteClipboard() {
    if (!clipboard || Object.keys(clipboard.nodes).length === 0) return;

    pushHistory();
    const offsetX = 50;
    const offsetY = 50;
    const newNodeIds: Record<string, string> = {};
    const newEdgeIds: Record<string, string> = {};
    const clip = clipboard;

    graphData.update(d => {
      Object.entries(clip.nodes).forEach(([oldId, node]) => {
        const newId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        newNodeIds[oldId] = newId;
        d.nodes[newId] = {
          ...node,
          layout_properties: {
            x_pos: node.layout_properties.x_pos + offsetX,
            y_pos: node.layout_properties.y_pos + offsetY
          }
        };
      });

      Object.entries(clip.edges).forEach(([oldId, edge]) => {
        const newFromId = newNodeIds[edge.from_node];
        const newToId = newNodeIds[edge.to_node];
        if (newFromId && newToId) {
          const newEdgeId = `edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
          newEdgeIds[oldId] = newEdgeId;
          d.edges[newEdgeId] = {
            ...edge,
            from_node: newFromId,
            to_node: newToId
          };
        }
      });

      return d;
    });

    const pastedNodeIds = Object.values(newNodeIds);
    selectedNodeIds.set(pastedNodeIds);
    selectedNodeId.set(pastedNodeIds[0] || null);
    selectedEdgeIds.set(Object.values(newEdgeIds));
    selectedEdgeId.set(null);
  }

  function deleteSelected() {
    const nodeIds = new Set($selectedNodeIds);
    const edgeIds = new Set($selectedEdgeIds);
    if (!nodeIds.size && !edgeIds.size && $selectedNodeId) nodeIds.add($selectedNodeId);
    if (!nodeIds.size && !edgeIds.size && $selectedEdgeId) edgeIds.add($selectedEdgeId);
    if (!nodeIds.size && !edgeIds.size) return;
    pushHistory();
    graphData.update(data => {
      edgeIds.forEach(id => delete data.edges[id]);
      nodeIds.forEach(id => {
        delete data.nodes[id];
        Object.entries(data.edges).forEach(([edgeId, e]) => {
          if (e.from_node === id || e.to_node === id) {
            delete data.edges[edgeId];
          }
        });
      });
      return data;
    });
    selectedNodeId.set(null);
    selectedEdgeId.set(null);
    selectedNodeIds.set([]);
    selectedEdgeIds.set([]);
  }

  function handleViewportChange(x: number, y: number) {
    canvasPan.set({ x, y });
  }

  function handleKey(event: KeyboardEvent) {
    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
    } else if (meta && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
      event.preventDefault();
      redo();
    } else if (meta && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      copySelected();
    } else if (meta && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      pasteClipboard();
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteSelected();
    } else if (event.key === '?' || (event.shiftKey && event.key === '/')) {
      event.preventDefault();
      showHotkeys = !showHotkeys;
    }
  }

  onMount(() => {
    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      canvasWidth = Math.max(2000, rect.width);
      canvasHeight = Math.max(2000, rect.height);
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  });
</script>

<div
  bind:this={containerElement}
  class="w-full h-full relative overflow-hidden"
  class:cursor-grabbing={isPanning}
  class:cursor-crosshair={$isCreatingEdge}
  style="background: {$darkMode ? 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' : 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)'}"
>
  <div class="absolute inset-0 opacity-30 pointer-events-none" style="background-image: radial-gradient({$darkMode ? '#334155' : '#cbd5e1'} 1px, transparent 1px); background-size: 20px 20px;"></div>

  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 flex-wrap justify-center max-w-[90%]">
    <CanvasSearch bind:searchTerm onSearch={searchAndSelect} />
  </div>

  {#if validationMessage}
    <div class="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg shadow-lg {$darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'} text-sm">
      {validationMessage}
    </div>
  {/if}

  <EdgeStylingPanel />

  <GraphMinimap {containerElement} onViewportChange={handleViewportChange} />

  <KeyboardShortcutsModal bind:show={showHotkeys} onClose={() => showHotkeys = false} />

  {#if $isCreatingEdge}
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-full shadow-2xl font-medium bg-linear-to-r from-blue-500 to-cyan-500 text-white animate-pulse">
      Creating edge... Click a node to connect or click canvas to cancel
    </div>
  {/if}

  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
  <svg
    bind:this={svgElement}
    width="100%"
    height="100%"
    class="absolute inset-0"
    role="application"
    aria-label="Graph canvas"
    style="cursor: {$isCreatingEdge ? 'crosshair' : isPanning ? 'grabbing' : 'default'}"
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    ondblclick={handleCanvasDoubleClick}
    onclick={handleCanvasClick}
    onwheel={handleWheel}
    onmousedown={handleMiddleMouseDown}
    oncontextmenu={(e) => e.preventDefault()}
  >
    <GraphRenderer
      {mousePos}
      {getNodePosition}
      {getEdgePath}
      {getEdgeCurveOffset}
      {getDashArray}
      {handleNodeMouseDown}
      {handleNodeClick}
      {startEdgeCreation}
      {handleEdgeClick}
    />
  </svg>
</div>
