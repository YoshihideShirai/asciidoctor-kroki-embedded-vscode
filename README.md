# Asciidoctor Kroki Embedded Helper

[日本語](README.ja.md)

Asciidoctor Kroki Embedded Helper is a VS Code extension that registers [`asciidoctor-kroki-embedded`](https://github.com/YoshihideShirai/asciidoctor-kroki-embedded) with `asciidoctor-vscode` preview and export workflows.

It recognizes Kroki-compatible diagram blocks and block macros, then emits embedded local-rendering targets instead of Kroki server image URLs. The extension follows the same integration style as `asciidoctor-numbered-captions-vscode`: it does not generate `.asciidoctor/lib/*.js` helper files in your workspace.

## Features

- Registers `asciidoctor-kroki-embedded` automatically for AsciiDoc preview and export, excluding Mermaid diagrams.
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

## Settings

You can configure the extension from VS Code settings.

| Setting | Default | Description |
| --- | --- | --- |
| `asciidoctorKrokiEmbedded.defaultFormat` | `svg` | Default diagram format passed to `asciidoctor-kroki-embedded`. |
| `asciidoctorKrokiEmbedded.diagramNames` | `[]` | Diagram block and macro names to register. Leave empty to use the package defaults except Mermaid. Mermaid is always excluded. |

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

Check `asciidoctorKrokiEmbedded.diagramNames`. If it is empty, the package defaults are used except Mermaid. If it contains values, only those diagram names are registered, with Mermaid still excluded.

### A local diagram macro fails

Use a relative path under the AsciiDoc document directory, for example `plantuml::diagrams/sequence.puml[]`. Remote URLs, absolute paths, and paths outside the document directory are intentionally rejected.

## Feedback

Please open an issue in the project repository for bug reports, feature requests, or documentation improvements.
