<script lang="ts">
  import type { NodeIcon } from '../types';
  import { Circle, Square, Diamond, Star, Hexagon, Triangle, User, Building, Folder, File, Database, Server, Globe, Heart, Zap, Shield } from 'lucide-svelte';
  
  export let icon: NodeIcon = 'circle';
  export let size: number = 24;
  export let color: string = 'currentColor';
</script>

{#if icon === 'circle'}
  <Circle size={size} fill={color} stroke="none" />
{:else if icon === 'square'}
  <Square size={size} fill={color} stroke="none" />
{:else if icon === 'diamond'}
  <Diamond size={size} fill={color} stroke="none" />
{:else if icon === 'star'}
  <Star size={size} fill={color} stroke="none" />
{:else if icon === 'hexagon'}
  <Hexagon size={size} fill={color} stroke="none" />
{:else if icon === 'triangle'}
  <Triangle size={size} fill={color} stroke="none" />
{:else if icon === 'user'}
  <User size={size} fill={color} stroke="none" />
{:else if icon === 'building'}
  <Building size={size} fill={color} stroke="none" />
{:else if icon === 'folder'}
  <Folder size={size} fill={color} stroke="none" />
{:else if icon === 'file'}
  <File size={size} fill={color} stroke="none" />
{:else if icon === 'database'}
  <Database size={size} fill={color} stroke="none" />
{:else if icon === 'server'}
  <Server size={size} fill={color} stroke="none" />
{:else if icon === 'globe'}
  <Globe size={size} fill={color} stroke="none" />
{:else if icon === 'heart'}
  <Heart size={size} fill={color} stroke="none" />
{:else if icon === 'zap'}
  <Zap size={size} fill={color} stroke="none" />
{:else if icon === 'shield'}
  <Shield size={size} fill={color} stroke="none" />
{/if}
