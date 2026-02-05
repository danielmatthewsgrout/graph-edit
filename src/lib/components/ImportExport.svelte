<script lang="ts">
  import { graphData, darkMode, resetGraph, canvasZoom, canvasPan } from '../stores';
  import type { GraphData } from '../types';
  import { get } from 'svelte/store';
  import { FilePlus, Download, Upload, Sun, Moon, Github } from 'lucide-svelte';

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
        Object.values(data.edge_types).forEach(type => {
          if (!type.line_style) type.line_style = 'solid';
        });
        Object.values(data.edges).forEach(edge => {
          if (edge.line_style && !['solid','dashed','dotted','dashdot'].includes(edge.line_style)) {
            delete (edge as any).line_style;
          }
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
    if (confirm('Create a new graph?\n\nThis will delete all current nodes, edges, and types. This action cannot be undone.')) {
      resetGraph();
    }
  }

  function toggleDarkMode() {
    darkMode.update(d => !d);
  }
</script>

<div class="flex items-center gap-2">
  <button
    onclick={newGraph}
    class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 {$darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'}"
    title="Create new graph"
  >
    <FilePlus class="w-4 h-4" />
    New
  </button>

  <button
    onclick={exportGraph}
    class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
  >
    <Download class="w-4 h-4" />
    Export
  </button>

  <label class="px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white">
    <Upload class="w-4 h-4" />
    Import
    <input
      type="file"
      accept=".json"
      onchange={importGraph}
      class="hidden"
    />
  </label>

  <div class="w-px h-8 {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>

  <button
    onclick={toggleDarkMode}
    class="w-11 h-11 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg {$darkMode ? 'bg-linear-to-br from-yellow-400 to-orange-500 text-gray-900' : 'bg-linear-to-br from-indigo-600 to-purple-600 text-yellow-300'}"
    title={$darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  >
    {#if $darkMode}
      <Sun class="w-5 h-5" />
    {:else}
      <Moon class="w-5 h-5" />
    {/if}
  </button>

  <a
    href="https://github.com/danielmatthewsgrout/graph-edit"
    target="_blank"
    rel="noopener noreferrer"
    class="w-11 h-11 rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg {$darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
    title="View on GitHub"
  >
    <Github class="w-5 h-5" />
  </a>
</div>
