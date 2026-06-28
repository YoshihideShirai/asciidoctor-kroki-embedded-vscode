# Asciidoctor Kroki Embedded Helper

[English](README.md)

Asciidoctor Kroki Embedded Helper は、[`asciidoctor-kroki-embedded`](https://github.com/YoshihideShirai/asciidoctor-kroki-embedded) を `asciidoctor-vscode` のプレビューおよびエクスポート処理へ登録する VS Code 拡張です。

Kroki 互換の diagram ブロックとブロックマクロを認識し、Kroki サーバーの画像 URL ではなく、ローカル描画用の埋め込みターゲットを出力します。構成は `asciidoctor-numbered-captions-vscode` と同じ方式で、ワークスペース内に `.asciidoctor/lib/*.js` のような補助ファイルを生成しません。

## 機能

- AsciiDoc のプレビューとエクスポートで `asciidoctor-kroki-embedded` を自動登録します。
- `[mermaid]`、`[plantuml]`、`[vega]`、`[wavedrom]`、`[graphviz]` など、パッケージが扱う Kroki 形式の diagram ブロックをサポートします。
- `plantuml::diagrams/sequence.puml[]` のようなローカル diagram ブロックマクロをサポートします。
- リモート diagram マクロ、絶対パス、文書ディレクトリ外へのパストラバーサルは、元パッケージ側で無効化されます。
- ワークスペース内に拡張用の生成ファイルを作らないため、プロジェクトを clean に保てます。

## 必要な拡張

この拡張は単体では AsciiDoc プレビュー機能を提供しません。先に以下の VS Code 拡張をインストールして有効化してください。

- [AsciiDoc](https://marketplace.visualstudio.com/items?itemName=asciidoctor.asciidoctor-vscode) (`asciidoctor.asciidoctor-vscode`)

`asciidoctor-vscode` がインストールされていない場合、プレビューコマンドはエラーメッセージを表示します。

> [!IMPORTANT]
> この拡張は、asciidoctor/asciidoctor-vscode#1035 が取り込まれたバージョンの `asciidoctor-vscode` を必要とします。この PR により、本拡張が利用する `asciidoc.asciidoctorExtensions` contribution point と `registerAsciidoctorExtensions(registry, context)` フックが追加されています。この PR は 2026 年 6 月 27 日にマージされました。インストール済みの Marketplace 版にこの変更がまだ含まれていない場合は、この変更を含む `asciidoctor-vscode` のプレリリース版、または main ブランチ由来のビルドを利用してください。

## インストール

VS Code Marketplace から `Asciidoctor Kroki Embedded Helper` をインストールしてください。

または、GitHub Releases ページから `.vsix` パッケージをダウンロードし、VS Code の `Extensions: Install from VSIX...` でインストールできます。

インストール後、AsciiDoc ファイルを開くと拡張が自動的に有効化されます。その後、`asciidoctor-vscode` が提供する Asciidoctor 拡張フックを通じて、Kroki Embedded 拡張が登録されます。

## 使い方

1. VS Code で AsciiDoc ファイルを開きます。
2. コマンドパレットを開きます。
3. `Asciidoctor Kroki Embedded: Open Preview` を実行します。
4. `asciidoctor-vscode` のプレビューが横に開き、Kroki 互換の diagram ブロックが登録された状態で変換されます。

登録済みの Asciidoctor 拡張を読み込む `asciidoctor-vscode` のプレビューおよびエクスポート処理でも、同じ設定が利用されます。

### 例

```adoc
= サンプル文書
:kroki-default-format: svg

[mermaid]
----
graph TD
  A[AsciiDoc] --> B[埋め込み diagram ターゲット]
----

plantuml::diagrams/sequence.puml[]
```

## 設定

VS Code の設定から拡張の動作を変更できます。

| 設定 | 既定値 | 説明 |
| --- | --- | --- |
| `asciidoctorKrokiEmbedded.defaultFormat` | `svg` | `asciidoctor-kroki-embedded` に渡す既定の diagram format です。 |
| `asciidoctorKrokiEmbedded.diagramNames` | `[]` | 登録する diagram ブロック名とマクロ名です。空の場合はパッケージの既定値を使用します。 |

### `settings.json` の例

```json
{
  "asciidoctorKrokiEmbedded.defaultFormat": "svg",
  "asciidoctorKrokiEmbedded.diagramNames": [
    "mermaid",
    "plantuml",
    "graphviz"
  ]
}
```

## 注意事項

- この拡張は `asciidoctor-vscode` と連携して動作することを前提としています。
- diagram 登録の実処理は `asciidoctor-kroki-embedded` が提供します。
- 生成される HTML には埋め込み diagram ターゲットが含まれます。実際のローカル描画や hydration の対応状況は、プレビューを表示するホスト側に依存します。

## トラブルシューティング

### プレビューが開かない

`asciidoctor-vscode` がインストールされ、有効になっていることを確認してください。

### diagram 構文が認識されない

`asciidoctorKrokiEmbedded.diagramNames` を確認してください。空の場合はパッケージの既定値を使用します。値が入っている場合は、指定した diagram 名だけが登録されます。

### ローカル diagram マクロが失敗する

`plantuml::diagrams/sequence.puml[]` のように、AsciiDoc 文書ディレクトリ配下の相対パスを指定してください。リモート URL、絶対パス、文書ディレクトリ外へのパスは意図的に拒否されます。

## フィードバック

不具合報告、機能要望、ドキュメント改善の提案は、プロジェクトリポジトリの Issue へお寄せください。
