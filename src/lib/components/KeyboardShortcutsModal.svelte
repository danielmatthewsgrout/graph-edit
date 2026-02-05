<script lang="ts">
  import { darkMode } from '../stores';

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show = $bindable(false), onClose }: Props = $props();
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
  >
    <div class="rounded-2xl shadow-2xl p-6 w-full max-w-md {$darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}" role="document">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold {$darkMode ? 'text-white' : 'text-gray-900'}">Keyboard Shortcuts</h3>
        <button class="text-sm px-2 py-1 rounded {$darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}" onclick={onClose}>Close</button>
      </div>
      <ul class="space-y-2 text-sm {$darkMode ? 'text-gray-200' : 'text-gray-700'}">
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Ctrl/Cmd + Z</strong> — Undo</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Ctrl/Cmd + Shift + Z</strong> — Redo</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Ctrl/Cmd + C</strong> — Copy selection</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Ctrl/Cmd + V</strong> — Paste</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Delete / Backspace</strong> — Delete selection</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">?</strong> — Toggle this overlay</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Right-click then click</strong> — Create edge</li>
        <li><strong class="{$darkMode ? 'text-white' : 'text-gray-900'}">Shift/Ctrl + Click</strong> — Multi-select nodes/edges</li>
      </ul>
    </div>
  </div>
{/if}
