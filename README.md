# hexo-nanoid
Use [ai/nanoid](https://github.com/ai/nanoid) to generate abbreviated post links.

[![Build Status](https://travis-ci.org/cowsay-blog/hexo-nanoid.svg?branch=master)](https://travis-ci.org/cowsay-blog/hexo-nanoid)
[![npm](https://img.shields.io/npm/dt/hexo-nanoid.svg)](https://www.npmjs.com/package/hexo-nanoid)
[![npm](https://img.shields.io/npm/v/hexo-nanoid.svg)](https://www.npmjs.com/package/hexo-nanoid)
[![license](https://img.shields.io/github/license/cowsay-blog/hexo-nanoid.svg)](https://github.com/cowsay-blog/hexo-nanoid#readme)
[![Gitmoji](https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square)](https://gitmoji.carloscuesta.me/)

## Features
- Compatible with `hexo new` to generate ID for new posts.
- ID validatation on existing posts to ensure the uniqueness.
- Autofixable post IDs.
- Event `nanoid:generate` is emitted after each ID generation.

## Configuration
The following list shows the descending precedence of config files. (The first one presented is used.)
- Key `nanoid` in `<hexo_root>/_config.yml`
- Key `theme_config.nanoid` in `<hexo_root>/_config.yml`
- Key `nanoid` in `<hexo_root>/themes/<theme_name>/_config.yml`
- [Inline default config](./lib/config.js#L3)

```ts
interface HexoNanoIdOptions {
  /**
   * Autofix invalid or conflicted IDs.
   * @default false
   */
  autofix: boolean

  /**
   * Max try to find an unique ID.
   * @default 10
   */
  maxtry: number | "Infinity"

  /**
   * Ensure the ID uniqueness when creating a new post,
   * which somewhat slow down the new post generation
   * since all posts will be loaded and validated.
   * 
   * The uniqueness of the new post ID is not guaranteed if this config is set to `false`.
   * Check https://zelark.github.io/nano-id-cc/ for more info about collision probability.
   * @default true
   */
  check_on_new: boolean

  /***********************************/
  /*** Configuring nanoid library ***/
  /***********************************/

  /**
   * @default 21
   */
  length: number

  /**
   * @default "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-"
   */
  characters?: string
}
```
