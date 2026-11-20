// Leonida Trophy Guide — entrypoint. Copies app/ and screenshots/ into the
// output directory and writes dossier.json with the kit's buildDossier.
//
// The grader runs this as a non-root user (uid 65534) with the repository
// mounted read-only and the output directory mounted writable. So this file
// clears only the CONTENTS of the output directory: it deletes the files
// inside it, and it never deletes, renames or removes the directory itself.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Remove every entry inside `dir`, but never `dir` itself. Entries are
// removed one by one with rmSync on the child path, so the mounted output
// directory stays in place and still exists when we finish.
function clearContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    const child = join(dir, name);
    rmSync(child, { recursive: true, force: true });
  }
}

// Copy a whole directory tree (files and subdirectories) into the output.
function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) {
      copyTree(from, to);
    } else {
      cpSync(from, to);
    }
  }
}

// Hand the guide in: clear the output contents, copy app/ and screenshots/
// in, then write dossier.json. The dossier is deterministic: the same input
// files always produce the same bytes, so two runs write identical files.
function main(): void {
  clearContents(outDir);
  copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
  copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  // The output directory itself must still exist here: clearContents only
  // ever removed entries inside it, never the directory. Fail loudly if
  // that invariant ever breaks, instead of handing in a half-written entry.
  if (!existsSync(outDir)) throw new Error('output directory is gone after build: ' + outDir);
  console.log('wrote dossier.json (' + Buffer.byteLength(dossier) + ' bytes) to ' + outDir);
}

main();
