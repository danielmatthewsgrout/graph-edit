<script lang="ts">
  import type { NodeIcon } from '../types';
  
  export let icon: NodeIcon = 'circle';
  export let size: number = 24;
  export let color: string = 'currentColor';
</script>

{#if icon === 'circle'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="12" r="10" />
  </svg>
{:else if icon === 'square'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
{:else if icon === 'diamond'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12,2 22,12 12,22 2,12" />
  </svg>
{:else if icon === 'star'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
{:else if icon === 'hexagon'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
  </svg>
{:else if icon === 'triangle'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="12,3 22,21 2,21" />
  </svg>
{:else if icon === 'user'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="8" r="5" />
    <path d="M20,21 C20,16.58 16.42,13 12,13 C7.58,13 4,16.58 4,21" />
  </svg>
{:else if icon === 'building'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <rect x="7" y="5" width="3" height="3" fill="white" opacity="0.5" />
    <rect x="14" y="5" width="3" height="3" fill="white" opacity="0.5" />
    <rect x="7" y="11" width="3" height="3" fill="white" opacity="0.5" />
    <rect x="14" y="11" width="3" height="3" fill="white" opacity="0.5" />
    <rect x="9" y="17" width="6" height="5" fill="white" opacity="0.5" />
  </svg>
{:else if icon === 'folder'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
  </svg>
{:else if icon === 'file'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M14,2 L6,2 C4.9,2 4,2.9 4,4 L4,20 C4,21.1 4.9,22 6,22 L18,22 C19.1,22 20,21.1 20,20 L20,8 L14,2 Z M14,8 L14,3 L19,8 L14,8 Z" />
  </svg>
{:else if icon === 'database'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 5c0 1.66-4.03 3-9 3S3 6.66 3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5z" />
    <path d="M21 11c0 1.66-4.03 3-9 3s-9-1.34-9-3v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6z" />
  </svg>
{:else if icon === 'server'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <circle cx="6" cy="6" r="1" fill="white" />
    <circle cx="6" cy="18" r="1" fill="white" />
  </svg>
{:else if icon === 'globe'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2">
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M2 12h20" stroke="white" opacity="0.5" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="white" opacity="0.5" />
  </svg>
{:else if icon === 'heart'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
{:else if icon === 'zap'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
{:else if icon === 'shield'}
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
{/if}
