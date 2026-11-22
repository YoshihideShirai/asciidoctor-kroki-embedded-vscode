# Asciidoctor Kroki Embedded Helper

[日本語](README.ja.md)

Asciidoctor Kroki Embedded Helper is a VS Code extension that registers [`asciidoctor-kroki-embedded`](https://github.com/YoshihideShirai/asciidoctor-kroki-embedded) with `asciidoctor-vscode` preview and export workflows.

It recognizes Kroki-compatible diagram blocks and block macros, then emits embedded local-rendering targets instead of Kroki server image URLs. The extension follows the same integration style as `asciidoctor-numbered-captions-vscode`: it does not generate `.asciidoctor/lib/*.js` helper files in your workspace.

## Features

- Registers `asciidoctor-kroki-embedded` automatically for AsciiDoc preview and export, with PlantUML and Mermaid rendered by the AsciiDoc extension.
- Supports Kroki-style diagram blocks such as `[plantuml]`, `[vega]`, `[wavedrom]`, `[graphviz]`, and many others handled by the package.
- Supports local diagram block macros such as `plantuml::diagrams/sequence.puml[]`.
- Keeps remote diagram macro targets, absolute paths, and path traversal outside the document directory disabled by the underlying package.
- Keeps your project clean by avoiding generated extension files in the workspace.

## Requirements

This extension does not provide an AsciiDoc previewer by itself. Install and enable the following VS Code extension first:

- [AsciiDoc](https://marketplace.visualstudio.com/items?itemName=asciidoctor.asciidoctor-vscode) (`asciidoctor.asciidoctor-vscode`)

If `asciidoctor-vscode` is not installed, the preview command shows an error message.

> [!IMPORTANT]
> This extension requires a version of `asciidoctor-vscode` that includes asciidoctor/asciidoctor-vscode#1035, which adds the `asciidoc.asciidoctorExtensions` contribution point and the `registerAsciidoctorExtensions(registry, context)` hook used by this extension. The pull request was merged on June 27, 2026. If the Marketplace version you have installed does not include that change yet, install a pre-release build or a build from `asciidoctor-vscode` main that contains the merge.

## Installation

Install `Asciidoctor Kroki Embedded Helper` from the VS Code Marketplace.

Alternatively, download the `.vsix` package from the GitHub Releases page and install it with `Extensions: Install from VSIX...` in VS Code.

After installation, open an AsciiDoc file. The extension activates automatically and registers the Kroki Embedded extension through the Asciidoctor extension hook provided by `asciidoctor-vscode`.

## Usage

1. Open an AsciiDoc file in VS Code.
2. Open the Command Palette.
3. Run `Asciidoctor Kroki Embedded: Open Preview`.
4. The `asciidoctor-vscode` preview opens to the side with Kroki-compatible diagram blocks registered.

The same configuration is also used by supported `asciidoctor-vscode` preview and export operations that load registered Asciidoctor extensions.

### Example

```adoc
= Sample Document
:kroki-default-format: svg

[graphviz]
----
digraph G {
  AsciiDoc -> "Embedded diagram target"
}
----

plantuml::diagrams/sequence.puml[]
```

## Diagram rendering

| Diagram | Support |
| --- | --- |
| Graphviz (`graphviz`, `dot`) | Local rendering |
| Nomnoml (`nomnoml`) | Local rendering |
| Vega / Vega-Lite (`vega`, `vegalite`) | Local rendering; external data and image URLs are blocked |
| WaveDrom (`wavedrom`) | Local rendering |
| Bytefield (`bytefield`) | Local rendering |
| Pikchr (`pikchr`) | Local rendering |
| Lini (`lini`) | Local rendering; image nodes are rejected |
| PlantUML / Mermaid (`plantuml`, `mermaid`) | Rendered by the AsciiDoc extension |
| D2 (`d2`) | **Unsupported; excluded from rendering** |
| `c4plantuml`, `seqdiag`, `blockdiag`, `erd`, `ditaa`, `svgbob`, `excalidraw`, and other formats | Local rendering is unsupported |

The preview host must permit WebAssembly for the bundled renderers that use it. Lini WASM is embedded in the preview bundle; no external download is required.

D2 is unsupported because its bundled layout engine requires `script-src 'unsafe-eval'` in addition to blob Web Workers. This extension does not request these CSP permissions or load the D2 engine.

Blocks for unsupported formats, including D2, are left unregistered and use the standard Asciidoctor.js source display. No source is sent to a Kroki server. This extension does not register PlantUML or Mermaid blocks or macros or hydrate their output. For Vega/Vega-Lite, embed data in the specification.

## Settings

You can configure the extension from VS Code settings.

| Setting | Default | Description |
| --- | --- | --- |
| `asciidoctorKrokiEmbedded.defaultFormat` | `svg` | Default diagram format passed to `asciidoctor-kroki-embedded`. |
| `asciidoctorKrokiEmbedded.diagramNames` | `[]` | Diagram block and macro names to register. Leave empty to use locally supported formats from the package defaults. Unsupported formats, PlantUML, and Mermaid are always excluded. |

### Example `settings.json`

```json
{
  "asciidoctorKrokiEmbedded.defaultFormat": "svg",
  "asciidoctorKrokiEmbedded.diagramNames": [
    "plantuml",
    "graphviz"
  ]
}
```

## Notes

- This extension is designed to work with `asciidoctor-vscode`.
- Diagram registration is provided by `asciidoctor-kroki-embedded`.
- The generated HTML contains embedded diagram targets. Local hydration/rendering support depends on the preview host.

## Troubleshooting

### Preview does not open

Make sure `asciidoctor-vscode` is installed and enabled.

### Diagram syntax is not recognized

Check `asciidoctorKrokiEmbedded.diagramNames`. If it is empty, only locally supported package defaults are used. If it contains values, only those diagram names are registered, with unsupported formats, PlantUML, and Mermaid still excluded.

### A local diagram macro fails

Use a relative path under the AsciiDoc document directory, for example `plantuml::diagrams/sequence.puml[]`. Remote URLs, absolute paths, and paths outside the document directory are intentionally rejected.

## Development and debugging

1. Open this repository in VS Code and run `npm ci` in the terminal.
2. Install and enable the AsciiDoc extension described in Requirements. For WSL, SSH, or Dev Containers, install it in the remote environment as well.
3. Set a breakpoint in `src/extension.ts`, select `Run Extension` in Run and Debug, and press **F5**. Type checking and bundling run before the Extension Development Host opens.
4. Open `examples/test.adoc` in the new window and run `Asciidoctor Kroki Embedded: Open Preview`.

The debug configuration opens `.vscode/debug.code-workspace` in a new window, with the entire repository as its folder. The dedicated workspace file gives the development window a separate identity from the editing folder. This allows the webview to load this extension's CSS and JavaScript from `dist` even if the installed AsciiDoc extension omits contributed resource directories from `localResourceRoots`. Opening only `examples` can cause diagram sources to appear instead. If this also occurs with a normally installed extension, the AsciiDoc extension needs a fix to allow contributed resource directories.

Source maps enable debugging the extension host using the TypeScript sources. After editing code, stop debugging and press F5 again to rebuild. Inspect browser-side code in `src/preview.ts` using `Developer: Open Webview Developer Tools` in the development window.

## CI and releases

The [CI and Release Package workflow](.github/workflows/release-package.yml) follows the [numbered captions extension's release workflow](https://github.com/YoshihideShirai/asciidoctor-numbered-captions-vscode/blob/main/.github/workflows/release-package.yml). Pull requests, pushes to `main`, and manual runs install dependencies, check types, build the extension, and upload a VSIX as the `vscode-extension-vsix` artifact. The workflow uses Node.js 22 and a pinned VSCE version; bundling runs through `vscode:prepublish`.

To release, update `version` in `package.json` and `package-lock.json`, commit the changes, and push a matching tag (for example, `v1.0.0` for version `1.0.0`). A tag push creates or updates the GitHub Release and attaches the checked VSIX. A mismatched tag fails before packaging. Manual runs only produce an artifact, including when a tag is selected.

GitHub Release uploads use the built-in `GITHUB_TOKEN`; no additional secret is required. Marketplace publication is a separate manual operation and is not part of this workflow.

## Feedback

Please open an issue in the project repository for bug reports, feature requests, or documentation improvements.
