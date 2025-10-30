import { defineConfig } from 'vitepress';
import { componentPreview, containerPreview } from '@vitepress-demo-preview/plugin';

export default defineConfig({
  base: '/sortable-dnd/',
  lang: 'en-US',
  title: 'sortable-dnd',
  description: 'JS library for drag-and-drop lists, supports sortable and draggable',

  themeConfig: {
    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/mfuu/sortable-dnd' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2019-${new Date().getFullYear()} mfuu`,
    },

    nav: [
      {
        text: 'Guide',
        link: '/guide/install',
        activeMatch: '/guide/',
      },
      {
        text: 'Demo',
        link: '/demo/basic',
        activeMatch: '/demo/',
      },
    ],

    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          { text: 'Start', link: 'install' },
          { text: 'Options', link: 'options' },
          { text: 'Callback', link: 'callback' },
          { text: 'Methods', link: 'methods' },
          { text: 'Utils', link: 'utils' },
        ],
      },
      '/demo/': {
        base: '/demo/',
        items: [
          { text: 'Basic', link: 'basic' },
          { text: 'Handle', link: 'handle' },
          { text: 'Grid', link: 'grid' },
          { text: 'Group', link: 'group' },
          { text: 'Nested', link: 'nested' },
          { text: 'Multiple', link: 'multiple' },
        ],
      },
    },
  },
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code');
        },
      },
    ],
    config: (md) => {
      md.use(containerPreview);
      md.use(componentPreview);
    },
  },
});
