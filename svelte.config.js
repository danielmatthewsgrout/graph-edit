import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const SUPPRESSED_WARNINGS = new Set([
  'a11y_no_static_element_interactions',
  'a11y_no_noninteractive_element_interactions'
]);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    warningFilter: (warning) => !SUPPRESSED_WARNINGS.has(warning.code)
  },
  kit: {
    adapter: adapter()
  }
};

export default config;
