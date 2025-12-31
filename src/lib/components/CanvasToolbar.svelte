<script lang="ts">
  import { darkMode, canvasZoom, snapToGrid, undo, redo } from '../stores';
  import { gridLayout, forceDirectedLayout, radialLayout, treeLayout } from '../utils/layoutUtils';
  import { Plus, ChevronDown, Move3d, Undo2, Redo2 } from 'lucide-svelte';
  
  export let onAddNode: () => void;
  export let onZoomIn: () => void;
  export let onZoomOut: () => void;
  export let onResetZoom: () => void;
  export let onCenterView: () => void;
  export let onExportSVG: () => void;
  export let onExportPNG: () => void;
  export let onValidate: () => void;
  export let onCopy: () => void;
  export let onPaste: () => void;
  
  function handleLayoutChange(layout: string) {
    if (layout === 'grid') {
      gridLayout();
      setTimeout(onCenterView, 10);
    } else if (layout === 'force') {
      forceDirectedLayout();
      setTimeout(onCenterView, 10);
    } else if (layout === 'radial') {
      radialLayout();
      setTimeout(onCenterView, 10);
    } else if (layout === 'tree') {
      treeLayout();
      setTimeout(onCenterView, 10);
    }
  }
</script>

<div class="flex items-center gap-2 flex-wrap">
  <div class="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
    <button 
      class="px-3 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white"
      on:click={onAddNode}
      title="Add Node"
    >
      <span class="flex items-center gap-1.5">
        <Plus class="w-4 h-4" />
        Add Node
      </span>
    </button>
    <div class="relative">
      <select
        on:change={(e) => {
          handleLayoutChange(e.currentTarget.value);
          e.currentTarget.value = '';
        }}
        class="px-3 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all appearance-none cursor-pointer pr-8 {$darkMode ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'}"
        title="Layout Presets"
        style="color-scheme: {$darkMode ? 'dark' : 'light'};"
      >
        <option value="">Layout...</option>
        <option value="grid">Grid</option>
        <option value="force">Force-Directed</option>
        <option value="radial">Radial</option>
        <option value="tree">Tree</option>
      </select>
      <ChevronDown class="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none {$darkMode ? 'text-gray-300' : 'text-gray-600'}" />
    </div>
  </div>
  
  <div class="flex items-center gap-1 rounded-2xl px-2 py-2 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
    <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-all font-bold text-base {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onZoomOut} title="Zoom Out">−</button>
    <button class="px-2 h-9 rounded-lg text-xs font-mono transition-all {$darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}" on:click={onResetZoom} title="Reset Zoom">{Math.round($canvasZoom * 100)}%</button>
    <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-all font-bold text-base {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onZoomIn} title="Zoom In">+</button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onCenterView} title="Centre View">
      <Move3d class="w-4 h-4" />
    </button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={undo} title="Undo (Ctrl/Cmd+Z)">
      <Undo2 class="w-4 h-4" />
    </button>
    <button class="w-9 h-9 rounded-lg flex items-center justify-center transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={redo} title="Redo (Ctrl/Cmd+Shift+Z)">
      <Redo2 class="w-4 h-4" />
    </button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={() => snapToGrid.update(v => !v)} title="Toggle snap-to-grid">
      {$snapToGrid ? 'Snap' : 'Snap'}
    </button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onExportSVG} title="Export SVG">SVG</button>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onExportPNG} title="Export PNG">PNG</button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onValidate} title="Validate and clean">
      Validate
    </button>
    <div class="w-px {$darkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1"></div>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onCopy} title="Copy (Ctrl/Cmd+C)">Copy</button>
    <button class="px-2 h-9 rounded-lg text-xs font-semibold transition-all {$darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}" on:click={onPaste} title="Paste (Ctrl/Cmd+V)">Paste</button>
  </div>
</div>
