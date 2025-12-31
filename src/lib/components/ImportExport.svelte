<script lang="ts">
  import { graphData, darkMode, resetGraph, canvasZoom, canvasPan } from '../stores';
  import type { GraphData } from '../types';
  import { get } from 'svelte/store';

  function exportGraph() {
    const data = get(graphData);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importGraph(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data: GraphData = JSON.parse(json);
        
        if (!data.node_types || !data.edge_types || !data.nodes || !data.edges) {
          alert('Invalid graph file format');
          return;
        }

        const spacing = 150;
        
        Object.values(data.nodes).forEach((node, index) => {
          if (!node.layout_properties) {
            const row = Math.floor(index / 5);
            const col = index % 5;
            node.layout_properties = {
              x_pos: col * spacing + 100,
              y_pos: row * spacing + 100
            };
          }
        });

        Object.values(data.node_types).forEach(type => {
          if (!type.icon) type.icon = 'circle';
        });

        graphData.set(data);
        canvasZoom.set(1);
        canvasPan.set({ x: 0, y: 0 });
        input.value = '';
      } catch (error) {
        alert('Error parsing JSON file: ' + error);
      }
    };
    reader.readAsText(file);
  }

  function newGraph() {
    if (confirm('⚠️ Create a new graph?\n\nThis will delete all current nodes, edges, and types. This action cannot be undone.')) {
      resetGraph();
    }
  }

  function toggleDarkMode() {
    darkMode.update(d => !d);
  }
</script>

<div class="flex items-center gap-2">
  <button
    on:click={newGraph}
    class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 {$darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'}"
    title="Create new graph"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    New
  </button>
  
  <button
    on:click={exportGraph}
    class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Export
  </button>
  
  <label class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
    Import
    <input
      type="file"
      accept=".json"
      on:change={importGraph}
      class="hidden"
    />
  </label>
  
  <div class="w-px h-8 {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
  
  <button
    on:click={toggleDarkMode}
    class="w-11 h-11 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg {$darkMode ? 'bg-linear-to-br from-yellow-400 to-orange-500 text-gray-900' : 'bg-linear-to-br from-indigo-600 to-purple-600 text-yellow-300'}"
    title={$darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  >
    {#if $darkMode}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    {/if}
  </button>
  
  <a
    href="https://github.com/danielmatthewsgrout/graphedit"
    target="_blank"
    rel="noopener noreferrer"
    class="w-11 h-11 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg {$darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
    title="View on GitHub"
  >
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  </a>
</div>
