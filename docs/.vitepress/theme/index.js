import DefaultTheme from 'vitepress/theme';
import { ElementPlusContainer } from '@vitepress-demo-preview/component';
import '@vitepress-demo-preview/component/dist/style.css';

export default {
  ...DefaultTheme,
  async enhanceApp({ app }) {
    app.component('demo-preview', ElementPlusContainer);

    if (!import.meta.env.SSR) {
      const plugin = await import('../../../src/index');
      app.provide('Sortable', plugin.default);
    }
  },
};
