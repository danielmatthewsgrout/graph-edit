<script lang="ts">
  import { onMount } from 'svelte';
  import { graphData, selectedNodeId, selectedEdgeId, activeNodeType, activeEdgeType, isDragging, isCreatingEdge, edgeStartNode, darkMode, canvasZoom, canvasPan } from '../stores';
  import type { Edge, NodeIcon } from '../types';
  import { get } from 'svelte/store';

  let svgElement: SVGSVGElement;
  let containerElement: HTMLDivElement;
  let canvasWidth = 2000;
  let canvasHeight = 2000;
  let dragNodeId: string | null = null;
  let dragOffset = { x: 0, y: 0 };
  let mousePos = { x: 0, y: 0 };
  let isPanning = false;
  let panStart = { x: 0, y: 0 };

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
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    centerOnNode(centerX, centerY);
  }

  function handleNodeMouseDown(nodeId: string, event: MouseEvent) {
    if ($isCreatingEdge) {
      finishEdgeCreation(nodeId);
      return;
    }
    
    event.stopPropagation();
    const data = get(graphData);
    const node = data.nodes[nodeId];
    if (!node) return;
    
    const rect = svgElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const pan = get(canvasPan);
    
    dragNodeId = nodeId;
    dragOffset.x = (event.clientX - rect.left) / zoom - pan.x - node.layout_properties.x_pos;
    dragOffset.y = (event.clientY - rect.top) / zoom - pan.y - node.layout_properties.y_pos;
    isDragging.set(true);
    selectedNodeId.set(nodeId);
    selectedEdgeId.set(null);
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
      const newX = mousePos.x - dragOffset.x;
      const newY = mousePos.y - dragOffset.y;
      
      graphData.update(data => {
        if (data.nodes[dragNodeId!]) {
          data.nodes[dragNodeId!].layout_properties.x_pos = Math.max(30, newX);
          data.nodes[dragNodeId!].layout_properties.y_pos = Math.max(30, newY);
        }
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
    
    selectedNodeId.set(nodeId);
    selectedEdgeId.set(null);
  }

  function finishEdgeCreation(nodeId: string) {
    if ($edgeStartNode && nodeId !== $edgeStartNode) {
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
    selectedEdgeId.set(null);
  }

  function handleEdgeClick(edgeId: string, event: MouseEvent) {
    event.stopPropagation();
    if ($isCreatingEdge) {
      isCreatingEdge.set(false);
      edgeStartNode.set(null);
      return;
    }
    selectedEdgeId.set(edgeId);
    selectedNodeId.set(null);
  }

  function addNode(x?: number, y?: number) {
    const newNodeId = `node_${Date.now()}`;
    const data = get(graphData);
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
    selectedEdgeId.set(null);
    
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

  function autoLayout() {
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
    
    setTimeout(centerView, 10);
  }

  function getIconPath(icon: NodeIcon | undefined): string {
    switch (icon) {
      case 'square': return 'M-12,-12 L12,-12 L12,12 L-12,12 Z';
      case 'diamond': return 'M0,-16 L16,0 L0,16 L-16,0 Z';
      case 'star': return 'M0,-16 L4,-5 L16,-5 L7,3 L11,16 L0,8 L-11,16 L-7,3 L-16,-5 L-4,-5 Z';
      case 'hexagon': return 'M-14,-8 L0,-16 L14,-8 L14,8 L0,16 L-14,8 Z';
      case 'triangle': return 'M0,-16 L18,14 L-18,14 Z';
      case 'user': return 'M-10,16 C-10,6 -6,2 0,2 C6,2 10,6 10,16 M0,-14 A6,6 0 1,0 0,-2 A6,6 0 1,0 0,-14';
      case 'building': return 'M-12,-16 L12,-16 L12,16 L-12,16 Z M-8,-12 L-4,-12 L-4,-8 L-8,-8 Z M4,-12 L8,-12 L8,-8 L4,-8 Z M-8,-4 L-4,-4 L-4,0 L-8,0 Z M4,-4 L8,-4 L8,0 L4,0 Z M-4,6 L4,6 L4,16 L-4,16 Z';
      case 'database': return 'M-14,-10 A14,5 0 1,1 14,-10 A14,5 0 1,1 -14,-10 M-14,-10 L-14,10 A14,5 0 1,0 14,10 L14,-10 M-14,0 A14,5 0 1,0 14,0';
      case 'server': return 'M-14,-14 L14,-14 L14,-2 L-14,-2 Z M-14,2 L14,2 L14,14 L-14,14 Z M-10,-10 A2,2 0 1,0 -6,-10 A2,2 0 1,0 -10,-10 M-10,6 A2,2 0 1,0 -6,6 A2,2 0 1,0 -10,6';
      case 'globe': return 'M0,-16 A16,16 0 1,0 0,16 A16,16 0 1,0 0,-16 M-16,0 L16,0 M0,-16 C-8,-16 -10,-4 -10,0 C-10,4 -8,16 0,16 C8,16 10,4 10,0 C10,-4 8,-16 0,-16';
      case 'heart': return 'M0,6 C-8,-2 -16,-2 -16,-10 C-16,-16 -10,-16 -4,-12 L0,-8 L4,-12 C10,-16 16,-16 16,-10 C16,-2 8,-2 0,6 Z';
      case 'zap': return 'M6,-16 L-6,2 L4,2 L-6,16 L8,0 L-2,0 Z';
      case 'shield': return 'M0,-16 L16,-10 L16,4 C16,12 8,16 0,18 C-8,16 -16,12 -16,4 L-16,-10 Z';
      case 'folder': return 'M-14,-8 L-6,-8 L-4,-12 L14,-12 L14,12 L-14,12 Z';
      case 'file': return 'M-10,-16 L6,-16 L14,-8 L14,16 L-10,16 Z M6,-16 L6,-8 L14,-8';
      default: return '';
    }
  }

  onMount(() => {
    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      canvasWidth = Math.max(2000, rect.width);
      canvasHeight = Math.max(2000, rect.height);
    }
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
  
  <div class="absolute top-4 left-4 z-10 flex flex-col gap-3">
    <div class="flex flex-col gap-2 rounded-2xl p-4 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
      <button 
        class="px-5 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white"
        on:click={() => addNode()}
      >
        <span class="flex items-center gap-2 justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Node
        </span>
      </button>
      <button 
        class="px-5 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
        on:click={autoLayout}
      >
        <span class="flex items-center gap-2 justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
          Auto Layout
        </span>
      </button>
    </div>
    
    <div class="flex gap-1 rounded-2xl p-2 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
      <button class="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-lg {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={zoomOut} title="Zoom Out">−</button>
      <button class="px-3 h-10 rounded-xl text-sm font-mono transition-all {$darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}" on:click={resetZoom} title="Reset Zoom">{Math.round($canvasZoom * 100)}%</button>
      <button class="w-10 h-10 rounded-xl flex items-center justify-center transition-all font-bold text-lg {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={zoomIn} title="Zoom In">+</button>
      <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
      <button class="w-10 h-10 rounded-xl flex items-center justify-center transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={centerView} title="Center View">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
      </button>
    </div>
    
    <div class="rounded-2xl p-3 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50 text-gray-400' : 'bg-white/90 border-gray-200/50 text-gray-600'} text-xs">
      <div class="font-bold mb-2 {$darkMode ? 'text-gray-200' : 'text-gray-700'}">⌨️ Controls</div>
      <div class="space-y-1 leading-relaxed">
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Double-click</kbd> Add node</div>
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Right-click</kbd> Start edge</div>
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Click</kbd> End edge</div>
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Drag</kbd> Move nodes</div>
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Scroll</kbd> Zoom</div>
        <div>• <kbd class="px-1 rounded {$darkMode ? 'bg-gray-800' : 'bg-gray-200'}">Middle-drag</kbd> Pan</div>
      </div>
    </div>
  </div>

  {#if $isCreatingEdge}
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-full shadow-2xl font-medium bg-linear-to-r from-blue-500 to-cyan-500 text-white animate-pulse">
      ✨ Creating edge... Click a node to connect or click canvas to cancel
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
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
    on:dblclick={handleCanvasDoubleClick}
    on:click={handleCanvasClick}
    on:wheel={handleWheel}
    on:mousedown={handleMiddleMouseDown}
    on:contextmenu|preventDefault
  >
    <defs>
      {#each Object.keys($graphData.edge_types) as typeId}
        {@const edgeType = $graphData.edge_types[typeId]}
        <marker
          id="arrowhead-{typeId}"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M2,2 L10,6 L2,10 L4,6 Z" fill={edgeType?.colour || '#333'} />
        </marker>
      {/each}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <g transform="scale({$canvasZoom}) translate({$canvasPan.x}, {$canvasPan.y})">
      <rect x="-5000" y="-5000" width="10000" height="10000" fill="transparent" />
      
      {#each Object.entries($graphData.edges) as [edgeId, edge]}
        {@const edgeType = $graphData.edge_types[edge.edge_type]}
        {@const isSelected = $selectedEdgeId === edgeId}
        {@const path = getEdgePath(edge, $graphData.edges, edgeId)}
        
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <path
          d={path}
          stroke="transparent"
          stroke-width={Math.max(12, edge.weight * 2 + 8)}
          fill="none"
          class="cursor-pointer"
          on:click={(e) => handleEdgeClick(edgeId, e)}
        />
        <path
          d={path}
          stroke={edgeType?.colour || '#000'}
          stroke-width={edge.weight * 2}
          fill="none"
          marker-end="url(#arrowhead-{edge.edge_type})"
          class="pointer-events-none transition-all"
          style="filter: {isSelected ? 'url(#glow)' : 'none'}; opacity: {isSelected ? 1 : 0.7}"
        />
      {/each}
      
      {#each Object.entries($graphData.nodes) as [nodeId, node]}
        {@const nodeType = $graphData.node_types[node.node_type]}
        {@const isSelected = $selectedNodeId === nodeId}
        {@const pos = node.layout_properties}
        {@const icon = nodeType?.icon || 'circle'}
        {@const iconPath = getIconPath(icon)}
        
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <g 
          transform="translate({pos.x_pos}, {pos.y_pos})"
          class="cursor-move"
          on:mousedown={(e) => handleNodeMouseDown(nodeId, e)}
          on:click={(e) => handleNodeClick(nodeId, e)}
          on:contextmenu|preventDefault={(e) => startEdgeCreation(nodeId, e)}
        >
          {#if $isCreatingEdge && $edgeStartNode === nodeId}
            <circle
              r="42"
              fill="none"
              stroke="url(#pulse-gradient)"
              stroke-width="3"
              class="pointer-events-none"
            >
              <animate attributeName="r" values="38;44;38" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
            </circle>
          {/if}
          
          {#if icon === 'circle'}
            <circle
              r="28"
              fill={nodeType?.colour || '#ccc'}
              stroke={isSelected ? ($darkMode ? '#fff' : '#1f2937') : ($darkMode ? '#374151' : '#fff')}
              stroke-width={isSelected ? 4 : 2}
              style="filter: {isSelected ? 'url(#glow)' : 'url(#shadow)'}"
            />
          {:else}
            <g transform="scale(1.5)">
              <path
                d={iconPath}
                fill={nodeType?.colour || '#ccc'}
                stroke={isSelected ? ($darkMode ? '#fff' : '#1f2937') : ($darkMode ? '#374151' : '#fff')}
                stroke-width={isSelected ? 2.5 : 1.5}
                style="filter: {isSelected ? 'url(#glow)' : 'url(#shadow)'}"
              />
            </g>
          {/if}
          
          <text
            y="48"
            text-anchor="middle"
            class="text-sm font-bold pointer-events-none select-none"
            fill={$darkMode ? '#f3f4f6' : '#1f2937'}
            style="text-shadow: 0 2px 4px {$darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'}"
          >
            {node.label}
          </text>
        </g>
      {/each}
      
      {#if $isCreatingEdge && $edgeStartNode}
        {@const startPos = getNodePosition($edgeStartNode)}
        <line
          x1={startPos.x}
          y1={startPos.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="url(#edge-gradient)"
          stroke-width="3"
          stroke-dasharray="8,4"
          class="pointer-events-none"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="24" dur="0.5s" repeatCount="indefinite" />
        </line>
        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r="10"
          fill="#3b82f6"
          opacity="0.9"
          class="pointer-events-none"
        >
          <animate attributeName="r" values="8;12;8" dur="0.5s" repeatCount="indefinite" />
        </circle>
      {/if}
      
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
      </defs>
    </g>
  </svg>
</div>
