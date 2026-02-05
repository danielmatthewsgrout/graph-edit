<script lang="ts">
  import { graphData, selectedNodeId, selectedEdgeId, darkMode } from '../stores';
  import { NODE_ICONS } from '../types';
  import NodeIconComponent from './NodeIcon.svelte';
  import { ChevronDown, MousePointer2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let newPropertyKey = $state('');
  let newPropertyValue = $state('');
  let emojiPickerOpen = $state(false);
  let emojiPickerButton: HTMLButtonElement | undefined = $state();
  let emojiPickerPopup: HTMLDivElement | undefined = $state();

  const commonEmojis = [
    '⭐', '🎯', '🔥', '💎', '🚀', '✨', '💡', '🎉',
    '✅', '❌', '⚠️', '🔒', '🔓', '📌', '📍', '🎨',
    '💻', '📱', '🌐', '⚡', '🌟', '💪', '🎪', '🏆',
    '🔑', '📊', '📈', '📉', '💼', '🎁', '🎊', '🌈'
  ];

  function selectEmoji(emoji: string) {
    updateNodeField('badge', emoji);
    emojiPickerOpen = false;
  }

  function clearBadge() {
    updateNodeField('badge', '');
    emojiPickerOpen = false;
  }

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerOpen && event.target) {
        const target = event.target as globalThis.Node;
        if (emojiPickerButton && !emojiPickerButton.contains(target) &&
            emojiPickerPopup && !emojiPickerPopup.contains(target)) {
          emojiPickerOpen = false;
        }
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  let selectedNode = $derived($selectedNodeId ? $graphData.nodes[$selectedNodeId] : null);
  let selectedEdge = $derived($selectedEdgeId ? $graphData.edges[$selectedEdgeId] : null);
  let selectedNodeType = $derived(selectedNode ? $graphData.node_types[selectedNode.node_type] : null);
  let selectedEdgeType = $derived(selectedEdge ? $graphData.edge_types[selectedEdge.edge_type] : null);

  function updateNodeField(field: 'label' | 'node_type' | 'badge', value: string) {
    if (!$selectedNodeId) return;
    graphData.update(data => {
      if (data.nodes[$selectedNodeId!]) {
        if (field === 'label') {
          data.nodes[$selectedNodeId!].label = value;
        } else if (field === 'node_type') {
          data.nodes[$selectedNodeId!].node_type = value;
        } else if (field === 'badge') {
          if (value.trim()) {
            data.nodes[$selectedNodeId!].badge = value.trim().slice(0, 2);
          } else {
            delete data.nodes[$selectedNodeId!].badge;
          }
        }
      }
      return data;
    });
  }

  function updateEdgeField(field: 'edge_type' | 'weight' | 'label', value: string | number) {
    if (!$selectedEdgeId) return;
    graphData.update(data => {
      if (data.edges[$selectedEdgeId!]) {
        if (field === 'edge_type') {
          data.edges[$selectedEdgeId!].edge_type = value as string;
        } else if (field === 'weight') {
          data.edges[$selectedEdgeId!].weight = value as number;
        } else if (field === 'label') {
          const val = value as string;
          if (val.trim()) {
            data.edges[$selectedEdgeId!].label = val;
          } else {
            delete data.edges[$selectedEdgeId!].label;
          }
        }
      }
      return data;
    });
  }

  function addNodeProperty() {
    if (!$selectedNodeId || !newPropertyKey) return;
    graphData.update(data => {
      if (data.nodes[$selectedNodeId!]) {
        data.nodes[$selectedNodeId!].properties[newPropertyKey] = newPropertyValue;
      }
      return data;
    });
    newPropertyKey = '';
    newPropertyValue = '';
  }

  function removeNodeProperty(key: string) {
    if (!$selectedNodeId) return;
    graphData.update(data => {
      if (data.nodes[$selectedNodeId!]) {
        delete data.nodes[$selectedNodeId!].properties[key];
      }
      return data;
    });
  }

  function updateNodeProperty(key: string, value: string) {
    if (!$selectedNodeId) return;
    graphData.update(data => {
      if (data.nodes[$selectedNodeId!]) {
        data.nodes[$selectedNodeId!].properties[key] = value;
      }
      return data;
    });
  }

  function addEdgeProperty() {
    if (!$selectedEdgeId || !newPropertyKey) return;
    graphData.update(data => {
      if (data.edges[$selectedEdgeId!]) {
        data.edges[$selectedEdgeId!].properties[newPropertyKey] = newPropertyValue;
      }
      return data;
    });
    newPropertyKey = '';
    newPropertyValue = '';
  }

  function removeEdgeProperty(key: string) {
    if (!$selectedEdgeId) return;
    graphData.update(data => {
      if (data.edges[$selectedEdgeId!]) {
        delete data.edges[$selectedEdgeId!].properties[key];
      }
      return data;
    });
  }

  function updateEdgeProperty(key: string, value: string) {
    if (!$selectedEdgeId) return;
    graphData.update(data => {
      if (data.edges[$selectedEdgeId!]) {
        data.edges[$selectedEdgeId!].properties[key] = value;
      }
      return data;
    });
  }

  function deleteNode() {
    if (!$selectedNodeId) return;
    graphData.update(data => {
      delete data.nodes[$selectedNodeId!];
      Object.keys(data.edges).forEach(edgeId => {
        const edge = data.edges[edgeId];
        if (edge.from_node === $selectedNodeId || edge.to_node === $selectedNodeId) {
          delete data.edges[edgeId];
        }
      });
      return data;
    });
    selectedNodeId.set(null);
  }

  function deleteEdge() {
    if (!$selectedEdgeId) return;
    graphData.update(data => {
      delete data.edges[$selectedEdgeId!];
      return data;
    });
    selectedEdgeId.set(null);
  }
</script>

{#if selectedNode}
  <div class="flex flex-col h-full">
    <div class="flex-1 space-y-4 overflow-y-auto">
      <div class="flex items-center gap-3 pb-4 border-b {$darkMode ? 'border-gray-700' : 'border-gray-200'}">
        <div class="relative">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center" style="background: {selectedNodeType?.colour || '#ccc'}20">
            <NodeIconComponent icon={selectedNodeType?.icon || 'circle'} size={36} color={selectedNodeType?.colour || '#ccc'} />
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 {$darkMode ? 'border-gray-900' : 'border-white'}"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg {$darkMode ? 'text-white' : 'text-gray-800'} truncate">{selectedNode.label}</div>
          <div class="text-xs {$darkMode ? 'text-gray-500' : 'text-gray-400'} truncate font-mono">{$selectedNodeId}</div>
        </div>
      </div>

      <div>
        <label for="node-label" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Label</label>
        <input
          id="node-label"
          type="text"
          value={selectedNode.label}
          oninput={(e) => updateNodeField('label', e.currentTarget.value)}
          class="w-full px-4 py-3 border rounded-xl transition-all {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <div class="relative">
        <label for="node-badge" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Badge (emoji)</label>
        <button
          bind:this={emojiPickerButton}
          id="node-badge"
          type="button"
          onclick={() => emojiPickerOpen = !emojiPickerOpen}
          class="w-full px-4 py-3 border rounded-xl transition-all text-center text-xl min-h-[48px] flex items-center justify-center gap-2 {$darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          {#if selectedNode.badge}
            <span class="text-2xl">{selectedNode.badge}</span>
            <span
              role="button"
              tabindex="0"
              onclick={(e) => { e.stopPropagation(); clearBadge(); }}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); clearBadge(); } }}
              class="ml-auto text-xs px-2 py-1 rounded hover:bg-red-500/20 text-red-500"
            >
              Clear
            </span>
          {:else}
            <span class="{$darkMode ? 'text-gray-500' : 'text-gray-400'}">Click to select emoji</span>
          {/if}
        </button>

        {#if emojiPickerOpen}
          <div
            bind:this={emojiPickerPopup}
            class="absolute z-50 mt-2 w-full max-w-sm {$darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl p-4 max-h-64 overflow-y-auto"
            role="dialog"
            aria-label="Emoji picker"
          >
            <div class="grid grid-cols-8 gap-2">
              {#each commonEmojis as emoji}
                <button
                  type="button"
                  onclick={() => selectEmoji(emoji)}
                  class="w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-purple-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Select emoji {emoji}"
                >
                  {emoji}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div>
        <label for="node-type-select" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Node Type</label>
        <div class="relative">
          <select
            id="node-type-select"
            value={selectedNode.node_type}
            onchange={(e) => updateNodeField('node_type', e.currentTarget.value)}
            class="w-full pl-12 pr-4 py-3 border rounded-xl transition-all appearance-none cursor-pointer {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {#each Object.entries($graphData.node_types) as [typeId, type]}
              <option value={typeId}>{type.label}</option>
            {/each}
          </select>
          {#if selectedNodeType}
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <NodeIconComponent icon={selectedNodeType.icon || 'circle'} size={24} color={selectedNodeType.colour} />
            </div>
          {/if}
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown class="w-4 h-4 {$darkMode ? 'text-gray-400' : 'text-gray-500'}" />
          </div>
        </div>
      </div>

      <div class="rounded-xl border overflow-hidden {$darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}">
        <div class="px-3 py-2 border-b {$darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}">
          <div class="text-xs font-semibold uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Custom Properties</div>
        </div>
        <div class="p-3 space-y-2">
          {#each Object.entries(selectedNode.properties) as [key, value]}
            <div class="flex gap-2 items-center">
              <input
                type="text"
                value={key}
                readonly
                aria-label="Property key"
                class="flex-1 px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}"
              />
              <input
                type="text"
                value={value}
                oninput={(e) => updateNodeProperty(key, e.currentTarget.value)}
                aria-label="Property value for {key}"
                class="flex-1 px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onclick={() => removeNodeProperty(key)}
                class="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                aria-label="Remove property {key}"
              >✕</button>
            </div>
          {/each}

          <div class="pt-2 mt-2 border-t {$darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2">
            <input
              type="text"
              placeholder="Key"
              bind:value={newPropertyKey}
              aria-label="New property key"
              class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value"
              bind:value={newPropertyValue}
              aria-label="New property value"
              class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              onclick={addNodeProperty}
              disabled={!newPropertyKey}
              class="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
            >+ Add Property</button>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4 mt-4 border-t {$darkMode ? 'border-gray-700' : 'border-gray-200'}">
      <button
        onclick={deleteNode}
        class="w-full py-3.5 rounded-xl text-sm font-semibold transition-all bg-linear-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-lg shadow-red-500/20"
      >Delete Node</button>
    </div>
  </div>
{:else if selectedEdge}
  <div class="flex flex-col h-full">
    <div class="flex-1 space-y-4 overflow-y-auto">
      <div class="flex items-center gap-3 pb-4 border-b {$darkMode ? 'border-gray-700' : 'border-gray-200'}">
        <div class="relative">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center" style="background: {selectedEdgeType?.colour || '#000'}20">
            <div class="w-8 h-2 rounded-full" style="background: {selectedEdgeType?.colour || '#000'}"></div>
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 {$darkMode ? 'border-gray-900' : 'border-white'}"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg {$darkMode ? 'text-white' : 'text-gray-800'}">{selectedEdgeType?.label || 'Edge'}</div>
          <div class="text-xs {$darkMode ? 'text-gray-500' : 'text-gray-400'} truncate font-mono">{$selectedEdgeId}</div>
        </div>
      </div>

      <div>
        <label for="edge-type-select" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Edge Type</label>
        <div class="relative">
          <select
            id="edge-type-select"
            value={selectedEdge.edge_type}
            onchange={(e) => updateEdgeField('edge_type', e.currentTarget.value)}
            class="w-full pl-10 pr-4 py-3 border rounded-xl transition-all appearance-none cursor-pointer {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {#each Object.entries($graphData.edge_types) as [typeId, type]}
              <option value={typeId}>{type.label}</option>
            {/each}
          </select>
          {#if selectedEdgeType}
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-2 rounded" style="background-color: {selectedEdgeType.colour}"></div>
          {/if}
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown class="w-4 h-4 {$darkMode ? 'text-gray-400' : 'text-gray-500'}" />
          </div>
        </div>
      </div>

      <div>
        <label for="edge-weight" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Weight (thickness)</label>
        <input
          id="edge-weight"
          type="number"
          value={selectedEdge.weight}
          min="0.5"
          step="0.5"
          oninput={(e) => updateEdgeField('weight', parseFloat(e.currentTarget.value) || 1)}
          class="w-full px-4 py-3 border rounded-xl transition-all {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="edge-label" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Label (on edge)</label>
        <input
          id="edge-label"
          type="text"
          value={selectedEdge.label || ''}
          placeholder="Optional label"
          oninput={(e) => updateEdgeField('label', e.currentTarget.value)}
          class="w-full px-4 py-3 border rounded-xl transition-all {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <div class="rounded-xl border overflow-hidden {$darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}">
        <div class="px-3 py-2 border-b {$darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}">
          <div class="text-xs font-semibold uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Connection</div>
        </div>
        <div class="p-3 space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-16 {$darkMode ? 'text-gray-500' : 'text-gray-400'}">From:</span>
            <span class="font-medium {$darkMode ? 'text-white' : 'text-gray-800'}">{$graphData.nodes[selectedEdge.from_node]?.label || selectedEdge.from_node}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-16 {$darkMode ? 'text-gray-500' : 'text-gray-400'}">To:</span>
            <span class="font-medium {$darkMode ? 'text-white' : 'text-gray-800'}">{$graphData.nodes[selectedEdge.to_node]?.label || selectedEdge.to_node}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border overflow-hidden {$darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}">
        <div class="px-3 py-2 border-b {$darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}">
          <div class="text-xs font-semibold uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Custom Properties</div>
        </div>
        <div class="p-3 space-y-2">
          {#each Object.entries(selectedEdge.properties) as [key, value]}
            <div class="flex gap-2 items-center">
              <input
                type="text"
                value={key}
                readonly
                aria-label="Property key"
                class="flex-1 px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}"
              />
              <input
                type="text"
                value={value}
                oninput={(e) => updateEdgeProperty(key, e.currentTarget.value)}
                aria-label="Property value for {key}"
                class="flex-1 px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onclick={() => removeEdgeProperty(key)}
                class="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                aria-label="Remove property {key}"
              >✕</button>
            </div>
          {/each}

          <div class="pt-2 mt-2 border-t {$darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2">
            <input
              type="text"
              placeholder="Key"
              bind:value={newPropertyKey}
              aria-label="New property key"
              class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value"
              bind:value={newPropertyValue}
              aria-label="New property value"
              class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              onclick={addEdgeProperty}
              disabled={!newPropertyKey}
              class="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
            >+ Add Property</button>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4 mt-4 border-t {$darkMode ? 'border-gray-700' : 'border-gray-200'}">
      <button
        onclick={deleteEdge}
        class="w-full py-3.5 rounded-xl text-sm font-semibold transition-all bg-linear-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white shadow-lg shadow-red-500/20"
      >Delete Edge</button>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full text-center p-6">
    <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 {$darkMode ? 'bg-linear-to-br from-gray-800 to-gray-700' : 'bg-linear-to-br from-gray-100 to-gray-200'}">
      <MousePointer2 class="w-10 h-10 {$darkMode ? 'text-gray-600' : 'text-gray-400'}" />
    </div>
    <p class="font-bold text-lg {$darkMode ? 'text-gray-300' : 'text-gray-600'}">No Selection</p>
    <p class="text-sm mt-2 max-w-[200px] {$darkMode ? 'text-gray-500' : 'text-gray-400'}">Click a node or edge on the canvas to view and edit its properties</p>
  </div>
{/if}
