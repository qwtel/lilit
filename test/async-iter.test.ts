// import { equal, deepEqual } from 'assert';

// import * as lilit from '../src/async-iter';
// import { isAsyncIterator } from '../src/common';

// describe('async iter', () => {
//   async function* xs() {
//     yield 1;
//     yield 2;
//     yield 3;
//   }

//   async function toArray(xs) {
//     let arr = [];
//     for await (const x of xs) arr.push(x);
//     return arr;
//   }

//   describe('map', () => {
//     it('should map values', async () => {
//       const expect = [2, 3, 4];
//       const actual = lilit.map((x: number) => x + 1)(xs());
//       deepEqual(expect, await toArray(actual));
//     });
//   });

//   // TODO
// });
