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

declare module 'wavedrom';
declare module 'bit-field';

declare module '*.wasm' {
  const bytes: Uint8Array;
  export default bytes;
}
