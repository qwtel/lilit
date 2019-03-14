import * as assert from 'assert';

import * as lilit from '../src/async-iter';
import { isAsyncIterator, ForOfAwaitable } from '../src/common';

async function equal(actual: any, expected: any) {
  const [a, e] = await Promise.all([actual, expected]);
  return assert.equal(a, e);
}

async function deepEqual(actual: any, expected: any) {
  const [a, e] = await Promise.all([actual, expected]);
  return assert.deepEqual(a, e);
}

async function toArray<X>(xs: ForOfAwaitable<X>): Promise<X[]> {
  let arr = [];
  for await (const x of xs) arr.push(x);
  return arr;
}

describe('async iter', async () => {
  async function* xs() {
    yield 1;
    yield 2;
    yield 3;
  }

  describe('map', () => {
    it('should map values', async () => {
      const expect = [2, 3, 4];
      const actual = lilit.map((x: number) => x + 1)(xs());
      return deepEqual(expect, toArray(actual));
    });
  });

  // TODO
});
