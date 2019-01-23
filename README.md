# hexo-shortid
Use [dylang/shortid](https://github.com/dylang/shortid) to generate abbreviated post links.

In addition to ID generation, the plugin also validates and ensures the uniqueness of post IDs among your posts.

## Configuration
```ts
interface HexoShortIdOptions {
  /**
   * @default false
   */
  autofix: boolean

  /**
   * @default Infinity
   */
  maxtry: number | "Infinity"
}
```
