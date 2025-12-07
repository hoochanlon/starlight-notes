// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from "rehype-external-links";
import markdoc from '@astrojs/markdoc';
import starlightImageZoom from 'starlight-image-zoom';
import starlightThemeGalaxy from 'starlight-theme-galaxy';
import starlightThemeRapide from 'starlight-theme-rapide';
import starlightThemeFlexoki from 'starlight-theme-flexoki';

// https://astro.build/config
export default defineConfig({
   site: 'https://hoochanlon.github.io',
   base: 'starlight-notes',
    markdown: {
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "\_blank",
            rel: ["noopener", "noreferrer", "external"],
          },
      ],
    ],
  },
    integrations: [expressiveCode(), starlight({
        plugins: [
          starlightImageZoom(),
          starlightThemeFlexoki(),
        ],
        title: 'My Docs',
        customCss: [
          // 你的自定义 CSS 文件的相对路径
          './src/styles/custom.css',
        ],
        locales: {
          root: {
            label: '简体中文',
            lang: 'zh-CN',
          },
      },
        social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hoochanlon' }],
        editLink: {
            baseUrl: 'https://github.com/hoochanlon/starlight-notes/edit/master',
        },
        sidebar: [
            {
                label: '欢迎',
                items: [
                    { label: '内容主页', slug: 'welcome' },
                ],
            },
            {
                label: 'Astro-Starlight',
                items: [
                    // Each item here is one entry in the navigation menu.
                    { label: 'Astro-Starlight 简要配置', slug: 'astro-starlight/astro-starlight-example' },
                    { label: 'Astro-Starlight 写作脚本', slug: 'astro-starlight/astro-starlight-scripts' },
                ],
            },
            {
                label: 'Astro-Paper',
                items: [
                    { label: 'Astro-Paper 简要配置', slug: 'astro-paper/astro-paper-example' },
                    { label: 'Astro-Paper 写作脚本', slug: 'astro-paper/astro-paper-scripts' },
                ],
            },
            {
                label: 'fumadocs',
                items: [
                    { label: 'fumadocs 简要配置', slug: 'fumadocs/fumadocs-example' },
                    { label: 'fumadocs 目录路由配置', slug: 'fumadocs/fumadocs-route' },
                    { label: 'fumadocs 本地搜索', slug: 'fumadocs/fumadocs-search' },
                ],
            },
        ],
        }), markdoc()],
});


