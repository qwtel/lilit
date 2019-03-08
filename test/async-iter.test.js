const assert = require('assert');

const lilit = require('../cjs/async-iter');
const { isAsyncIterator } = require('../cjs/common');

describe('async iter', () => {
  async function* xs() {
    yield 1;
    yield 2;
    yield 3;
  }

  async function toArray(xs) {
    let arr = [];
    for await (const x of xs) arr.push(x);
    return arr;
  }

  describe('map', () => {
    it('should map values', async () => {
      const expect = [2, 3, 4];
      const actual = lilit.map(x => x + 1)(xs());
      assert.deepEqual(expect, await toArray(actual));
    });
  });

  // TODO
});
