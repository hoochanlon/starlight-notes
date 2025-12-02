import { 
  latte, frappe, macchiato, mocha 
} from '@catppuccin/vscode'

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  plugins: [
    pluginLineNumbers(),
    pluginCollapsibleSections()
  ],

  // 同时指定亮色和暗色主题（顺序很重要：light, dark）
  themes: [latte, mocha],           // 最常用：latte（亮） + mocha（暗）
  // 或者你喜欢其他暗色口味：
  // themes: [latte, frappe],
  // themes: [latte, macchiato],

  // 可选：如果你想让 Shiki 也用同样的主题（推荐）
  themeCssSelector: (theme) => theme.type === 'dark' ? '[data-theme="dark"]' : '[data-theme="light"]',

  styleOverrides: {
    // 这里可以微调边框、代码文字大小等
    borderRadius: '0.5rem',
    codeFontSize: '0.95rem',
    // ...
  },
})