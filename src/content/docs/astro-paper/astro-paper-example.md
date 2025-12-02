---
title: Astro-Paper 简要配置
---


## 坑点避雷

**tina cms 教程与实际配置不一致**

* token、id 改名
* github pages 部署存在故障

连官方自己的 action 部署都出问题，直接不用了。

**npm 依赖报错**

处理办法：

1. 删除 node_modules、package-lock.json、`npm cache clean --force && npm install`
2. [withastro/astro#6830](https://github.com/withastro/astro/issues/6830)
3. 创建 `.noJekyll`

**时区问题**

npm dev 文章正常显示，但 build + http server 文章却没有按预期显示的原因：当 dev 状态的时候，不检查后面，如果是 build 状态就要检查发布时间了。

时间格式参考：

- 2025-11-24 23:13:43+08:00
- 2025-03-20T03:15:57.792Z

注意检查主题有关于配置时间、时区的配置文件。

**GitHub Action 自动化部署报错解决办法**

根目录创建 `.nojekyll` 文件，并 `.github\workflows\deploy.yml`


```yml
name: GitHub Pages Astro CI

on:
  # 每次推送到 `main` 分支时触发这个“工作流程”
  push:
    branches: [ main ]
  # 允许你在 GitHub 上的 Actions 标签中手动触发此“工作流程”
  workflow_dispatch:
  
# 允许 job 克隆 repo 并创建一个 page deployment
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v5  # 更新为最新的 withastro action 版本

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4  # 已是 v4 版本，确保版本匹配
```

pnpm 更新：`pnpm install --frozen-lockfile`



**AstroPaper缓存策略与性能调优**

见文章：https://blog.csdn.net/gitblog_00680/article/details/152506722

## 简要配置定位

* `\src\config.ts` 博客资料页修改
* `\src\pages\index.astro` 欢迎页修改
* `\src\constants.ts` 社交链接修改
* `src\pages\about.md` 关于
* `src\components\Header.astro` 头部
* `\src\components\Footer.astro` 页脚信息

Github Pages 部署可省略根目录文件：

* `.dockerignore`
* `Dockerfile`
* `docker-compose.yml`
* `.prettierignore`
* `.prettierrc.mjs`
* `cz.yaml`


对生成的静态部署文件进行 http 部署调试：

```
npm run build
cd dist/
http-server -p 4000
```

## URL 固定

固定 URL 效果是文章移动到任意文件夹都保持固定链接形式： `localhost:4321/posts/{slug}`

使用方式，全文替换如下文件

```astro title=\src\pages\posts\[...slug]\index.astro
---
import { getCollection } from "astro:content";
import PostDetails from "@/layouts/PostDetails.astro";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
export async function getStaticPaths() {
const posts = await getCollection("blog", ({ data }) => !data.draft);  // 获取所有非草稿文章
const postResult = posts.map(post => ({
params: { slug: getPath(post.id, post.filePath, false) },  // 使用 getPath 生成路径
props: { post },
}));
return postResult;
}
const { post } = Astro.props;
const posts = await getCollection("blog");
const sortedPosts = getSortedPosts(posts);
// 渲染 PostDetails 组件，显示当前文章和排序后的所有文章
<PostDetails post={post} posts={sortedPosts} />
```


```ts title="\src\utils\getPath.ts"
import { slugifyStr } from "./slugify";  // 引入 slugify 工具
// 生成文章的 URL 路径
export function getPath(id: string, filePath: string | undefined, includeBase = true) {
// 使用 slugifyStr 生成符合 URL 格式的 slug
const slug = slugifyStr(id);  // 使用 id 生成 slug，确保符合 URL 格式
console.log(filePath);  // 这样使用后，警告就会消失
// 仅返回 slug，生成固定路径
return includeBase ? </span><span class="token string">/posts/</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>slug<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string"> : slug;
}
```

补充：astro 5.0新特性：

https://blog.csdn.net/gitblog_00592/article/details/152524702


## 字体修改

当前发现适配中文字体： 苹方SC字体

字体修改：

- 字体分包工具：https://chinese-font.netlify.app/zh-cn/online-split
- 字体cdn：https://chinese-font.netlify.app/zh-cn/cdn/

```css
\src\styles\global.css
:root {
--font-mono: 'JetBrains Mono', 'JetBrainsMono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
--font-cn: 'LXGW WenKai GB', 'Microsoft YaHei', 'PingFang SC', 'WenQuanYi Micro Hei', sans-serif;
}
h1, h2, h3, h4, h5, h6,span,figcaption,div{font-family: 'LXGW WenKai GB', sans-serif;}
li{font-family: 'JetBrains Mono', sans-serif;}
p {font-family: 'LXGW WenKai GB', sans-serif;font-size: 18px;}
/* 博客标题字体 */
a.absolute {
font-size: 22px;  
font-family: lxgw wenkai, sans-serif; 
}
```

## 公式支持

https://astro-paper.pages.dev/posts/how-to-add-latex-equations-in-blog-posts/

## 文章过期提示



创建 \src\components\ExpiredBanner.astro 文件，复制如下代码

```astro
---
const { pubDatetime, expiryDays = 30 } = Astro.props;
const now = new Date();
const pubDate = new Date(pubDatetime);

// 计算整数天数
const daysDiff = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));

// 是否过期
const isExpired = daysDiff > expiryDays;
---

{isExpired && (
  <div class="expired-banner">
    本文发布于 {pubDate.toLocaleDateString()}，距今已过去 {daysDiff} 天，内容可能已过期。
  </div>
)}

<style> 
.expired-banner {
  background-color: #ffcc00; /* 黄色背景 */
  color: #333; /* 深色文字 */
  font-size: 1rem;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #e6a800; /* 深黄色边框 */
  text-align: center;
  font-weight: bold;
  margin-top: 20px;
}
</style>
```



在 mdx 文件引入。需开启mdx支持：

* [astro - extending-markdown-config-from-mdx](https://docs.astro.build/en/guides/markdown-content/#extending-markdown-config-from-mdx)
* [astro -using-mdx-with-content-collections](https://docs.astro.build/en/guides/integrations-guide/mdx/#using-mdx-with-content-collections)

```md
---
title: 'asdfdg'
description: 'asdasd'
pubDatetime: 2025-06-01T00:00:00Z
slug: "20250601190253"  
---
我的文章标题
这是文章的内容……
import ExpiredBanner from '@/components/ExpiredBanner.astro'

<ExpiredBanner pubDatetime={frontmatter.pubDatetime} expiryDays={30} />
```


## 图标修改

`\src\constants.ts` 社交链接修改

图标网站：

* https://icon-sets.iconify.design
* https://icones.js.org
* https://remixicon.com

## Giscus 评论

[为你的 Astro 博客添加评论功能](https://liruifengv.com/posts/add-comments-to-astro/) + [how-to-integrate-giscus-comments](https://astro-paper.pages.dev/posts/how-to-integrate-giscus-comments/)


## JS 插入

`\src\layouts\Layout.astro`

```js
<script is:inline defer src="https://cloud.umami.is/script.js" data-website-id="e8dda199-cdc2-4bb5-8aeb-1a6bd156ada7"></script>
```

## PageCMS 配置

https://app.pagescms.org/

在设置里，复制如下代码

```yml
media:
  input: public
  output: /
content:
  - name: posts
    label: Posts
    type: collection
    path: src/data/blog
    view:
      fields: [ title, draft, date ]
    fields:
      - { name: author, label: Author, type: string }
      - { name: pubDatetime, label: Date, type: date }
      - { name: modDatetime, label: Date, type: date }
      - { name: title, label: Title, type: string, required: true }
      - { name: ogImage, label: Title, type: string }
      - { name: slug, label: Slug, type: string }
      - { name: featured, label: Featured, type: boolean }
      - { name: draft, label: Draft, type: boolean }
      - { name: tags, label: Tags, type: string, list: true }
      - { name: description, label: Description, type: string }
      - { name: body, label: Body, type: rich-text }
  - name: about
    label: About page
    type: file
    path: src/pages/about.md
    fields:
      - { name: layout, type: string, hidden: true, default: "../layouts/AboutLayout.astro" }
      - { name: title, label: Title, type: string }
      - { name: body, label: Body, type: rich-text, options: { input: public/assets, output: /assets } }
```

## 视频适配

`\src\styles\global.css`

```css title="\src\styles\global.css"
/* 响应式视频容器 */
.video-container {
    position: relative;
    width: 100%;
    height: 0;
    /* padding-bottom: 75%;   */
    padding-bottom: 56.25%; 
}

.video-container iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border: 0;
}
```


## 文章加密

***感谢：[zxc7563598](https://github.com/zxc7563598) 的帮助，以及原文章 [mmf.moe - blog-02-password](https://blog.mmf.moe/post/blog-02-password/)，才能顺利使用 astro-paper 加密效果。使用方式：创建对应文件，全文复制粘贴。***


### 创建 Encrypt.astro

`/src/components/Encrypt.astro`

```astro title="/src/components/Encrypt.astro"
---
import { encrypt } from "@/utils/encrypt";

export interface Props {
  password: string;
}

const html = await Astro.slots.render("default");
const encryptedHtml = await encrypt(html, Astro.props.password);
---

<meta name="encrypted" content={encryptedHtml} />

<div>
  <input
    id="password"
    class="border-skin-fill border-opacity-40 bg-skin-fill text-skin-base placeholder:text-opacity-75 focus:border-skin-accent w-auto rounded border p-2 placeholder:italic focus:outline-none"
    placeholder="请输入密码"
    type="text"
    autocomplete="off"
    autofocus
  />
  <button
    id="password-btn"
    class="bg-skin-full border-skin-fill border-opacity-50 text-skin-base hover:border-skin-accent rounded-md border p-2"
  >
    确认
  </button>
  <!-- 错误提示元素 -->
  <div id="error-message" class="text-red-600 hidden">
    密码错误，请重新输入。
  </div>
</div>

<script is:inline data-astro-rerun>
  /**
   * 异步解密函数
   *
   * @param data Base64 加密字符串
   * @param key 密码
   *
   * @returns 解密后的明文字符串
   */
  async function decrypt(data, key) {
    key = key.padEnd(16, "0"); // AES-CBC key 补齐 16 字节
    const dataBuffer = new Uint8Array(
      atob(data)
        .split("")
        .map(c => c.charCodeAt(0))
    );
    const keyBuffer = new TextEncoder().encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-CBC", length: 256 },
      false,
      ["decrypt"]
    );
    const iv = dataBuffer.slice(0, 16);
    const encryptedData = dataBuffer.slice(16);
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      encryptedData
    );
    return new TextDecoder().decode(new Uint8Array(decryptedData));
  }

  /**
   * 初始化页面解密逻辑
   */
  function prepare() {
    const encrypted = document
      .querySelector("meta[name=encrypted]")?.getAttribute("content");
    const input = document.getElementById("password");
    const btn = document.getElementById("password-btn");
    const article = document.querySelector("#encryption");
    const key = window.location.pathname;
    const errorMessage = document.getElementById("error-message");

    btn?.addEventListener("click", async () => {
      const password = input.value;
      try {
        const html = await decrypt(encrypted, password);
        article.innerHTML = html;
        setItemWithExpire(key, password, 86400);
      } catch {
        if (errorMessage) {
          errorMessage.classList.remove("hidden"); // 显示错误消息
        }
      }
    });

    const savedPassword = getItemWithExpire(key);
    if (savedPassword) {
      input.value = savedPassword;
      btn?.click();
    }
  }

  function setItemWithExpire(key, value, ttl) {
    const item = { value: value, expire: new Date().getTime() + ttl * 1000 };
    localStorage.setItem(key, JSON.stringify(item));
  }

  function getItemWithExpire(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (new Date().getTime() > item.expire) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  prepare();

  document.addEventListener("astro:after-swap", prepare);
</script>
```

### 创建 PasswordWrapper.astro

`\src\components\PasswordWrapper.astro`

```astro title="/src/components/PasswordWrapper.astro"
---
import Encrypt from "./Encrypt.astro";

export interface Props {
  password?: string;
}

const password = Astro.props.password;
---

{
  !password ? (
    <slot />
  ) : (
    <Encrypt password={password}>
      <slot />
    </Encrypt>
  )
}
```

### 创建 encrypt.ts

`/src/utils/encrypt.ts`

```js title="/src/utils/encrypt.ts" showNumbers
/**
 * 异步加密函数
 *
 * @param data 要加密的字符串
 * @param key 密码
 *
 * @returns 加密后的 Base64 字符串
 */
export async function encrypt(data: string, key: string): Promise<string> {
  // AES-CBC 要求 key 长度至少 16 字节，不够用 '0' 补齐
  key = key.padEnd(16, "0");
  // 将字符串编码为 Uint8Array
  const dataBuffer = new TextEncoder().encode(data);
  const keyBuffer = new TextEncoder().encode(key);
  // 导入 key，生成加密用的 CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"]
  );
  // 生成随机 16 字节 IV
  const iv = crypto.getRandomValues(new Uint8Array(16));
  // 加密
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    dataBuffer
  );
  // 将 IV 和密文组合，前 16 字节为 IV
  const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedData.set(iv);
  combinedData.set(new Uint8Array(encryptedData), iv.length);
  // 转成 Base64 字符串返回
  return uint8ToBase64(combinedData);
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

### 修改content.config.ts 

`\src\content.config.ts`

```ts title="/src/content.config.ts" showNumbers ins={23} collapse={12-21}

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
            pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      password: z.string().optional(),  
    }),
});

export const collections = { blog };

```

## Astro 扩展插件

- astro umami 统计：https://github.com/yeskunall/astro-umami
- astro markdown 外链：https://odhyp.com/astro-opening-external-links
