<script lang="ts">
  import { graphData, activeNodeType, activeEdgeType, darkMode } from '../stores';
  import { NODE_ICONS, type NodeIcon } from '../types';
  import NodeIconComponent from './NodeIcon.svelte';

  let newNodeTypeId = '';
  let newNodeTypeLabel = '';
  let newNodeTypeColor = '#ef4444';
  let newNodeTypeIcon: NodeIcon = 'circle';
  let newEdgeTypeId = '';
  let newEdgeTypeLabel = '';
  let newEdgeTypeColor = '#22c55e';
  let editingNodeType: string | null = null;
  let editingEdgeType: string | null = null;
  let nodeTypesExpanded = false;
  let edgeTypesExpanded = false;

  function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}`;
  }

  function createNodeType() {
    const id = newNodeTypeId || generateId('node_type');
    if (!newNodeTypeLabel) return;
    
    graphData.update(data => {
      if (!data.node_types[id]) {
        data.node_types[id] = {
          colour: newNodeTypeColor,
          label: newNodeTypeLabel,
          icon: newNodeTypeIcon
        };
        activeNodeType.set(id);
      }
      return data;
    });
    
    newNodeTypeId = '';
    newNodeTypeLabel = '';
    newNodeTypeColor = '#ef4444';
    newNodeTypeIcon = 'circle';
  }

  function createEdgeType() {
    const id = newEdgeTypeId || generateId('edge_type');
    if (!newEdgeTypeLabel) return;
    
    graphData.update(data => {
      if (!data.edge_types[id]) {
        data.edge_types[id] = {
          colour: newEdgeTypeColor,
          label: newEdgeTypeLabel
        };
        activeEdgeType.set(id);
      }
      return data;
    });
    
    newEdgeTypeId = '';
    newEdgeTypeLabel = '';
    newEdgeTypeColor = '#22c55e';
  }

  function deleteNodeType(typeId: string) {
    graphData.update(data => {
      delete data.node_types[typeId];
      if ($activeNodeType === typeId) {
        const remaining = Object.keys(data.node_types);
        activeNodeType.set(remaining[0] || '');
      }
      return data;
    });
  }

  function deleteEdgeType(typeId: string) {
    graphData.update(data => {
      delete data.edge_types[typeId];
      if ($activeEdgeType === typeId) {
        const remaining = Object.keys(data.edge_types);
        activeEdgeType.set(remaining[0] || '');
      }
      return data;
    });
  }

  function updateNodeType(typeId: string, field: 'label' | 'colour' | 'icon', value: string) {
    graphData.update(data => {
      if (data.node_types[typeId]) {
        if (field === 'icon') {
          data.node_types[typeId].icon = value as NodeIcon;
        } else {
          data.node_types[typeId][field] = value;
        }
      }
      return data;
    });
  }

  function updateEdgeType(typeId: string, field: 'label' | 'colour', value: string) {
    graphData.update(data => {
      if (data.edge_types[typeId]) {
        data.edge_types[typeId][field] = value;
      }
      return data;
    });
  }
</script>

<div class="space-y-4">
  <!-- Node Types Section -->
  <div class="rounded-2xl border overflow-hidden shadow-lg {$darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'}">
    <div class="px-4 py-3 border-b {$darkMode ? 'bg-linear-to-r from-blue-900/60 to-indigo-900/60 border-gray-700/50' : 'bg-linear-to-r from-blue-50 to-indigo-50 border-blue-100'}">
      <h3 class="font-bold flex items-center gap-2 {$darkMode ? 'text-blue-300' : 'text-blue-800'}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
        Node Types
        <span class="text-xs px-2 py-0.5 rounded-full font-medium {$darkMode ? 'bg-blue-800/60 text-blue-200' : 'bg-blue-200 text-blue-800'}">{Object.keys($graphData.node_types).length}</span>
      </h3>
    </div>
    
    <div class="p-3 space-y-3">
      <!-- Active Node Type Dropdown with Icon Preview -->
      <div>
        <label for="active-node-type" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Active Type</label>
        <div class="relative">
          <select 
            id="active-node-type"
            bind:value={$activeNodeType}
            class="w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-medium transition-all appearance-none cursor-pointer {$darkMode ? 'bg-gray-700/80 border-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-white'} focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {#each Object.entries($graphData.node_types) as [typeId, type]}
              <option value={typeId}>{type.label}</option>
            {/each}
          </select>
          {#if $activeNodeType && $graphData.node_types[$activeNodeType]}
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <NodeIconComponent icon={$graphData.node_types[$activeNodeType].icon || 'circle'} size={24} color={$graphData.node_types[$activeNodeType].colour} />
            </div>
          {/if}
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-4 h-4 {$darkMode ? 'text-gray-400' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- Collapsible Type List -->
      <div class="border rounded-xl overflow-hidden {$darkMode ? 'border-gray-700/50' : 'border-gray-200'}">
        <button
          on:click={() => nodeTypesExpanded = !nodeTypesExpanded}
          class="w-full px-3 py-2 flex items-center justify-between text-sm font-medium transition-colors {$darkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}"
        >
          <span>Manage Types ({Object.keys($graphData.node_types).length})</span>
          <svg class="w-4 h-4 transition-transform {nodeTypesExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        
        {#if nodeTypesExpanded}
          <div class="p-2 space-y-2 {$darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}">
            {#each Object.entries($graphData.node_types) as [typeId, type]}
              <div class="p-2 rounded-lg border transition-all {$darkMode ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-sm'}">
                <div class="flex items-center gap-2">
                  <NodeIconComponent icon={type.icon || 'circle'} size={28} color={type.colour} />
                  <div class="flex-1 min-w-0">
                    {#if editingNodeType === typeId}
                      <input
                        type="text"
                        value={type.label}
                        on:blur={() => editingNodeType = null}
                        on:keydown={(e) => {
                          if (e.key === 'Enter') {
                            updateNodeType(typeId, 'label', e.currentTarget.value);
                            editingNodeType = null;
                          }
                        }}
                        class="w-full px-2 py-1 text-sm border rounded {$darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}"
                      />
                    {:else}
                      <button class="font-medium text-sm text-left w-full {$darkMode ? 'text-white' : 'text-gray-800'}" on:click={() => editingNodeType = typeId}>
                        {type.label}
                      </button>
                    {/if}
                  </div>
                  <button
                    on:click={() => deleteNodeType(typeId)}
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                  >✕</button>
                </div>
                <div class="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={type.colour}
                    on:input={(e) => updateNodeType(typeId, 'colour', e.currentTarget.value)}
                    class="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <select
                    value={type.icon || 'circle'}
                    on:change={(e) => updateNodeType(typeId, 'icon', e.currentTarget.value)}
                    class="flex-1 px-2 py-1 text-xs rounded-lg border {$darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}"
                  >
                    {#each NODE_ICONS as icon}
                      <option value={icon}>{icon}</option>
                    {/each}
                  </select>
                </div>
              </div>
            {/each}
            
          </div>
        {/if}
      </div>

      <!-- Add New Node Type (always visible) -->
      <div class="pt-2">
        <label for="new-node-type-label" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Add New Type</label>
        <div class="space-y-2">
          <input
            id="new-node-type-label"
            type="text"
            placeholder="Type label..."
            bind:value={newNodeTypeLabel}
            class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div class="flex gap-2">
            <input type="color" bind:value={newNodeTypeColor} class="w-9 h-9 rounded-lg cursor-pointer border-0 p-0" />
            <select bind:value={newNodeTypeIcon} class="flex-1 px-2 py-1 text-xs rounded-lg border {$darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}">
              {#each NODE_ICONS as icon}
                <option value={icon}>{icon}</option>
              {/each}
            </select>
            <button
              on:click={createNodeType}
              disabled={!newNodeTypeLabel}
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 bg-blue-500 hover:bg-blue-600 text-white"
            >+ Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edge Types Section -->
  <div class="rounded-2xl border overflow-hidden shadow-lg {$darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200'}">
    <div class="px-4 py-3 border-b {$darkMode ? 'bg-linear-to-r from-green-900/60 to-emerald-900/60 border-gray-700/50' : 'bg-linear-to-r from-green-50 to-emerald-50 border-green-100'}">
      <h3 class="font-bold flex items-center gap-2 {$darkMode ? 'text-green-300' : 'text-green-800'}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        Edge Types
        <span class="text-xs px-2 py-0.5 rounded-full font-medium {$darkMode ? 'bg-green-800/60 text-green-200' : 'bg-green-200 text-green-800'}">{Object.keys($graphData.edge_types).length}</span>
      </h3>
    </div>
    
    <div class="p-3 space-y-3">
      <!-- Active Edge Type Dropdown -->
      <div>
        <label for="active-edge-type" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Active Type</label>
        <div class="relative">
          <select 
            id="active-edge-type"
            bind:value={$activeEdgeType}
            class="w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all appearance-none cursor-pointer {$darkMode ? 'bg-gray-700/80 border-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-white'} focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            {#each Object.entries($graphData.edge_types) as [typeId, type]}
              <option value={typeId}>{type.label}</option>
            {/each}
          </select>
          {#if $activeEdgeType && $graphData.edge_types[$activeEdgeType]}
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-2 rounded" style="background-color: {$graphData.edge_types[$activeEdgeType].colour}"></div>
          {/if}
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-4 h-4 {$darkMode ? 'text-gray-400' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- Collapsible Type List -->
      <div class="border rounded-xl overflow-hidden {$darkMode ? 'border-gray-700/50' : 'border-gray-200'}">
        <button
          on:click={() => edgeTypesExpanded = !edgeTypesExpanded}
          class="w-full px-3 py-2 flex items-center justify-between text-sm font-medium transition-colors {$darkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}"
        >
          <span>Manage Types ({Object.keys($graphData.edge_types).length})</span>
          <svg class="w-4 h-4 transition-transform {edgeTypesExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        
        {#if edgeTypesExpanded}
          <div class="p-2 space-y-2 {$darkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}">
            {#each Object.entries($graphData.edge_types) as [typeId, type]}
              <div class="p-2 rounded-lg border transition-all {$darkMode ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700' : 'bg-white border-gray-200 hover:shadow-sm'}">
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    value={type.colour}
                    on:input={(e) => updateEdgeType(typeId, 'colour', e.currentTarget.value)}
                    class="w-9 h-9 rounded-lg cursor-pointer border-0 p-0 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    {#if editingEdgeType === typeId}
                      <input
                        type="text"
                        value={type.label}
                        on:blur={() => editingEdgeType = null}
                        on:keydown={(e) => {
                          if (e.key === 'Enter') {
                            updateEdgeType(typeId, 'label', e.currentTarget.value);
                            editingEdgeType = null;
                          }
                        }}
                        class="w-full px-2 py-1 text-sm border rounded {$darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}"
                      />
                    {:else}
                      <button class="font-medium text-sm text-left w-full {$darkMode ? 'text-white' : 'text-gray-800'}" on:click={() => editingEdgeType = typeId}>
                        {type.label}
                      </button>
                    {/if}
                  </div>
                  <button
                    on:click={() => deleteEdgeType(typeId)}
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                  >✕</button>
                </div>
              </div>
            {/each}
            
          </div>
        {/if}
      </div>

      <!-- Add New Edge Type (always visible) -->
      <div class="pt-2">
        <label for="new-edge-type-label" class="block text-xs font-semibold mb-1.5 uppercase tracking-wide {$darkMode ? 'text-gray-400' : 'text-gray-500'}">Add New Type</label>
        <div class="space-y-2">
          <input
            id="new-edge-type-label"
            type="text"
            placeholder="Type label..."
            bind:value={newEdgeTypeLabel}
            class="w-full px-3 py-2 text-sm border rounded-lg {$darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 placeholder-gray-400'} focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <div class="flex gap-2">
            <input type="color" bind:value={newEdgeTypeColor} class="w-9 h-9 rounded-lg cursor-pointer border-0 p-0 shrink-0" />
            <button
              on:click={createEdgeType}
              disabled={!newEdgeTypeLabel}
              class="flex-1 h-9 rounded-lg text-sm font-medium transition-all disabled:opacity-50 bg-green-500 hover:bg-green-600 text-white"
            >+ Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
