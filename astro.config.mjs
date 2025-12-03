// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from "rehype-external-links";
import markdoc from '@astrojs/markdoc';
import starlightImageZoom from 'starlight-image-zoom'

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
        plugins: [starlightImageZoom()],
        title: 'My Docs',
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
                label: 'Astro-Starlight',
                items: [
                    // Each item here is one entry in the navigation menu.
                    { label: 'Astro-Starlight 简要配置', slug: 'astro-starlight/astro-starlight-example' },
                    { label: 'Astro-Starlight 写作脚本', slug: '20251202175510' },
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
                ],
            },
        ],
        }), markdoc()],
});


