#!/usr/bin/env node --experimental-modules --no-warnings

import fs from 'fs';
import { resolve, basename } from 'path';

const { readFile, writeFile, readdir, stat } = fs.promises;

async function* getFiles(dir) {
  const subdirs = await readdir(dir);
  for (const subdir of subdirs) {
    const res = resolve(dir, subdir);
    if ((await stat(res)).isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

const RE = /^[ \t]*(import|export)\s+(.*)\s+from\s+['"](.+)['"][ \t;]*$/gm;

(async () => {
  try {
    if (!fs.existsSync('./mjs')) fs.mkdirSync('./mjs');

    for await (const f of getFiles('./mjs')) {
      let c = await readFile(f, 'utf8');
      c = c.replace(RE, "$1 $2 from '$3.mjs';");
      await writeFile('./mjs/' + basename(f), c, 'utf8');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
