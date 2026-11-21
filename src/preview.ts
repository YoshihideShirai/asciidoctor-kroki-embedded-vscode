import { hydrateEmbeddedDiagrams } from 'asciidoctor-kroki-embedded/browser';
import { libraries, LOCAL_DIAGRAM_NAMES, prepareWaveDrom } from './renderers';

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
      prepareWaveDrom();
      for (const diagram of Array.from(document.querySelectorAll<HTMLElement>('.kroki-embedded[data-diagram-type]'))) {
        const type = diagram.dataset.diagramType!;
        if (type === 'plantuml' || type === 'mermaid' || LOCAL_DIAGRAM_NAMES.has(type) || diagram.classList.contains('kroki-embedded-failed')) {
          continue;
        }
        diagram.classList.add('kroki-embedded-failed');
        const output = diagram.querySelector('.kroki-embedded-output');
        if (output) output.textContent = `Local rendering is not supported for "${type}". No data was sent to a server.`;
      }
      await hydrateEmbeddedDiagrams(document, {
        selector: '.kroki-embedded[data-diagram-type]:not([data-diagram-type="mermaid"]):not([data-diagram-type="plantuml"]):not(.kroki-embedded-failed)',
        libraries,
        renderers: {
          mermaid: undefined,
          plantuml: undefined,
          c4plantuml: undefined,
          d2: undefined
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
