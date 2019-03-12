import { deepEqual, equal } from 'assert';

import * as lilit from '../src/iter';
import { isIterator } from '../src/common';

describe('iter', () => {
  function* count() {
    let i = 0;
    while (1) yield i++;
  }

  const xs = [1, 2, 3];

  describe('map', () => {
    it('should map values', () => {
      deepEqual([...lilit.map((x: number) => x + 1)(xs)], [2, 3, 4]);
    });
  });

  describe('tap', () => {
    let counter = 0;
    const incCounter = () => {
      counter++;
    };
    const res = lilit.tap(incCounter)(xs);

    it('should return another iterator', () => {
      equal(isIterator(res), true);
    });

    it('should return the same elements', () => {
      deepEqual([...res], [1, 2, 3]);
    });

    it('should call the provided function', () => {
      equal(counter, 3);
    });

    it('should alias to inspect', () => equal(lilit.tap, lilit.inspect));
  });

  describe('forEach', () => {
    let counter = 0;
    const incCounter = () => {
      counter++;
    };
    const iter = xs[Symbol.iterator]();
    const res = lilit.forEach(incCounter)(iter);

    it('should consume the provided iterator', () => {
      deepEqual(iter.next(), { done: true, value: undefined });
    });

    it('should call the provided function', () => {
      equal(counter, 3);
    });

    it('should return undefined', () => {
      equal(res, undefined);
    });

    it('should alias to subscribe', () => equal(lilit.forEach, lilit.subscribe));
  });

  describe('reduce', () => {
    it('should reduce', () => {
      const expect = 6;
      const actual = lilit.reduce((a, b: number) => a + b, 0)(xs);
      equal(actual, expect);
    });
  });

  describe('scan', () => {
    it('should be like reduce, but emit each intermediate value', () => {
      const expect = [1, 3, 6]
      const actual = [...lilit.scan((a, b: number) => a + b, 0)(xs)];
      deepEqual(actual, expect);
    });

    it('should alias to reductions', () => equal(lilit.scan, lilit.reducutions));
  });

  describe('some', () => {
    it('should behave like some', () => {
      equal(lilit.some(x => x === 2)(xs), true);
      equal(lilit.some(x => x === 5)(xs), false);
    });

    it('should return false when empty', () => {
      equal(lilit.some(x => x === 2)([]), false);
    });

    it('should stop consuming the iterator when condition is met', () => {
      const xit = xs[Symbol.iterator]();
      lilit.some(x => x === 2)(xit);
      deepEqual(xit.next(), { done: false, value: 3 });
    });
  });

  describe('every', () => {
    it('should behave like every', () => {
      equal(lilit.every(x => x < 10)(xs), true);
      equal(lilit.every(x => x === 2)(xs), false);
    });

    it('should return true when empty', () => {
      equal(lilit.every(x => x === 2)([]), true);
    });

    it('should stop consuming the iterator when condition is violated', () => {
      const xit = xs[Symbol.iterator]();
      lilit.every(x => x < 2)(xit);
      deepEqual(xit.next(), { done: false, value: 3 });
    });
  });

  describe('filter', () => {
    it('should filter', () => {
      deepEqual([...lilit.filter((x: number) => x % 2 === 1)(xs)], [1, 3]);
    });
  });

  describe('partition', () => {
    it('should partition', () => {
      const [odd, even] = lilit.partition((x: number) => x % 2 === 1)(xs);
      deepEqual([...odd], [1, 3]);
      deepEqual([...even], [2]);
    });

    it("should return an empty iterator when condition isn't met", () => {
      const [met, unmet] = lilit.partition(x => x < 10)(xs);
      deepEqual([...met], [1, 2, 3]);
      deepEqual([...unmet], []);
    });
  });

  describe('skip', () => {
    it('should skip', () => {
      deepEqual([...lilit.skip(1)(xs)], [2, 3]);
    });
  });

  describe('take', () => {
    it('should take', () => {
      deepEqual([...lilit.take(2)(xs)], [1, 2]);
    });

    it('should end inifite iterators', () => {
      deepEqual([...lilit.take(3)(count())], [0, 1, 2]);
    });
  });

  describe('partitionAt', () => {
    it('should take n and skip n', () => {
      const [xs1, xs2] = lilit.partitionAt(1)(xs);
      deepEqual([...xs1], [1]);
      deepEqual([...xs2], [2, 3]);
    });

    it('should alias to splitAt', () => equal(lilit.partitionAt, lilit.splitAt));
  });

  describe('skipWhile', () => {
    it('should skip while the condition is met', () => {
      deepEqual([...lilit.skipWhile(x => x < 3)([1, 2, 3, 4, 5])], [3, 4, 5]);
    });
  });

  describe('takeWhile', () => {
    it('should take while the condition is met', () => {
      deepEqual([...lilit.takeWhile(x => x < 3)([1, 2, 3, 4, 5])], [1, 2]);
    });
  });

  describe('partitionWhile', () => {
    it('should partition at the element where the condition changes', () => {
      const [taken, skipped] = lilit.partitionWhile(x => x < 3)([1, 2, 3, 4, 5]);
      deepEqual([...taken], [1, 2]);
      deepEqual([...skipped], [3, 4, 5]);
    });
  });

  describe('find', () => {
    it('should find an element', () => {
      const two = lilit.find(x => x === 2)(xs);
      equal(two, 2);
    });
    it('should return null otherwise', () => {
      const _ = lilit.find(x => x === 4)(xs);
      equal(_, null);
    });
    it('should stop an infinite sequence when the element is found', () => {
      const two = lilit.find(x => x === 2)(count());
      equal(two, 2);
    });
  });

  describe('findIndex', () => {
    it('should find an index', () => {
      const two = lilit.findIndex(x => x === 2)(xs);
      equal(two, 1);
    });
    it('should return -1 otherwise', () => {
      const _ = lilit.findIndex(x => x === 4)(xs);
      equal(_, -1);
    });
    it('should stop an infinite sequence when the element is found', () => {
      const two = lilit.findIndex(x => x === 2)(count());
      equal(two, 2);
    });
  });

  describe('unzip2', () => {
    it('should unzip an iterator of pairs', () => {
      const [nums, chars] = lilit.unzip2()([[1, 'a'], [2, 'b'], [3, 'c']]);
      deepEqual([...nums], [1, 2, 3]);
      deepEqual([...chars], ['a', 'b', 'c']);
    });
  });

  describe('unzip', () => {
    it('should unzip an iterator of n-tuples', () => {
      const [nums, chars, bools] = lilit.unzip(3)([[1, 'a', true], [2, 'b', false], [3, 'c', true]]);
      deepEqual([...nums], [1, 2, 3]);
      deepEqual([...chars], ['a', 'b', 'c']);
      deepEqual([...bools], [true, false, true]);
    });
  });

  describe('pluck', () => {
    it('should pluck a value out of an object', () => {
      const objIter = [{ x: 1, y: 'a' }, { x: 2, y: 'b' }, { x: 3, y: 'c' }];
      deepEqual([...lilit.pluck('x')(objIter)], [1, 2, 3]);
      deepEqual([...lilit.pluck('y')(objIter)], ['a', 'b', 'c']);
    });
  });

  describe('select', () => {
    it('should select fro a nested structure', () => {
      const objIter = [{ x: { y: 1 } }, { x: { y: 2 } }, { x: { y: 3 } }];
      deepEqual([...lilit.select(['x', 'y'])(objIter)], [1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    const xs = [1, 2, 3, 4, 5, 6];
    const group = lilit.groupBy((x: number) => x % 2)(xs);

    it('should return a Map', () => {
      equal(group instanceof Map, true);
    });

    it('should group by the value returend from the function', () => {
      deepEqual(group.get(0), [2, 4, 6]);
      deepEqual(group.get(1), [1, 3, 5]);
    });
  });

  describe('mapKeys', () => {
    it('should map the first element in a pair', () => {
      const xs: Array<[number, string]> = [[1, 'a'], [2, 'b'], [3, 'c']];
      const expect = [[2, 'a'], [3, 'b'], [4, 'c']];
      const actual = [...lilit.mapKeys((x: number) => x + 1)(xs)];
      deepEqual(actual, expect);
    });
  });

  describe('mapValues', () => {
    it('should map the second element in a pair', () => {
      const xs: Array<[number, string]> = [[1, 'a'], [2, 'b'], [3, 'c']];
      const expect = [[1, 'as'], [2, 'bs'], [3, 'cs']];
      const actual = [...lilit.mapValues(x => x + 's')(xs)];
      deepEqual(actual, expect);
    });
  });

  describe('pairwise', () => {
    it('should yield values pairwise', () => {
      const xs = [1, 2, 3, 4, 5, 6];
      deepEqual([...lilit.pairwise()(xs)], [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]);
    });

    it("shouldn't yield values on an empty iterator", () => {
      deepEqual([...lilit.pairwise()([])], []);
    });

    it("shouldn't yield values on a single entry iterator", () => {
      deepEqual([...lilit.pairwise()([1])], []);
    });
  });

  describe('length', () => {
    it('should return the number of elements in an iterator', () => {
      equal(lilit.length()(xs), 3);
    });
  });

  describe('min', () => {
    it('should find the smallest element in a sequence', () => {
      equal(lilit.min()([3, 8, 2, 9, 4]), 2);
    });
    it('should return infinity for an empty list', () => {
      equal(lilit.min()([]), Number.POSITIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      equal(lilit.min()([3]), 3);
    });
  });

  describe('max', () => {
    it('should find the largest element in a sequence', () => {
      equal(lilit.max()([3, 8, 2, 9, 4]), 9);
    });
    it('should return infinity for an empty list', () => {
      equal(lilit.max()([]), Number.NEGATIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      equal(lilit.max()([3]), 3);
    });
  });

  describe('minMax', () => {
    it('should find the samllest and largest element in a sequence', () => {
      deepEqual(lilit.minMax()([3, 8, 2, 9, 4]), [2, 9]);
    });
    it('should return infinity for an empty list', () => {
      deepEqual(lilit.minMax()([]), [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    });
    it('should return the element for a single entry list', () => {
      deepEqual(lilit.minMax()([3]), [3, 3]);
    });
  });

  const cf = (a, b) => a.x - b.x;

  describe('minBy', () => {
    it('should find the smallest element in a sequence', () => {
      deepEqual(lilit.minBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), { x: 2 });
    });
    it('should return infinity for an empty list', () => {
      deepEqual(lilit.minBy(cf)([]), Number.POSITIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      deepEqual(lilit.minBy(cf)([{ x: 3 }]), { x: 3 });
    });
  });

  describe('maxBy', () => {
    it('should find the largest element in a sequence', () => {
      deepEqual(lilit.maxBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), { x: 9 });
    });
    it('should return infinity for an empty list', () => {
      deepEqual(lilit.maxBy(cf)([]), Number.NEGATIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      deepEqual(lilit.maxBy(cf)([{ x: 3 }]), { x: 3 });
    });
  });

  describe('minMaxBy', () => {
    it('should find the samllest and largest element in a sequence', () => {
      deepEqual(lilit.minMaxBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), [{ x: 2 }, { x: 9 }]);
    });
    it('should return infinity for an empty list', () => {
      deepEqual(lilit.minMaxBy(cf)([]), [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    });
    it('should return the element for a single entry list', () => {
      deepEqual(lilit.minMaxBy(cf)([{ x: 3 }]), [{ x: 3 }, { x: 3 }]);
    });
  });

  describe('sum', () => {
    it('should sum', () => {
      equal(lilit.sum()(xs), 6);
    });
  });

  describe('replaceWhen', () => {
    it('should replace elements in xs with elments in ys when the condition is met', () => {
      const xs = [1, 2, null, 4, null, 6];
      const ys = ['a', 'b', 'c', 'd', 'e', 'f'];
      deepEqual([...lilit.replaceWhen(x => x == null, ys)(xs)], [1, 2, 'c', 4, 'e', 6]);
    });
  });

  describe('grouped', () => {
    const xs = [1, 2, 3, 4, 5, 6];

    it('should group elements', () => {
      const actual = [...lilit.grouped(2)(xs)];
      const expect = [[1, 2], [3, 4], [5, 6]]
      deepEqual(actual, expect);
    });

    it('should overlap values', () => {
      const actual1 = [...lilit.grouped(2, 1)(xs)];
      const expect1 = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
      deepEqual(actual1, expect1);

      const actual2 = [...lilit.grouped(3, 1)(xs)];
      const expect2 = [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
      deepEqual(actual2, expect2);
    });

    it('should not yield incomplete groups', () => {
      const actual = [...lilit.grouped(3, 2)(xs)];
      const expect = [[1, 2, 3], [3, 4, 5]]
      deepEqual(actual, expect);
    });
  });

  describe('startWith', () => {
    it('should prepend values', () => {
      const expect = [5, 5, 5, 1, 2, 3];
      const actual = [...lilit.startWith(5, 5, 5)(xs)];
      deepEqual(actual, expect);
    });
  });

  describe('endWith', () => {
    it('should append values', () => {
      const expect = [1, 2, 3, 5, 5, 5];
      const actual = [...lilit.endWith(5, 5, 5)(xs)];
      deepEqual(actual, expect);
    });
  });

  // constructors

  describe('range', () => {
    it('should return a range from a to b, excluding b', () => {
      deepEqual([...lilit.range(0, 3)], [0, 1, 2]);
    });

    it('should be callable without arguments', () => {
      const g = lilit.range();
      deepEqual(g.next(), { done: false, value: 0 });
      deepEqual(g.next(), { done: false, value: 1 });
      deepEqual(g.next(), { done: false, value: 2 });
    });

    it('should be callable with one argument', () => {
      const g = lilit.range(3);
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 4 });
      deepEqual(g.next(), { done: false, value: 5 });
    });

    it('should be callable with custom steps', () => {
      deepEqual([...lilit.range(0, 11, 2)], [0, 2, 4, 6, 8, 10]);

      deepEqual([...lilit.range(3, 10, 3)], [3, 6, 9]);
    });

    it('should return reverse ranges', () => {
      deepEqual([...lilit.range(10, -1, -2)], [10, 8, 6, 4, 2, 0]);
    });
  });

  describe('enumerate', () => {
    it('should enumerate', () => {
      deepEqual([...lilit.enumerate(['a', 'b', 'c'])], [[0, 'a'], [1, 'b'], [2, 'c']]);
    });
  });

  describe('concat', () => {
    it('should concat two iterators', () => {
      deepEqual([...lilit.concat([1, 2, 3], [4, 5, 6])], [1, 2, 3, 4, 5, 6]);
    });

    it('should concat more than two iterators', () => {
      deepEqual([...lilit.concat([1, 2, 3], [4, 5, 6], [7, 8, 9])], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('zip', () => {
    it('should zip two iterators', () => {
      deepEqual([...lilit.zip([1, 2, 3], ['a', 'b', 'c'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should zip more than two iterators', () => {
      deepEqual(
        [...lilit.zip([1, 2, 3], ['a', 'b', 'c'], [true, false, true])],
        [[1, 'a', true], [2, 'b', false], [3, 'c', true]],
      );
    });

    it('should stop zipping as soon as the first iterator is done', () => {
      deepEqual([...lilit.zip([1, 2, 3], ['a', 'b', 'c', 'd', 'e'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
      deepEqual([...lilit.zip(['a', 'b', 'c', 'd', 'e'], [1, 2, 3])], [['a', 1], ['b', 2], ['c', 3]]);
    });
  });

  describe('zipOuter', () => {
    it('should zip two iterators', () => {
      deepEqual([...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should zip more than two iterators', () => {
      deepEqual(
        [...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c'], [true, false, true])],
        [[1, 'a', true], [2, 'b', false], [3, 'c', true]],
      );
    });

    it('should continue zipping until the last iterator is done', () => {
      deepEqual(
        [...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c', 'd', 'e'])],
        [[1, 'a'], [2, 'b'], [3, 'c'], [undefined, 'd'], [undefined, 'e']],
      );
      deepEqual(
        [...lilit.zipOuter(['a', 'b', 'c', 'd', 'e'], [1, 2, 3])],
        [['a', 1], ['b', 2], ['c', 3], ['d', undefined], ['e', undefined]],
      );
    });
  });

  // describe('product', () => {
  //   it('should build the carthesian product of two iterators', () => {
  //     deepEqual(
  //       [...lilit.product([0, 1, 2], lilit.range(0, 3))],
  //       [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  //     );
  //   });

  //   it('should work with iterators (that are only iterable once)', () => {
  //     const g1 = lilit.range(0, 3);
  //     const g2 = lilit.range(0, 3);
  //     deepEqual(
  //       [...lilit.product(g1, g2)],
  //       [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  //     );
  //   });

  //   it('should work when passing the same iterator twice', () => {
  //     const g = lilit.range(0, 3);
  //     deepEqual(
  //       [...lilit.product(g, g)],
  //       [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  //     );
  //   });

  //   // it('should work with more than two iterators', () => {
  //   //   deepEqual(
  //   //     [...lilit.product([0, 1], [0, 1], range(0, 2))],
  //   //     [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]],
  //   //   );
  //   // });
  // });

  // describe('combinations', () => {
  //   it('should yield all (unorderd) combinations of two iterators', () => {
  //     deepEqual([...lilit.combinations([0, 1, 2])], [[0, 1], [0, 2], [1, 2]]);
  //   });

  //   it('should work with iterators (that are only iterable once)', () => {
  //     const g = lilit.range(0, 3);
  //     deepEqual([...lilit.combinations(g)], [[0, 1], [0, 2], [1, 2]]);
  //   });
  // });

  describe('constantly', () => {
    it('should yield the same value constantly', () => {
      const g = lilit.constantly(3);
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 3 });
    });
  });

  describe('cycle', () => {
    it('should cycle through the same iterator over and over again', () => {
      const g = lilit.cycle([1, 2, 3]);
      deepEqual(g.next(), { done: false, value: 1 });
      deepEqual(g.next(), { done: false, value: 2 });
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 1 });
      deepEqual(g.next(), { done: false, value: 2 });
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 1 });
    });

    it('should work on an iterator (that is only traversable once)', () => {
      const g = lilit.cycle(lilit.range(1, 4));
      deepEqual(g.next(), { done: false, value: 1 });
      deepEqual(g.next(), { done: false, value: 2 });
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 1 });
      deepEqual(g.next(), { done: false, value: 2 });
      deepEqual(g.next(), { done: false, value: 3 });
      deepEqual(g.next(), { done: false, value: 1 });
    });
  });

  describe('repeat', () => {
    it('should repeat the same iterator n times', () => {
      deepEqual([...lilit.repeat([1, 2, 3], 3)], [1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });
  });

  describe('interleave2', () => {
    it('should interleave two iterartors', () => {
      deepEqual([...lilit.interleave2([1, 3, 5], [2, 4, 6])], [1, 2, 3, 4, 5, 6]);
    });

    it('should stop once the first iterator is done', () => {
      deepEqual([...lilit.interleave2([1, 3, 5], lilit.range(2, 100, 2))], [1, 2, 3, 4, 5, 6]);
      deepEqual([...lilit.interleave2(lilit.range(1, 100, 2), [2, 4, 6])], [1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('interleave', () => {
    it('should interleave more than two iterartors', () => {
      deepEqual([...lilit.interleave([1, 4, 7], [2, 5, 8], [3, 6, 9])], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should stop once the first iterator is done', () => {
      deepEqual(
        [...lilit.interleave([1, 4, 7], lilit.range(2, 100, 3), [3, 6, 9])],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      deepEqual(
        [...lilit.interleave([1, 4, 7], [2, 5, 8], lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      deepEqual(
        [...lilit.interleave([1, 4, 7], lilit.range(2, 100, 3), lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      deepEqual(
        [...lilit.interleave(lilit.range(1, 100, 3), [2, 5, 8], [3, 6, 9])],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      );
      deepEqual(
        [...lilit.interleave(lilit.range(1, 100, 3), [2, 5, 8], lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      );
      deepEqual(
        [...lilit.interleave(lilit.range(1, 100, 3), lilit.range(2, 100, 3), [3, 6, 9])],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      );
    });
  });

  describe('flatMap', () => {
    it('should flat map', () => {
      const xss = [[1, 2, 3], [4, 5, 6]];
      const expect = [2, 3, 4, 5, 6, 7];
      const actual = [...lilit.flatMap((x: number) => x + 1)(xss)];
      deepEqual(actual, expect);
    });
  });

  // describe('distinctUntilChanged', () => {
  //   it('should remove duplicate entries', () => {
  //     const xs = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5];
  //     const expect = [1, 2, 3, 4, 5];
  //     const actual = [...lilit.distinctUntilChanged()(xs)];
  //     deepEqual(expect, actual);
  //   });
  // });
});
