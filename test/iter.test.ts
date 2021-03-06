import * as assert from 'assert';

import * as lilit from '../src/iter';
import { isIterator, tee, teeN } from '../src/common';

describe('iter', () => {
  function* count() {
    let i = 0;
    while (1) yield i++;
  }

  const xs = [1, 2, 3];

  describe('tee', () => {
    function* g() {
      yield 1;
      yield 2;
      yield 3;
    }
    it('should tee an iterator', () => {
      const [a, b] = tee(g());
      assert.deepEqual([1, 2, 3], [...a]);
      assert.deepEqual([1, 2, 3], [...b]);
    });
  });

  describe('teeN', () => {
    function* g() {
      yield 1;
      yield 2;
      yield 3;
    }

    it('should tee an iterator x3', () => {
      const [a, b, c] = teeN(g(), 3);
      assert.deepEqual([1, 2, 3], [...a]);
      assert.deepEqual([1, 2, 3], [...b]);
      assert.deepEqual([1, 2, 3], [...c]);
    });

    it('should tee an iterator x4', () => {
      const [a, b, c, d] = teeN(g(), 4);
      assert.deepEqual([1, 2, 3], [...a]);
      assert.deepEqual([1, 2, 3], [...b]);
      assert.deepEqual([1, 2, 3], [...c]);
      assert.deepEqual([1, 2, 3], [...d]);
    });
  });

  describe('map', () => {
    it('should map values', () => {
      assert.deepEqual([...lilit.map((x: number) => x + 1)(xs)], [2, 3, 4]);
    });
  });

  describe('tap', () => {
    let counter = 0;
    const incCounter = () => {
      counter++;
    };
    const res = lilit.tap(incCounter)(xs);

    it('should return another iterator', () => {
      assert.equal(isIterator(res), true);
    });

    it('should return the same elements', () => {
      assert.deepEqual([...res], [1, 2, 3]);
    });

    it('should call the provided function', () => {
      assert.equal(counter, 3);
    });

    it('should alias to inspect', () => assert.equal(lilit.tap, lilit.inspect));
  });

  describe('forEach', () => {
    let counter = 0;
    const incCounter = () => {
      counter++;
    };
    const iter = xs[Symbol.iterator]();
    const res = lilit.forEach(incCounter)(iter);

    it('should consume the provided iterator', () => {
      assert.deepEqual(iter.next(), { done: true, value: undefined });
    });

    it('should call the provided function', () => {
      assert.equal(counter, 3);
    });

    it('should return undefined', () => {
      assert.equal(res, undefined);
    });

    it('should alias to subscribe', () => assert.equal(lilit.forEach, lilit.subscribe));
  });

  describe('reduce', () => {
    it('should reduce', () => {
      const expect = 6;
      const actual = lilit.reduce((a, b: number) => a + b, 0)(xs);
      assert.equal(actual, expect);
    });
  });

  describe('scan', () => {
    it('should be like reduce, but emit each intermediate value', () => {
      const expect = [1, 3, 6];
      const actual = [...lilit.scan((a, b: number) => a + b, 0)(xs)];
      assert.deepEqual(actual, expect);
    });

    it('should alias to reductions', () => assert.equal(lilit.scan, lilit.reducutions));
  });

  describe('some', () => {
    it('should behave like some', () => {
      assert.equal(lilit.some(x => x === 2)(xs), true);
      assert.equal(lilit.some(x => x === 5)(xs), false);
    });

    it('should return false when empty', () => {
      assert.equal(lilit.some(x => x === 2)([]), false);
    });

    it('should stop consuming the iterator when condition is met', () => {
      const xit = xs[Symbol.iterator]();
      lilit.some(x => x === 2)(xit);
      assert.deepEqual(xit.next(), { done: false, value: 3 });
    });
  });

  describe('every', () => {
    it('should behave like every', () => {
      assert.equal(lilit.every(x => x < 10)(xs), true);
      assert.equal(lilit.every(x => x === 2)(xs), false);
    });

    it('should return true when empty', () => {
      assert.equal(lilit.every(x => x === 2)([]), true);
    });

    it('should stop consuming the iterator when condition is violated', () => {
      const xit = xs[Symbol.iterator]();
      lilit.every(x => x < 2)(xit);
      assert.deepEqual(xit.next(), { done: false, value: 3 });
    });
  });

  describe('filter', () => {
    it('should filter', () => {
      assert.deepEqual([...lilit.filter((x: number) => x % 2 === 1)(xs)], [1, 3]);
    });
  });

  describe('partition', () => {
    it('should partition', () => {
      const [odd, even] = lilit.partition((x: number) => x % 2 === 1)(xs);
      assert.deepEqual([...odd], [1, 3]);
      assert.deepEqual([...even], [2]);
    });

    it("should return an empty iterator when condition isn't met", () => {
      const [met, unmet] = lilit.partition(x => x < 10)(xs);
      assert.deepEqual([...met], [1, 2, 3]);
      assert.deepEqual([...unmet], []);
    });
  });

  describe('skip', () => {
    it('should skip', () => {
      assert.deepEqual([...lilit.skip(1)(xs)], [2, 3]);
    });
  });

  describe('take', () => {
    it('should take', () => {
      assert.deepEqual([...lilit.take(2)(xs)], [1, 2]);
    });

    it('should end inifite iterators', () => {
      assert.deepEqual([...lilit.take(3)(count())], [0, 1, 2]);
    });
  });

  describe('partitionAt', () => {
    it('should take n and skip n', () => {
      const [xs1, xs2] = lilit.partitionAt(1)(xs);
      assert.deepEqual([...xs1], [1]);
      assert.deepEqual([...xs2], [2, 3]);
    });

    it('should alias to splitAt', () => assert.equal(lilit.partitionAt, lilit.splitAt));
  });

  describe('skipWhile', () => {
    it('should skip while the condition is met', () => {
      assert.deepEqual([...lilit.skipWhile(x => x < 3)([1, 2, 3, 4, 5])], [3, 4, 5]);
    });
  });

  describe('takeWhile', () => {
    it('should take while the condition is met', () => {
      assert.deepEqual([...lilit.takeWhile(x => x < 3)([1, 2, 3, 4, 5])], [1, 2]);
    });
  });

  describe('partitionWhile', () => {
    it('should partition at the element where the condition changes', () => {
      const [taken, skipped] = lilit.partitionWhile(x => x < 3)([1, 2, 3, 4, 5]);
      assert.deepEqual([...taken], [1, 2]);
      assert.deepEqual([...skipped], [3, 4, 5]);
    });
  });

  describe('find', () => {
    it('should find an element', () => {
      const two = lilit.find(x => x === 2)(xs);
      assert.equal(two, 2);
    });
    it('should return null otherwise', () => {
      const _ = lilit.find(x => x === 4)(xs);
      assert.equal(_, null);
    });
    it('should stop an infinite sequence when the element is found', () => {
      const two = lilit.find(x => x === 2)(count());
      assert.equal(two, 2);
    });
  });

  describe('findIndex', () => {
    it('should find an index', () => {
      const two = lilit.findIndex(x => x === 2)(xs);
      assert.equal(two, 1);
    });
    it('should return -1 otherwise', () => {
      const _ = lilit.findIndex(x => x === 4)(xs);
      assert.equal(_, -1);
    });
    it('should stop an infinite sequence when the element is found', () => {
      const two = lilit.findIndex(x => x === 2)(count());
      assert.equal(two, 2);
    });
  });

  describe('unzip2', () => {
    it('should unzip an iterator of pairs', () => {
      const [nums, chars] = lilit.unzip2()([[1, 'a'], [2, 'b'], [3, 'c']]);
      assert.deepEqual([...nums], [1, 2, 3]);
      assert.deepEqual([...chars], ['a', 'b', 'c']);
    });
  });

  describe('unzip', () => {
    it('should unzip an iterator of n-tuples', () => {
      const [nums, chars, bools] = lilit.unzip(3)([[1, 'a', true], [2, 'b', false], [3, 'c', true]]);
      assert.deepEqual([...nums], [1, 2, 3]);
      assert.deepEqual([...chars], ['a', 'b', 'c']);
      assert.deepEqual([...bools], [true, false, true]);
    });
  });

  describe('pluck', () => {
    it('should pluck a value out of an object', () => {
      const objIter = [{ x: 1, y: 'a' }, { x: 2, y: 'b' }, { x: 3, y: 'c' }];
      assert.deepEqual([...lilit.pluck('x')(objIter)], [1, 2, 3]);
      assert.deepEqual([...lilit.pluck('y')(objIter)], ['a', 'b', 'c']);
    });
  });

  describe('select', () => {
    it('should select fro a nested structure', () => {
      const objIter = [{ x: { y: 1 } }, { x: { y: 2 } }, { x: { y: 3 } }];
      assert.deepEqual([...lilit.select(['x', 'y'])(objIter)], [1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    const xs = [1, 2, 3, 4, 5, 6];
    const group = lilit.groupBy((x: number) => x % 2)(xs);

    it('should return a Map', () => {
      assert.equal(group instanceof Map, true);
    });

    it('should group by the value returend from the function', () => {
      assert.deepEqual(group.get(0), [2, 4, 6]);
      assert.deepEqual(group.get(1), [1, 3, 5]);
    });
  });

  describe('mapKeys', () => {
    it('should map the first element in a pair', () => {
      const xs: Array<[number, string]> = [[1, 'a'], [2, 'b'], [3, 'c']];
      const expect = [[2, 'a'], [3, 'b'], [4, 'c']];
      const actual = [...lilit.mapKeys((x: number) => x + 1)(xs)];
      assert.deepEqual(actual, expect);
    });
  });

  describe('mapValues', () => {
    it('should map the second element in a pair', () => {
      const xs: Array<[number, string]> = [[1, 'a'], [2, 'b'], [3, 'c']];
      const expect = [[1, 'as'], [2, 'bs'], [3, 'cs']];
      const actual = [...lilit.mapValues(x => x + 's')(xs)];
      assert.deepEqual(actual, expect);
    });
  });

  describe('pairwise', () => {
    it('should yield values pairwise', () => {
      const xs = [1, 2, 3, 4, 5, 6];
      assert.deepEqual([...lilit.pairwise()(xs)], [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]);
    });

    it("shouldn't yield values on an empty iterator", () => {
      assert.deepEqual([...lilit.pairwise()([])], []);
    });

    it("shouldn't yield values on a single entry iterator", () => {
      assert.deepEqual([...lilit.pairwise()([1])], []);
    });
  });

  describe('length', () => {
    it('should return the number of elements in an iterator', () => {
      assert.equal(lilit.length()(xs), 3);
    });
  });

  describe('min', () => {
    it('should find the smallest element in a sequence', () => {
      assert.equal(lilit.min()([3, 8, 2, 9, 4]), 2);
    });
    it('should return infinity for an empty list', () => {
      assert.equal(lilit.min()([]), Number.POSITIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      assert.equal(lilit.min()([3]), 3);
    });
  });

  describe('max', () => {
    it('should find the largest element in a sequence', () => {
      assert.equal(lilit.max()([3, 8, 2, 9, 4]), 9);
    });
    it('should return infinity for an empty list', () => {
      assert.equal(lilit.max()([]), Number.NEGATIVE_INFINITY);
    });
    it('should return the element for a single entry list', () => {
      assert.equal(lilit.max()([3]), 3);
    });
  });

  describe('minMax', () => {
    it('should find the samllest and largest element in a sequence', () => {
      assert.deepEqual(lilit.minMax()([3, 8, 2, 9, 4]), [2, 9]);
    });
    it('should return infinity for an empty list', () => {
      assert.deepEqual(lilit.minMax()([]), [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    });
    it('should return the element for a single entry list', () => {
      assert.deepEqual(lilit.minMax()([3]), [3, 3]);
    });
  });

  const cf = (a, b) => a.x - b.x;

  describe('minBy', () => {
    it('should find the smallest element in a sequence', () => {
      assert.deepEqual(lilit.minBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), { x: 2 });
    });
    it('should return null for an empty list', () => {
      assert.deepEqual(lilit.minBy(cf)([]), null);
    });
    it('should return the element for a single entry list', () => {
      assert.deepEqual(lilit.minBy(cf)([{ x: 3 }]), { x: 3 });
    });
  });

  describe('maxBy', () => {
    it('should find the largest element in a sequence', () => {
      assert.deepEqual(lilit.maxBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), { x: 9 });
    });
    it('should return null for an empty list', () => {
      assert.deepEqual(lilit.maxBy(cf)([]), null);
    });
    it('should return the element for a single entry list', () => {
      assert.deepEqual(lilit.maxBy(cf)([{ x: 3 }]), { x: 3 });
    });
  });

  describe('minMaxBy', () => {
    it('should find the samllest and largest element in a sequence', () => {
      assert.deepEqual(lilit.minMaxBy(cf)([{ x: 3 }, { x: 8 }, { x: 2 }, { x: 9 }, { x: 4 }]), [{ x: 2 }, { x: 9 }]);
    });
    it('should return null for an empty list', () => {
      assert.deepEqual(lilit.minMaxBy(cf)([]), [null, null]);
    });
    it('should return the element for a single entry list', () => {
      assert.deepEqual(lilit.minMaxBy(cf)([{ x: 3 }]), [{ x: 3 }, { x: 3 }]);
    });
  });

  describe('sum', () => {
    it('should sum', () => {
      assert.equal(lilit.sum()(xs), 6);
    });
  });

  describe('replaceWhen', () => {
    it('should replace elements in xs with elments in ys when the condition is met', () => {
      const xs = [1, 2, null, 4, null, 6];
      const ys = ['a', 'b', 'c', 'd', 'e', 'f'];
      assert.deepEqual([...lilit.replaceWhen(x => x == null, ys)(xs)], [1, 2, 'c', 4, 'e', 6]);
    });
  });

  describe('grouped', () => {
    const xs = [1, 2, 3, 4, 5, 6];

    it('should group elements', () => {
      const actual = [...lilit.grouped(2)(xs)];
      const expect = [[1, 2], [3, 4], [5, 6]];
      assert.deepEqual(actual, expect);
    });

    it('should overlap values', () => {
      const actual1 = [...lilit.grouped(2, 1)(xs)];
      const expect1 = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]];
      assert.deepEqual(actual1, expect1);

      const actual2 = [...lilit.grouped(3, 1)(xs)];
      const expect2 = [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]];
      assert.deepEqual(actual2, expect2);
    });

    it('should not yield incomplete groups', () => {
      const actual = [...lilit.grouped(3, 2)(xs)];
      const expect = [[1, 2, 3], [3, 4, 5]];
      assert.deepEqual(actual, expect);
    });
  });

  describe('startWith', () => {
    it('should prepend values', () => {
      const expect = [5, 5, 5, 1, 2, 3];
      const actual = [...lilit.startWith(5, 5, 5)(xs)];
      assert.deepEqual(actual, expect);
    });
  });

  describe('endWith', () => {
    it('should append values', () => {
      const expect = [1, 2, 3, 5, 5, 5];
      const actual = [...lilit.endWith(5, 5, 5)(xs)];
      assert.deepEqual(actual, expect);
    });
  });

  // constructors

  describe('range', () => {
    it('should return a range from a to b, excluding b', () => {
      assert.deepEqual([...lilit.range(0, 3)], [0, 1, 2]);
    });

    it('should be callable without arguments', () => {
      const g = lilit.range();
      assert.deepEqual(g.next(), { done: false, value: 0 });
      assert.deepEqual(g.next(), { done: false, value: 1 });
      assert.deepEqual(g.next(), { done: false, value: 2 });
    });

    it('should be callable with one argument', () => {
      const g = lilit.range(3);
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 4 });
      assert.deepEqual(g.next(), { done: false, value: 5 });
    });

    it('should be callable with custom steps', () => {
      assert.deepEqual([...lilit.range(0, 11, 2)], [0, 2, 4, 6, 8, 10]);

      assert.deepEqual([...lilit.range(3, 10, 3)], [3, 6, 9]);
    });

    it('should return reverse ranges', () => {
      assert.deepEqual([...lilit.range(10, -1, -2)], [10, 8, 6, 4, 2, 0]);
    });
  });

  describe('enumerate', () => {
    it('should enumerate', () => {
      assert.deepEqual([...lilit.enumerate(['a', 'b', 'c'])], [[0, 'a'], [1, 'b'], [2, 'c']]);
    });
  });

  describe('concat', () => {
    it('should concat two iterators', () => {
      assert.deepEqual([...lilit.concat([1, 2, 3], [4, 5, 6])], [1, 2, 3, 4, 5, 6]);
    });

    it('should concat more than two iterators', () => {
      assert.deepEqual([...lilit.concat([1, 2, 3], [4, 5, 6], [7, 8, 9])], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should alias to chain', () => assert.equal(lilit.concat, lilit.chain));
  });

  describe('zip', () => {
    it('should zip two iterators', () => {
      assert.deepEqual([...lilit.zip([1, 2, 3], ['a', 'b', 'c'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should zip more than two iterators', () => {
      assert.deepEqual(
        [...lilit.zip([1, 2, 3], ['a', 'b', 'c'], [true, false, true])],
        [[1, 'a', true], [2, 'b', false], [3, 'c', true]],
      );
    });

    it('should stop zipping as soon as the first iterator is done', () => {
      assert.deepEqual([...lilit.zip([1, 2, 3], ['a', 'b', 'c', 'd', 'e'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
      assert.deepEqual([...lilit.zip(['a', 'b', 'c', 'd', 'e'], [1, 2, 3])], [['a', 1], ['b', 2], ['c', 3]]);
    });
  });

  describe('zipOuter', () => {
    it('should zip two iterators', () => {
      assert.deepEqual([...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c'])], [[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should zip more than two iterators', () => {
      assert.deepEqual(
        [...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c'], [true, false, true])],
        [[1, 'a', true], [2, 'b', false], [3, 'c', true]],
      );
    });

    it('should continue zipping until the last iterator is done', () => {
      assert.deepEqual(
        [...lilit.zipOuter([1, 2, 3], ['a', 'b', 'c', 'd', 'e'])],
        [[1, 'a'], [2, 'b'], [3, 'c'], [undefined, 'd'], [undefined, 'e']],
      );
      assert.deepEqual(
        [...lilit.zipOuter(['a', 'b', 'c', 'd', 'e'], [1, 2, 3])],
        [['a', 1], ['b', 2], ['c', 3], ['d', undefined], ['e', undefined]],
      );
    });
  });

  describe('product2', () => {
    it('should build the carthesian product of two iterators', () => {
      assert.deepEqual(
        [...lilit.product2([0, 1, 2], lilit.range(0, 3))],
        [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
      );
    });

    it('should work with iterators (that are only iterable once)', () => {
      const g1 = lilit.range(0, 3);
      const g2 = lilit.range(0, 3);
      assert.deepEqual(
        [...lilit.product2(g1, g2)],
        [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
      );
    });

    it('should pass the python itertools example', () => {
      const actual = [...lilit.product2('ABCD', 'ABCD')].map(_ => _.join(''));
      const expect = ['AA', 'AB', 'AC', 'AD', 'BA', 'BB', 'BC', 'BD', 'CA', 'CB', 'CC', 'CD', 'DA', 'DB', 'DC', 'DD'];
      assert.deepEqual(actual, expect);
    });

    it.skip('should work when passing the same iterator twice', () => {
      const g = lilit.range(0, 3);
      assert.deepEqual(
        [...lilit.product2(g, g)],
        [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
      );
    });
  });

  describe('product3', () => {
    it('should work with three iterators', () => {
      const actual = [...lilit.product3([0, 1], [0, 1], lilit.range(0, 2))];
      const expect = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]];
      assert.deepEqual(actual, expect);
    });
  });

  describe('combinations2', () => {
    it('should yield all (unorderd) combinations of length 2', () => {
      const actual = [...lilit.combinations2([0, 1, 2])];
      const expect = [[0, 1], [0, 2], [1, 2]];
      assert.deepEqual(actual, expect);
    });

    it('should work with iterators (that are only iterable once)', () => {
      const g = lilit.range(0, 3);
      const actual = [...lilit.combinations2(g)];
      const expect = [[0, 1], [0, 2], [1, 2]];
      assert.deepEqual(actual, expect);
    });

    it('should pass the python itertools example', () => {
      const actual = [...lilit.combinations2('ABCD')].map(_ => _.join(''));
      const expect = ['AB', 'AC', 'AD', 'BC', 'BD', 'CD'];
      assert.deepEqual(actual, expect);
    });
  });

  describe.skip('combinations3', () => {
    it('should yield all (unorderd) combinations of length 3', () => {
      const actual = [...lilit.combinations3([0, 1, 2, 3])];
      const expect = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
      assert.deepEqual(actual, expect);
    });

    it('should work with iterators (that are only iterable once)', () => {
      const g = lilit.range(0, 4);
      const actual = [...lilit.combinations3(g)];
      const expect = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
      assert.deepEqual(actual, expect);
    });

    it("should return only 1 element when there's only one combination", () => {
      const actual = [...lilit.combinations3([0, 1, 2])];
      const expect = [[0, 1, 2]];
      assert.deepEqual(actual, expect);
    });

    it("should not return when there arent'enough elements", () => {
      const actual = [...lilit.combinations3([0, 1])];
      const expect = [];
      assert.deepEqual(actual, expect);
    });

    it('should pass the python itertools example', () => {
      const actual = [...lilit.combinations3('ABCD')].map(_ => _.join(''));
      const expect = ['ABC', 'ABD', 'ACD', 'BCD'];
      assert.deepEqual(actual, expect);
    });
  });

  describe('combinationsWithReplacement2', () => {
    it('should pass the python itertools example', () => {
      const actual = [...lilit.combinationsWithReplacement2('ABCD')].map(_ => _.join(''));
      const expect = ['AA', 'AB', 'AC', 'AD', 'BB', 'BC', 'BD', 'CC', 'CD', 'DD'];
      assert.deepEqual(actual, expect);
    });
  });

  describe.skip('combinationsWithReplacement3', () => {
    it('should pass the python itertools example', () => {
      const actual = [...lilit.combinationsWithReplacement3('ABC')].map(_ => _.join(''));
      const expect = ['AAA', 'AAB', 'AAC', 'ABB', 'ABC', 'ACC', 'BBB', 'BBC', 'BCC', 'CCC'];
      assert.deepEqual(actual, expect);
    });
  });

  describe.skip('permutations2', () => {
    // # permutations('ABCD', 2) --> AB AC AD BA BC BD CA CB CD DA DB DC
    it('should yield all permutations of length 2', () => {
      const actual = [...lilit.permutations2('ABCD')].map(_ => _.join(''));
      const expect = ['AB', 'AC', 'AD', 'BA', 'BC', 'BD', 'CA', 'CB', 'DA', 'DB', 'DC'];
      assert.deepEqual(actual, expect);
    });
  });

  describe.skip('permutations3', () => {
    // # permutations(range(3)) --> 012 021 102 120 201 210
    it('should yield all permutations of length 3', () => {
      const actual = [...lilit.permutations3(lilit.range(0, 3))];
      const expect = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
      assert.deepEqual(actual, expect);
    });
  });

  describe('constantly', () => {
    it('should yield the same value constantly', () => {
      const g = lilit.constantly(3);
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
    });
  });

  describe('cycle', () => {
    it('should cycle through the same iterator over and over again', () => {
      const g = lilit.cycle([1, 2, 3]);
      assert.deepEqual(g.next(), { done: false, value: 1 });
      assert.deepEqual(g.next(), { done: false, value: 2 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 1 });
      assert.deepEqual(g.next(), { done: false, value: 2 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 1 });
    });

    it('should work on an iterator (that is only traversable once)', () => {
      const g = lilit.cycle(lilit.range(1, 4));
      assert.deepEqual(g.next(), { done: false, value: 1 });
      assert.deepEqual(g.next(), { done: false, value: 2 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 1 });
      assert.deepEqual(g.next(), { done: false, value: 2 });
      assert.deepEqual(g.next(), { done: false, value: 3 });
      assert.deepEqual(g.next(), { done: false, value: 1 });
    });
  });

  describe('repeat', () => {
    it('should repeat the same iterator n times', () => {
      assert.deepEqual([...lilit.repeat([1, 2, 3], 3)], [1, 2, 3, 1, 2, 3, 1, 2, 3]);
    });
  });

  describe('interleave2', () => {
    it('should interleave two iterartors', () => {
      assert.deepEqual([...lilit.interleave2([1, 3, 5], [2, 4, 6])], [1, 2, 3, 4, 5, 6]);
    });

    it('should stop once the first iterator is done', () => {
      assert.deepEqual([...lilit.interleave2([1, 3, 5], lilit.range(2, 100, 2))], [1, 2, 3, 4, 5, 6]);
      assert.deepEqual([...lilit.interleave2(lilit.range(1, 100, 2), [2, 4, 6])], [1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('interleave', () => {
    it('should interleave more than two iterartors', () => {
      assert.deepEqual([...lilit.interleave([1, 4, 7], [2, 5, 8], [3, 6, 9])], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should stop once the first iterator is done', () => {
      assert.deepEqual(
        [...lilit.interleave([1, 4, 7], lilit.range(2, 100, 3), [3, 6, 9])],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      assert.deepEqual(
        [...lilit.interleave([1, 4, 7], [2, 5, 8], lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      assert.deepEqual(
        [...lilit.interleave([1, 4, 7], lilit.range(2, 100, 3), lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
      assert.deepEqual(
        [...lilit.interleave(lilit.range(1, 100, 3), [2, 5, 8], [3, 6, 9])],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      );
      assert.deepEqual(
        [...lilit.interleave(lilit.range(1, 100, 3), [2, 5, 8], lilit.range(3, 100, 3))],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      );
      assert.deepEqual(
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
      assert.deepEqual(actual, expect);
    });
  });

  describe('distinctUntilChanged', () => {
    it('should remove consecutive duplicate entries', () => {
      const xs = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5];
      const expect = [1, 2, 3, 4, 5];
      const actual = [...lilit.distinctUntilChanged()(xs)];
      assert.deepEqual(expect, actual);
    });
  });

  describe('unique', () => {
    it('should remove duplicate entries and retain the order', () => {
      const xs = [3, 4, 2, 4, 6, 3, 3, 6, 7, 1, 2, 3];
      const expect = [3, 4, 2, 6, 7, 1];
      const actual = [...lilit.unique()(xs)];
      assert.deepEqual(expect, actual);
    });
  });

  describe('uniqueSorted', () => {
    it('should remove duplicate entries and sort the elements', () => {
      const xs = [3, 4, 2, 4, 6, 3, 3, 6, 7, 1, 2, 3];
      const expect = [1, 2, 3, 4, 6, 7];
      const actual = [...lilit.uniqueSorted()(xs)];
      assert.deepEqual(expect, actual);
    });
  });
});
