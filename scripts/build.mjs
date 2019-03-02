#!/usr/bin/env node --experimental-modules --no-warnings

import fs from 'fs';

const { readFile, writeFile } = fs.promises;

(async () => {
    try {
        fs.createReadStream('./src/common.mjs').pipe(fs.createWriteStream('./lib/common.mjs'));

        const content = await readFile('./src/async-iter.mjs', 'utf8');

        let c = content;
        c = c.replace(/async function/g, 'function');
        c = c.replace(/for await/g, 'for');
        c = c.replace(/await\s+/g, '');
        c = c.replace(/Symbol\.asyncIterator/g, 'Symbol.iterator');
        c = c.replace(/Promise\.all\((.*)\)/g, '$1');
        c = c.replace(/asyncTee/g, 'tee');
        c = c.replace(/asyncTeeN/g, 'teeN');

        await Promise.all([
            writeFile('./lib/async-iter.mjs', content, 'utf8'),
            writeFile('./lib/iter.mjs', c, 'utf8'),
        ]);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
