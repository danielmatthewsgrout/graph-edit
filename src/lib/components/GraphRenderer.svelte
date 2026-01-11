<script lang="ts">
  import { graphData, selectedNodeId, selectedEdgeId, selectedNodeIds, selectedEdgeIds, isCreatingEdge, edgeStartNode, darkMode, canvasZoom, canvasPan } from '../stores';
  import type { Edge, NodeIcon, EdgeLineStyle } from '../types';
  import { get } from 'svelte/store';
  import { getIconPath } from '../utils/iconPaths';

  export let mousePos: { x: number; y: number };
  export let getNodePosition: (nodeId: string) => { x: number; y: number };
  export let getEdgePath: (edge: Edge, allEdges: Record<string, Edge>, edgeId: string) => string;
  export let getEdgeCurveOffset: (edgeId: string, allEdges: Record<string, Edge>) => number;
  export let getDashArray: (style: EdgeLineStyle | undefined) => string | undefined;
  export let handleNodeMouseDown: (nodeId: string, event: MouseEvent) => void;
  export let handleNodeClick: (nodeId: string, event: MouseEvent) => void;
  export let startEdgeCreation: (nodeId: string, event: MouseEvent) => void;
  export let handleEdgeClick: (edgeId: string, event: MouseEvent) => void;
</script>

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
    {@const lineStyle = edgeType?.line_style || 'solid'}
    {@const dashArray = getDashArray(lineStyle)}
    {@const isSelected = $selectedEdgeId === edgeId || $selectedEdgeIds.includes(edgeId)}
    {@const path = getEdgePath(edge, $graphData.edges, edgeId)}
    
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <path
      d={path}
      stroke="transparent"
      stroke-width={Math.max(12, edge.weight * 2 + 8)}
      fill="none"
      class="cursor-pointer"
      stroke-dasharray={dashArray}
      on:click={(e) => handleEdgeClick(edgeId, e)}
    />
    <path
      d={path}
      stroke={edgeType?.colour || '#000'}
      stroke-width={edge.weight * 2}
      fill="none"
      stroke-dasharray={dashArray}
      stroke-linecap="round"
      marker-end="url(#arrowhead-{edge.edge_type})"
      class="pointer-events-none transition-all"
      style="filter: {isSelected ? 'url(#glow)' : 'none'}; opacity: {isSelected ? 1 : 0.7}"
    />
    {#if edge.label}
      {@const fromPos = getNodePosition(edge.from_node)}
      {@const toPos = getNodePosition(edge.to_node)}
      {@const offset = getEdgeCurveOffset(edgeId, $graphData.edges)}
      {@const dx = toPos.x - fromPos.x}
      {@const dy = toPos.y - fromPos.y}
      {@const len = Math.sqrt(dx * dx + dy * dy)}
      {@const normX = len > 0 ? dx / len : 0}
      {@const normY = len > 0 ? dy / len : 0}
      {@const startX = fromPos.x + normX * 32}
      {@const startY = fromPos.y + normY * 32}
      {@const endX = toPos.x - normX * 32}
      {@const endY = toPos.y - normY * 32}
      {@const midX = (startX + endX) / 2}
      {@const midY = (startY + endY) / 2}
      {@const perpX = -normY}
      {@const perpY = normX}
      {@const labelX = offset === 0 ? midX : midX + perpX * offset * 0.5}
      {@const labelY = offset === 0 ? midY : midY + perpY * offset * 0.5}
      <rect
        x={labelX - 20}
        y={labelY - 10}
        width="40"
        height="20"
        rx="4"
        fill={$darkMode ? '#1f2937' : '#fff'}
        stroke={edgeType?.colour || '#000'}
        stroke-width="1"
        opacity="0.9"
        class="pointer-events-none"
      />
      <text
        x={labelX}
        y={labelY + 4}
        text-anchor="middle"
        font-size="11"
        font-weight="600"
        fill={edgeType?.colour || '#000'}
        class="pointer-events-none select-none"
      >
        {edge.label}
      </text>
    {/if}
  {/each}
  
  {#each Object.entries($graphData.nodes) as [nodeId, node]}
    {@const nodeType = $graphData.node_types[node.node_type]}
    {@const isSelected = $selectedNodeId === nodeId || $selectedNodeIds.includes(nodeId)}
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
        <g transform="translate(-18, -18) scale(1.5)">
          <path
            d={iconPath}
            fill={nodeType?.colour || '#ccc'}
            stroke={isSelected ? ($darkMode ? '#fff' : '#1f2937') : ($darkMode ? '#374151' : '#fff')}
            stroke-width={isSelected ? 2.5 : 1.5}
            style="filter: {isSelected ? 'url(#glow)' : 'url(#shadow)'}"
          />
        </g>
      {/if}
      
      {#if node.badge}
        <circle
          cx="20"
          cy="-20"
          r="12"
          fill={$darkMode ? '#1f2937' : '#fff'}
          stroke={nodeType?.colour || '#ccc'}
          stroke-width="2"
          style="filter: url(#shadow)"
        />
        <text
          x="20"
          y="-16"
          text-anchor="middle"
          font-size="14"
          class="pointer-events-none select-none"
          fill={nodeType?.colour || '#ccc'}
        >
          {node.badge}
        </text>
      {/if}
      
      <text
        x="0"
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
