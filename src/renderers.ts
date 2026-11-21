import { instance } from '@viz-js/viz';
import * as nomnoml from 'nomnoml';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import * as vegaInterpreter from 'vega-interpreter';
import * as WaveDrom from 'wavedrom';
import JSON5 from 'json5';
import * as bitfield from 'bit-field';
import loadPikchr from 'pikchr-js';
import { D2, type CompileOptions } from '@terrastruct/d2';
import initLini, * as lini from 'lini-wasm/web';
import liniWasm from 'lini-wasm/lini_wasm_bg.wasm';

// Reject external data while leaving the host webview's networking APIs alone.
const offlineLoader = {
  ...vega.loader(),
  load: async (): Promise<string> => { throw new Error('External Vega data is disabled for local rendering.'); },
  sanitize: async (): Promise<never> => { throw new Error('External Vega resources are disabled for local rendering.'); }
};

let graphviz: ReturnType<typeof instance> | undefined;
let pikchr: ReturnType<typeof loadPikchr> | undefined;

let d2: D2 | undefined;
let liniReady: Promise<typeof lini> | undefined;

export const libraries = {
  d2: async (source: string, options: CompileOptions): Promise<string> => {
    d2 ??= new D2();
    const result = await d2.compile({ fs: { index: source }, options });
    const svg = await d2.render(result.diagram, result.renderOptions);
    // Do not insert resources that could trigger browser image requests.
    if (/<image\b/i.test(svg)) {
      throw new Error('D2 image nodes are not supported for local embedded rendering.');
    }
    return svg;
  },
  loadLini: (): Promise<typeof lini> => {
    liniReady ??= initLini({ module_or_path: liniWasm }).then(() => lini);
    return liniReady;
  },
  nomnoml,
  vega: { ...vega, View: class extends vega.View {
    constructor(runtime: vega.Runtime, options: vega.ViewOptions) {
      super(runtime, { ...options, loader: offlineLoader });
    }
  } },
  vegaLite,
  vegaInterpreter,
  WaveDrom,
  JSON5,
  bitfield,
  graphviz: async (source: string): Promise<string> => {
    graphviz ??= instance();
    return (await graphviz).renderString(source, { format: 'svg' });
  },
  pikchr: async (source: string): Promise<string> => {
    pikchr ??= loadPikchr();
    return (await pikchr)(source);
  }
};

export function prepareWaveDrom(): void {
  (window as Window & { WaveSkin?: unknown }).WaveSkin = WaveDrom.waveSkin;
}

export const LOCAL_DIAGRAM_NAMES = new Set([
  'graphviz', 'nomnoml', 'vega', 'vegalite',
  'wavedrom', 'bytefield', 'pikchr', 'dot', 'd2', 'lini'
]);
