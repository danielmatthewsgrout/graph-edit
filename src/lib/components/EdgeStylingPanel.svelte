<script lang="ts">
  import { darkMode, graphData, selectedEdgeIds, pushHistory } from '../stores';
  import type { EdgeLineStyle } from '../types';
</script>

{#if $selectedEdgeIds.length}
  <div class="absolute top-20 right-4 z-10 rounded-2xl p-3 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
    <div class="text-xs font-semibold mb-2 {$darkMode ? 'text-gray-300' : 'text-gray-700'}" id="edge-style-label">Edge styling</div>
    <div class="flex items-center gap-3">
      <label for="edge-weight" class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Weight</label>
      <input
        id="edge-weight"
        type="range"
        min="1"
        max="10"
        step="1"
        value={$selectedEdgeIds[0] ? $graphData.edges[$selectedEdgeIds[0]]?.weight ?? 1 : 1}
        on:input={(e) => {
          const val = Number(e.currentTarget.value);
          pushHistory();
          graphData.update(d => {
            $selectedEdgeIds.forEach(id => {
              if (d.edges[id]) d.edges[id].weight = val;
            });
            return d;
          });
        }}
        class="flex-1"
      />
      <label for="edge-line-style" class="text-xs {$darkMode ? 'text-gray-400' : 'text-gray-600'}">Line</label>
      <select
        id="edge-line-style"
        value={$selectedEdgeIds[0] ? ($graphData.edges[$selectedEdgeIds[0]]?.line_style || $graphData.edge_types[$graphData.edges[$selectedEdgeIds[0]].edge_type]?.line_style || 'solid') : 'solid'}
        on:change={(e) => {
          const val = e.currentTarget.value;
          pushHistory();
          graphData.update(d => {
            $selectedEdgeIds.forEach(id => {
              if (d.edges[id]) d.edges[id].line_style = val as EdgeLineStyle;
            });
            return d;
          });
        }}
        class="px-2 py-1 rounded border {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}"
      >
        <option value="solid">solid</option>
        <option value="dashed">dashed</option>
        <option value="dotted">dotted</option>
        <option value="dashdot">dash-dot</option>
      </select>
    </div>
  </div>
{/if}
