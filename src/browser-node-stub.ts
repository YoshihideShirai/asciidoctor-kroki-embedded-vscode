// Browser-only bundles never use the libraries' Node.js file-loading branches.
export function readFileSync(): never {
  throw new Error('Local file loading is unavailable in the preview.');
}
export function resolve(): never {
  throw new Error('Node.js path resolution is unavailable in the preview.');
}
