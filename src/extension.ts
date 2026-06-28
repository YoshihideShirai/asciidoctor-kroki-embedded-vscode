import * as vscode from 'vscode';

const COMMAND_PREVIEW = 'asciidoctorKrokiEmbedded.showPreview';
const ASCIIDOCTOR_VSCODE_EXTENSION_ID = 'asciidoctor.asciidoctor-vscode';
const ASCIIDOCTOR_PREVIEW_TO_SIDE_COMMAND = 'asciidoc.showPreviewToSide';

export interface KrokiEmbeddedOptions {
  defaultFormat: string;
  diagramNames?: string[];
}

type AsciidoctorProcessingMode = 'preview' | 'export' | 'load';

interface AsciidoctorExtensionContext {
  readonly mode: AsciidoctorProcessingMode;
  readonly documentUri?: vscode.Uri;
}

interface AsciidoctorVscodeApi {
  registerAsciidoctorExtensions(registry: any, context: AsciidoctorExtensionContext): void | Promise<void>;
}

interface KrokiEmbeddedModule {
  register?: (registry: any, options?: KrokiEmbeddedOptions) => any;
  DEFAULT_DIAGRAM_NAMES?: string[];
  default?: {
    register?: (registry: any, options?: KrokiEmbeddedOptions) => any;
  };
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const krokiEmbedded = require('asciidoctor-kroki-embedded') as KrokiEmbeddedModule;
const EXCLUDED_DIAGRAM_NAMES = new Set(['mermaid']);

function getDefaultDiagramNames(): string[] {
  if (!Array.isArray(krokiEmbedded.DEFAULT_DIAGRAM_NAMES)) {
    return [];
  }

  return krokiEmbedded.DEFAULT_DIAGRAM_NAMES.filter((name) => !EXCLUDED_DIAGRAM_NAMES.has(name.toLowerCase()));
}

function normalizeDiagramNames(diagramNames: string[]): string[] {
  const sourceDiagramNames = diagramNames.length > 0
    ? diagramNames
    : getDefaultDiagramNames();

  return sourceDiagramNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0 && !EXCLUDED_DIAGRAM_NAMES.has(name.toLowerCase()));
}

function getKrokiEmbeddedOptions(documentUri?: vscode.Uri): KrokiEmbeddedOptions {
  const cfg = vscode.workspace.getConfiguration('asciidoctorKrokiEmbedded', documentUri);
  const diagramNames = normalizeDiagramNames(cfg.get<string[]>('diagramNames', []));

  return {
    defaultFormat: cfg.get<string>('defaultFormat', 'svg'),
    diagramNames
  };
}

function registerKrokiEmbedded(registry: any, options: KrokiEmbeddedOptions): void {
  if (typeof krokiEmbedded.register === 'function') {
    krokiEmbedded.register(registry, options);
    return;
  }

  if (typeof krokiEmbedded.default?.register === 'function') {
    krokiEmbedded.default.register(registry, options);
    return;
  }

  throw new Error('Failed to load asciidoctor-kroki-embedded: unsupported module shape.');
}

export function activate(context: vscode.ExtensionContext): AsciidoctorVscodeApi {
  context.subscriptions.push(vscode.commands.registerCommand(COMMAND_PREVIEW, async () => {
    const asciidoctorVscode = vscode.extensions.getExtension(ASCIIDOCTOR_VSCODE_EXTENSION_ID);
    if (asciidoctorVscode === undefined) {
      void vscode.window.showErrorMessage('asciidoctor-vscode is not installed.');
      return;
    }

    await vscode.commands.executeCommand(ASCIIDOCTOR_PREVIEW_TO_SIDE_COMMAND);
  }));

  return {
    registerAsciidoctorExtensions(registry: any, asciidoctorContext: AsciidoctorExtensionContext): void {
      registerKrokiEmbedded(registry, getKrokiEmbeddedOptions(asciidoctorContext.documentUri));
    }
  };
}

export function deactivate(): void {
  // no-op
}
