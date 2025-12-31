<script lang="ts">
  import { darkMode } from '../stores';
  import { Search } from 'lucide-svelte';
  
  export let searchTerm: string;
  export let onSearch: () => void;
</script>

<div class="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-2xl border backdrop-blur-xl {$darkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'}">
  <input
    type="text"
    placeholder="Search..."
    bind:value={searchTerm}
    class="w-48 px-3 py-1.5 rounded-lg text-sm border {$darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} focus:ring-2 focus:ring-blue-500 focus:outline-none"
    on:keydown={(e) => e.key === 'Enter' && onSearch()}
  />
  <button
    class="px-3 py-1.5 rounded-lg text-sm font-semibold {$darkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'}"
    on:click={onSearch}
    title="Search"
  >
    <Search class="w-4 h-4" />
  </button>
</div>
