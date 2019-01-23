# hexo-shortid
Use [dylang/shortid](https://github.com/dylang/shortid) to generate abbreviated post links.

In addition to ID generation, the plugin also ensures the uniqueness of post IDs.

## COnfiguration
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
