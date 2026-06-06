declare module "html-minifier-terser" {
  export interface MinifyOptions {
    collapseWhitespace?: boolean;
    conservativeCollapse?: boolean;
    minifyCSS?: boolean;
    removeComments?: boolean;
    sortAttributes?: boolean;
    sortClassName?: boolean;
  }

  export function minify(
    content: string,
    options?: MinifyOptions
  ): Promise<string>;
}

declare module "@11ty/eleventy" {
  export interface TransformContext {
    page: {
      outputPath?: string;
    };
  }

  export interface UserConfig {
    setLibrary(name: string, library: unknown): void;
    addGlobalData(name: string, value: unknown): void;
    addFilter(name: string, callback: (...args: any[]) => unknown): void;
    addShortcode(name: string, callback: (...args: any[]) => unknown): void;
    addPassthroughCopy(paths: Record<string, string>): void;
    addWatchTarget(path: string): void;
    addTransform(
      name: string,
      callback: (
        this: TransformContext,
        content: string
      ) => string | Promise<string>
    ): void;
  }
}
