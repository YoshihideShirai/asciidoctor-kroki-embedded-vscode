import { renderToString } from '@plantuml/core';
import { hydrateEmbeddedDiagrams } from 'asciidoctor-kroki-embedded/browser';

declare global {
  interface Window {
    Viz?: unknown;
  }
}

type RenderArgs = {
  source: string;
  output: HTMLElement;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForViz(): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (window.Viz) {
      return;
    }
    await delay(100);
  }
  throw new Error('PlantUML Graphviz renderer is not available.');
}

function renderPlantUmlSvg(source: string): Promise<string> {
  return new Promise((resolve, reject) => {
    renderToString(
      source.split(/\r?\n/),
      resolve,
      (message: string) => reject(new Error(message))
    );
  });
}

async function renderPlantUml({ source, output }: RenderArgs): Promise<void> {
  await waitForViz();
  output.innerHTML = await renderPlantUmlSvg(source);
}

let hydrating = false;
let queued = false;

async function hydrate(): Promise<void> {
  if (hydrating) {
    queued = true;
    return;
  }

  hydrating = true;
  try {
    do {
      queued = false;
      await hydrateEmbeddedDiagrams(document, {
        selector: '.kroki-embedded[data-diagram-type]:not([data-diagram-type="mermaid"]):not(.kroki-embedded-failed)',
        renderers: {
          mermaid: undefined,
          plantuml: renderPlantUml,
          c4plantuml: renderPlantUml
        }
      });
    } while (queued);
  } finally {
    hydrating = false;
  }
}

function scheduleHydrate(): void {
  window.setTimeout(() => {
    void hydrate();
  }, 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleHydrate, { once: true });
} else {
  scheduleHydrate();
}

new MutationObserver(scheduleHydrate).observe(document.body, {
  childList: true,
  subtree: true
});
