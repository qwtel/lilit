#!/usr/bin/env node --experimental-modules --no-warnings

import fs from 'fs';

const { readFile, writeFile } = fs.promises;

const WARNING = `
// THIS FILE IS AUTO-GENEREATED! DO NOT MODIFY DIRECTLY!
//
// To edit this file, edit 'async-iter.js' and run 'npm run build:pre'.

`;

(async () => {
  try {
    const content = await readFile('./src/async-iter.ts', 'utf8');

    let c = content;

    c = c.replace(/async function/g, 'function');
    c = c.replace(/(?!for )await\s+/g, '');
    c = c.replace(/for await/g, 'for');
    c = c.replace(/Promise\.all\((.*)\)/g, '$1');
    // c = c.replace(/async function/g, '/*async*/ function');
    // c = c.replace(/(?!for )await\s+/g, '/*await*/ ');
    // c = c.replace(/for await/g, 'for /*await*/');
    // c = c.replace(/Promise\.all\((.*)\)/g, '/*Promise.all(*/ $1 /*)*/');

    c = c.replace(/Symbol\.asyncIterator/g, 'Symbol.iterator');
    c = c.replace(/asyncTee/g, 'tee');
    c = c.replace(/asyncTeeN/g, 'teeN');
    c = c.replace(/forAwaitableIterator/g, 'iterator');

    // TS stuff
    c = c.replace("import { ForOfAwaitable } from './common';", '');
    c = c.replace(/ForOfAwaitable/g, 'Iterable');
    c = c.replace(/ForOfAwaitableIterator/g, 'Iterator');
    c = c.replace(/AsyncIterable/g, 'Iterable');
    c = c.replace(/AsyncIterableIterator/g, 'IterableIterator');
    c = c.replace(/Promise\<(.*)\>/g, '$1');

    c = WARNING.trimLeft() + c;

    await writeFile('./src/iter.ts', c, 'utf8'),

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
