import DefaultTheme from 'vitepress/theme';
import { ElementPlusContainer } from '@vitepress-demo-preview/component';
import '@vitepress-demo-preview/component/dist/style.css';

export default {
  ...DefaultTheme,
  async enhanceApp({ app }) {
    app.component('demo-preview', ElementPlusContainer);
  },
};
