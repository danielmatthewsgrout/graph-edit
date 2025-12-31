<script lang="ts">
  import { graphData, darkMode } from '../stores';
  
  $: stats = calculateStats();
  
  function calculateStats() {
    const nodes = Object.values($graphData.nodes);
    const edges = Object.values($graphData.edges);
    const nodeTypes = Object.keys($graphData.node_types).length;
    const edgeTypes = Object.keys($graphData.edge_types).length;
    
    const nodeTypeCounts: Record<string, number> = {};
    nodes.forEach(node => {
      nodeTypeCounts[node.node_type] = (nodeTypeCounts[node.node_type] || 0) + 1;
    });
    
    const edgeTypeCounts: Record<string, number> = {};
    edges.forEach(edge => {
      edgeTypeCounts[edge.edge_type] = (edgeTypeCounts[edge.edge_type] || 0) + 1;
    });
    
    const isolatedNodes = nodes.filter(node => {
      const nodeId = Object.keys($graphData.nodes).find(id => $graphData.nodes[id] === node);
      return !edges.some(e => e.from_node === nodeId || e.to_node === nodeId);
    }).length;
    
    const maxDegree = nodes.reduce((max, node) => {
      const nodeId = Object.keys($graphData.nodes).find(id => $graphData.nodes[id] === node);
      if (!nodeId) return max;
      const degree = edges.filter(e => e.from_node === nodeId || e.to_node === nodeId).length;
      return Math.max(max, degree);
    }, 0);
    
    const avgDegree = nodes.length > 0 
      ? (edges.length * 2) / nodes.length 
      : 0;
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes,
      edgeTypes,
      isolatedNodes,
      maxDegree,
      avgDegree: avgDegree.toFixed(2),
      nodeTypeCounts,
      edgeTypeCounts
    };
  }
</script>

<div class="rounded-2xl border overflow-hidden shadow-lg {$darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'}">
  <div class="px-4 py-3 border-b {$darkMode ? 'border-gray-700 bg-linear-to-r from-indigo-900/60 to-purple-900/60' : 'border-gray-200 bg-linear-to-r from-indigo-50 to-purple-50'}">
    <h3 class="font-bold flex items-center gap-2 {$darkMode ? 'text-indigo-300' : 'text-indigo-800'}">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      Graph Statistics
    </h3>
  </div>
  <div class="p-4 space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-lg p-3 {$darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}">
        <div class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Total Nodes</div>
        <div class="text-2xl font-bold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.totalNodes}</div>
      </div>
      <div class="rounded-lg p-3 {$darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}">
        <div class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Total Edges</div>
        <div class="text-2xl font-bold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.totalEdges}</div>
      </div>
      <div class="rounded-lg p-3 {$darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}">
        <div class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Node Types</div>
        <div class="text-2xl font-bold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.nodeTypes}</div>
      </div>
      <div class="rounded-lg p-3 {$darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}">
        <div class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Edge Types</div>
        <div class="text-2xl font-bold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.edgeTypes}</div>
      </div>
    </div>
    
    <div class="space-y-2 pt-2 border-t {$darkMode ? 'border-gray-700' : 'border-gray-200'}">
      <div class="flex justify-between text-sm">
        <span class="{$darkMode ? 'text-gray-400' : 'text-gray-600'}">Isolated Nodes</span>
        <span class="font-semibold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.isolatedNodes}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="{$darkMode ? 'text-gray-400' : 'text-gray-600'}">Max Degree</span>
        <span class="font-semibold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.maxDegree}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="{$darkMode ? 'text-gray-400' : 'text-gray-600'}">Avg Degree</span>
        <span class="font-semibold {$darkMode ? 'text-white' : 'text-gray-900'}">{stats.avgDegree}</span>
      </div>
    </div>
  </div>
</div>
