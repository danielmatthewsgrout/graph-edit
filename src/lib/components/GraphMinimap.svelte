<script lang="ts">
  import { graphData, darkMode, canvasZoom, canvasPan } from '../stores';
  import { get } from 'svelte/store';
  import type { Node } from '../types';
  
  let minimapElement: SVGSVGElement;
  let minimapContainer: HTMLDivElement;
  let isDraggingMinimap = false;
  
  export let containerElement: HTMLDivElement;
  export let onViewportChange: (x: number, y: number) => void;
  
  $: bounds = calculateBounds();
  $: viewportRect = calculateViewportRect();
  
  function calculateBounds() {
    const nodes = Object.values($graphData.nodes);
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      const x = node.layout_properties.x_pos;
      const y = node.layout_properties.y_pos;
      minX = Math.min(minX, x - 50);
      minY = Math.min(minY, y - 50);
      maxX = Math.max(maxX, x + 50);
      maxY = Math.max(maxY, y + 50);
    });
    
    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    };
  }
  
  function calculateViewportRect() {
    if (!containerElement) return null;
    const rect = containerElement.getBoundingClientRect();
    const zoom = get(canvasZoom);
    const pan = get(canvasPan);
    
    const viewportWidth = rect.width / zoom;
    const viewportHeight = rect.height / zoom;
    const viewportX = -pan.x;
    const viewportY = -pan.y;
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    const scaleX = 200 / width;
    const scaleY = 200 / height;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledX = (viewportX - bounds.minX) * scale;
    const scaledY = (viewportY - bounds.minY) * scale;
    const scaledWidth = viewportWidth * scale;
    const scaledHeight = viewportHeight * scale;
    
    return {
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight
    };
  }
  
  function handleMinimapClick(event: MouseEvent) {
    if (!minimapElement || !viewportRect) return;
    const rect = minimapElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 200;
    const y = (event.clientY - rect.top) / rect.height * 200;
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const scaleX = 200 / width;
    const scaleY = 200 / height;
    const scale = Math.min(scaleX, scaleY);
    
    const worldX = x / scale + bounds.minX;
    const worldY = y / scale + bounds.minY;
    
    if (containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const zoom = get(canvasZoom);
      const centerX = containerRect.width / 2 / zoom;
      const centerY = containerRect.height / 2 / zoom;
      
      onViewportChange(centerX - worldX, centerY - worldY);
    }
  }
  
  function handleMinimapMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      isDraggingMinimap = true;
      handleMinimapClick(event);
    }
  }
  
  function handleMinimapMouseMove(event: MouseEvent) {
    if (isDraggingMinimap) {
      handleMinimapClick(event);
    }
  }
  
  function handleMinimapMouseUp() {
    isDraggingMinimap = false;
  }

  function handleMinimapKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!minimapElement) return;
    const rect = minimapElement.getBoundingClientRect();
    const clickEvent = new MouseEvent('click', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    });
    handleMinimapClick(clickEvent);
  }
</script>

<div 
  bind:this={minimapContainer}
  class="absolute bottom-4 right-4 z-20 rounded-lg border shadow-2xl overflow-hidden {$darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl"
>
  <div class="px-2 py-1 text-xs font-semibold border-b {$darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}">
    Minimap
  </div>
  {#if bounds && Object.keys($graphData.nodes).length > 0}
    <svg
      bind:this={minimapElement}
      width="200"
      height="200"
      class="cursor-pointer"
      role="button"
      tabindex="0"
      aria-label="Minimap - click and drag to navigate the graph viewport"
      on:keydown={handleMinimapKeyDown}
      on:mousedown={handleMinimapMouseDown}
      on:mousemove={handleMinimapMouseMove}
      on:mouseup={handleMinimapMouseUp}
      on:mouseleave={handleMinimapMouseUp}
    >
      <rect x="0" y="0" width="200" height="200" fill={$darkMode ? '#1f2937' : '#f9fafb'} />
      
      {#if viewportRect}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fill="none"
          stroke={$darkMode ? '#60a5fa' : '#3b82f6'}
          stroke-width="2"
          stroke-dasharray="4 2"
          opacity="0.8"
        />
      {/if}
      
      {#each Object.entries($graphData.nodes) as [nodeId, node]}
        {@const width = bounds.maxX - bounds.minX}
        {@const height = bounds.maxY - bounds.minY}
        {@const scaleX = 200 / width}
        {@const scaleY = 200 / height}
        {@const scale = Math.min(scaleX, scaleY)}
        {@const x = (node.layout_properties.x_pos - bounds.minX) * scale}
        {@const y = (node.layout_properties.y_pos - bounds.minY) * scale}
        {@const nodeType = $graphData.node_types[node.node_type]}
        <circle
          cx={x}
          cy={y}
          r={3}
          fill={nodeType?.colour || '#ccc'}
          opacity="0.8"
        />
      {/each}
    </svg>
  {:else}
    <div class="w-[200px] h-[200px] flex items-center justify-center text-xs {$darkMode ? 'text-gray-500' : 'text-gray-400'}">
      No nodes
    </div>
  {/if}
</div>
