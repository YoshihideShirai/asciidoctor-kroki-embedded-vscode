import { hydrateEmbeddedDiagrams } from 'asciidoctor-kroki-embedded/browser';
import { libraries, prepareWaveDrom } from './renderers';

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
