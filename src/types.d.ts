declare module '@plantuml/core' {
  export function renderToString(
    lines: string[],
    onSuccess: (svg: string) => void,
    onError: (message: string) => void
  ): void;
}

declare module '@plantuml/core/viz-global.js';

declare module 'asciidoctor-kroki-embedded/browser' {
  export function hydrateEmbeddedDiagrams(
    root?: Document | Element,
    options?: {
      renderers?: Record<string, ((args: any) => void | Promise<void>) | undefined>;
      libraries?: Record<string, unknown>;
      selector?: string;
    }
  ): Promise<unknown[]>;
}
