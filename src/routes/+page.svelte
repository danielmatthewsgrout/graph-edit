<script lang="ts">
  import GraphCanvas from '$lib/components/GraphCanvas.svelte';
  import TypeManager from '$lib/components/TypeManager.svelte';
  import PropertiesEditor from '$lib/components/PropertiesEditor.svelte';
  import ImportExport from '$lib/components/ImportExport.svelte';
  import CanvasToolbar from '$lib/components/CanvasToolbar.svelte';
  import GraphStatistics from '$lib/components/GraphStatistics.svelte';
  import { darkMode, graphData } from '$lib/stores';

  let graphCanvas: GraphCanvas | undefined = $state();

  let nodeCount = $derived(Object.keys($graphData.nodes).length);
  let edgeCount = $derived(Object.keys($graphData.edges).length);
</script>

<svelte:head>
  <title>Graph Editor - Visual Graph Authoring</title>
  <meta name="description" content="A modern web-based graph editor for creating and editing graph structures visually." />
</svelte:head>

<div class="flex h-screen overflow-hidden {$darkMode ? 'bg-gray-950' : 'bg-gray-100'}">
  <aside class="w-80 flex flex-col border-r shadow-2xl {$darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-xl">
    <div class="p-4 border-b {$darkMode ? 'border-gray-800 bg-linear-to-br from-blue-950/50 via-gray-900 to-purple-950/50' : 'border-gray-200 bg-linear-to-br from-blue-50 via-white to-indigo-50'}">
      <h2 class="text-lg font-bold flex items-center gap-2 {$darkMode ? 'text-white' : 'text-gray-800'}">
        <div class="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        Type Palette
      </h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
      <TypeManager />
      <GraphStatistics />
    </div>
  </aside>

  <main class="flex-1 flex flex-col min-w-0">
    <header class="relative border-b shadow-lg overflow-hidden {$darkMode ? 'border-gray-800' : 'border-gray-200'}">
      <div class="absolute inset-0 {$darkMode ? 'bg-linear-to-r from-gray-900 via-gray-800 to-gray-900' : 'bg-linear-to-r from-white via-gray-50 to-white'}"></div>
      {#if $darkMode}
        <div class="absolute inset-0 opacity-50" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
      {:else}
        <div class="absolute inset-0 opacity-50" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
      {/if}

      <div class="relative z-10 p-4">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div class="flex items-center gap-4 min-w-0">
            <div class="relative">
              <div class="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 {$darkMode ? 'border-gray-800' : 'border-white'} flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
            <div class="min-w-0">
              <h1 class="text-2xl font-black tracking-tight {$darkMode ? 'text-white' : 'text-gray-900'}">
                <span class="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Daniel's Graph Editor</span>
              </h1>
              <div class="flex items-center gap-3 mt-1">
                <span class="flex items-center gap-1.5 text-sm {$darkMode ? 'text-gray-400' : 'text-gray-600'}">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  {nodeCount} nodes
                </span>
                <span class="flex items-center gap-1.5 text-sm {$darkMode ? 'text-gray-400' : 'text-gray-600'}">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  {edgeCount} edges
                </span>
              </div>
            </div>
          </div>
          <ImportExport />
        </div>
        {#if graphCanvas}
          <div class="flex items-center justify-end">
            <CanvasToolbar
              onAddNode={graphCanvas.api.addNode}
              onZoomIn={graphCanvas.api.zoomIn}
              onZoomOut={graphCanvas.api.zoomOut}
              onResetZoom={graphCanvas.api.resetZoom}
              onCenterView={graphCanvas.api.centerView}
              onExportSVG={graphCanvas.api.exportSVG}
              onExportPNG={graphCanvas.api.exportPNG}
              onValidate={graphCanvas.api.applyValidation}
              onCopy={graphCanvas.api.copy}
              onPaste={graphCanvas.api.paste}
            />
          </div>
        {/if}
      </div>
    </header>

    <div class="flex-1 relative overflow-hidden">
      <GraphCanvas bind:this={graphCanvas} />
    </div>
  </main>

  <aside class="w-80 flex flex-col border-l shadow-2xl {$darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-xl">
    <div class="p-4 border-b {$darkMode ? 'border-gray-800 bg-linear-to-br from-purple-950/50 via-gray-900 to-pink-950/50' : 'border-gray-200 bg-linear-to-br from-purple-50 via-white to-pink-50'}">
      <h2 class="text-lg font-bold flex items-center gap-2 {$darkMode ? 'text-white' : 'text-gray-800'}">
        <div class="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        Inspector
      </h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <PropertiesEditor />
    </div>
  </aside>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
