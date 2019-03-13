// THIS FILE IS AUTO-GENEREATED! DO NOT MODIFY DIRECTLY!
//
// To edit this file, edit 'async-iter.js' and run 'npm run build:pre'.

import { tee, teeN, iterator } from './common';

export /*async*/ function pipe(x: any, ...fs: Function[]): {} {
  let res = x;
  for (const f of fs) res = /*await*/ f(res);
  return res;
}

// OPERATORS

export function map<A, B>(f: (x: A) => B) {
  return /*async*/ function*(xs: Iterable<A>): IterableIterator<B> {
    for (/*await*/ const x of xs) yield f(x);
  };
}

export function tap<X>(f: (x: X) => any) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    for (/*await*/ const x of xs) {
      f(x);
      yield x;
    }
  };
}

export const inspect = tap;

export function forEach<X>(f: (x: X) => any) {
  return /*async*/ function(xs: Iterable<X>): void {
    for (/*await*/ const x of xs) f(x);
  };
}

export const subscribe = forEach;

export function reduce<X, R>(f: (acc: R, x: X) => R, init: R) {
  return /*async*/ function(xs: Iterable<X>): R {
    let res = init;
    for (/*await*/ const x of xs) {
      res = f(res, x);
    }
    return res;
  };
}

export function scan<X, R>(f: (acc: R, x: X) => R, init: R) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<R> {
    let res = init;
    for (/*await*/ const x of xs) {
      res = f(res, x);
      yield res;
    }
  };
}

export const reducutions = scan;

export function some<X>(p: (x: X) => boolean) {
  return /*async*/ function(xs: Iterable<X>): boolean {
    for (/*await*/ const x of xs) {
      if (p(x)) return true;
    }
    return false;
  };
}

export function every<X>(p: (x: X) => boolean) {
  return /*async*/ function(xs: Iterable<X>): boolean {
    for (/*await*/ const x of xs) {
      if (!p(x)) return false;
    }
    return true;
  };
}

export function filter<X>(p: (x: X) => boolean) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    for (/*await*/ const x of xs) {
      if (p(x)) yield x;
    }
  };
}

export function partition<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [filter(p)(xs1), filter((x: X) => !p(x))(xs2)];
  };
}

export function skip<X>(n: number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    let i = 0;
    for (/*await*/ const x of xs) {
      if (++i <= n) continue;
      yield x;
    }
  };
}

export function take<X>(n: number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    let i = 0;
    for (/*await*/ const x of xs) {
      if (++i > n) break;
      yield x;
    }
  };
}

// TODO: rename?
export function partitionAt<X>(n: number) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [take<X>(n)(xs1), skip<X>(n)(xs2)];
  };
}

export const splitAt = partitionAt;

export function skipWhile<X>(f: (x: X) => boolean) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    const it = iterator(xs);
    let first: X;
    for (/*await*/ const x of it) {
      first = x;
      if (!f(x)) break;
    }
    yield first;
    for (/*await*/ const x of it) yield x;
  };
}

export function takeWhile<X>(f: (x: X) => boolean) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    for (/*await*/ const x of xs) {
      if (f(x)) yield x;
      else break;
    }
  };
}

export function partitionWhile<X>(f: (x: X) => boolean) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [takeWhile<X>(f)(xs1), skipWhile<X>(f)(xs2)];
  };
}

export function find<X>(p: (x: X) => boolean) {
  return /*async*/ function(xs: Iterable<X>): X | null {
    for (/*await*/ const x of xs) {
      if (p(x)) return x;
    }
    return null;
  };
}

export function findIndex<X>(p: (x: X) => boolean) {
  return /*async*/ function(xs: Iterable<X>): number {
    let i = 0;
    for (/*await*/ const x of xs) {
      if (p(x)) return i;
      i++;
    }
    return -1;
  };
}

export function pluck<X>(key: string | number) {
  return /*async*/ function*(xs: Iterable<Object>): IterableIterator<X | null> {
    for (/*await*/ const x of xs) yield x[key];
  };
}

// like pluck, but accepts an iterable of keys
export function select<X>(keys: Array<string | number>) {
  return /*async*/ function*(xs: Iterable<Object>): IterableIterator<X | null> {
    for (/*await*/ const x of xs) {
      let r = x;
      for (const k of keys) {
        r = r != null ? r[k] : undefined;
      }
      yield r as (X | null);
    }
  };
}

export function unzip2<X, Y>() {
  return function(xs: Iterable<[X, Y]>): [IterableIterator<X>, IterableIterator<Y>] {
    const [xs1, xs2] = tee(xs);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2)];
  };
}

export function unzip3<X, Y, Z>() {
  return function(xs: Iterable<[X, Y, Z]>): [IterableIterator<X>, IterableIterator<Y>, IterableIterator<Z>] {
    const [xs1, xs2, xs3] = teeN(xs, 3);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2), pluck<Z>(2)(xs3)];
  };
}

export function unzip(n: number = 2) {
  return function(xs: Iterable<{}[]>): IterableIterator<{}>[] {
    const xss = teeN(xs, n);
    return xss.map((xs, i) => pluck(i)(xs));
  };
}

export function groupBy<X, K>(f: (x: X) => K) {
  return /*async*/ function(xs: Iterable<X>): Map<K, X[]> {
    const res = new Map<K, X[]>();
    for (/*await*/ const x of xs) {
      const key = f(x);
      if (!res.has(key)) res.set(key, []);
      res.get(key).push(x);
    }
    return res;
  };
}

export function groupByKey<X>(key: string | number) {
  return groupBy<X, string | number>((x: X) => x[key]);
}

export function mapKeys<A, B, U>(f: (k: A) => B) {
  return /*async*/ function*(xs: Iterable<[A, U]>): IterableIterator<[B, U]> {
    for (/*await*/ const [k, v] of xs) yield [f(k), v];
  };
}

export function mapValues<A, B, U>(f: (v: A) => B) {
  return /*async*/ function*(xs: Iterable<[U, A]>): IterableIterator<[U, B]> {
    for (/*await*/ const [k, v] of xs) yield [k, f(v)];
  };
}

export function pairwise<X>() {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<[X, X]> {
    const it = iterator(xs);
    let prev = /*await*/ it.next().value;
    for (/*await*/ const x of it) {
      yield [prev, x];
      prev = x;
    }
  };
}

export function length() {
  return /*async*/ function(xs: Iterable<{}>): number {
    let c = 0;
    for (/*await*/ const _ of xs) c++;
    return c;
  };
}

export function min() {
  return /*async*/ function(xs: Iterable<number>): number {
    let res = Number.POSITIVE_INFINITY;
    for (/*await*/ const x of xs) {
      if (x < res) res = x;
    }
    return res;
  };
}

export function max() {
  return /*async*/ function(xs: Iterable<number>): number {
    let res = Number.NEGATIVE_INFINITY;
    for (/*await*/ const x of xs) {
      if (x > res) res = x;
    }
    return res;
  };
}

export function minMax() {
  return /*async*/ function(xs: Iterable<number>): [number, number] {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (/*await*/ const x of xs) {
      if (x < min) min = x;
      if (x > max) max = x;
    }
    return [min, max];
  };
}

export function minBy<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function(xs: Iterable<X>): X | null {
    const it = iterator(xs);
    const { done, value } = /*await*/ it.next();
    if (done) return null;
    let res = value;
    for (/*await*/ const x of it) if (cf(x, res) < 0) res = x;
    return res;
  };
}

export function maxBy<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function(xs: Iterable<X>): X | null {
    const it = iterator(xs);
    const { done, value } = /*await*/ it.next();
    if (done) return null;
    let res = value;
    for (/*await*/ const x of it) if (cf(x, res) > 0) res = x;
    return res;
  };
}

export function minMaxBy<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function(xs: Iterable<X>): [X | null, X | null] {
    const it = iterator(xs);
    const { done, value } = /*await*/ it.next();
    if (done) return [null, null];
    let min = value;
    let max = value;
    for (/*await*/ const x of it) {
      if (cf(x, min) < 0) min = x;
      if (cf(x, max) > 0) max = x;
    }
    return [min, max];
  };
}

export function minByScan<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X | null> {
    const it = iterator(xs);
    const { done, value } = /*await*/ it.next();
    if (done) yield null;
    let res = value;
    for (/*await*/ const x of it) {
      if (cf(x, res) < 0) res = x;
      yield res;
    }
  };
}

export function maxByScan<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X | null> {
    const it = iterator(xs);
    const { done, value } = /*await*/ it.next();
    if (done) yield null;
    let res = value;
    for (/*await*/ const x of it) {
      if (cf(x, res) > 0) res = x;
      yield res;
    }
  };
}

export function sum(zero: number = 0) {
  return /*async*/ function(xs: Iterable<number>): number {
    let res = zero;
    for (/*await*/ const x of xs) res += x;
    return res;
  };
}

export function replaceWhen<X, Y>(pf: (x: X) => boolean, ys: Iterable<Y>) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X | Y> {
    for (/*await*/ const [x, y] of zip2(xs, ys)) {
      if (!pf(x)) yield x;
      else yield y;
    }
  };
}

export function grouped<X>(n: number, step: number = n) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X[]> {
    let group = [];
    for (/*await*/ const x of xs) {
      group.push(x);
      if (group.length === n) {
        yield [...group];
        for (let i = 0; i < step; i++) group.shift();
      }
    }
  };
}

export function startWith<X>(...as: X[]) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    for (/*await*/ const a of as) yield a;
    for (/*await*/ const x of xs) yield x;
  };
}

export function endWith<X>(...zs: X[]) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    for (/*await*/ const x of xs) yield x;
    for (/*await*/ const z of zs) yield z;
  };
}

export function sort<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    let arr = [];
    for (/*await*/ const x of xs) arr.push(x);
    for (const x of arr.sort(cf)) yield x;
  };
}

export function sortScan<X>(cf: (a: X, b: X) => number) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X[]> {
    let arr = [];
    for (/*await*/ const x of xs) {
      arr.push(x);
      yield [...arr.sort(cf)];
    }
  };
}

export function flatMap<A, B>(f: (x: A) => B) {
  return /*async*/ function*(xss: Iterable<Iterable<A>>): IterableIterator<B> {
    for (/*await*/ const xs of xss) for (/*await*/ const x of xs) yield /*await*/ f(x);
  };
}

export function distinctUntilChanged<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    const it = iterator(xs);
    let { done, value: initial } = /*await*/ it.next();
    if (done) return;
    yield initial;
    for (/*await*/ const x of it) if (!comp(x, initial)) yield (initial = x);
  };
}

export function unique<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    const arr = [];
    for (/*await*/ const x of xs) arr.push(x);
    const unq = arr.filter((x, i, self) => self.findIndex(y => comp(x, y)) === i);
    for (const u of unq) yield u;
  };
}

export function uniqueSorted<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return /*async*/ function*(xs: Iterable<X>): IterableIterator<X> {
    const arr = [];
    for (/*await*/ const x of xs) arr.push(x);
    arr.sort();
    for (/*await*/ const x of distinctUntilChanged(comp)(arr)) yield x;
  };
}

// CONSTRUCTORS

export /*async*/ function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): IterableIterator<number> {
  for (let i = start; end > start ? i < end : i > end; i += step) yield i;
}

// TODO: rename to `entries`?
export /*async*/ function* enumerate<X>(xs: Iterable<X>): IterableIterator<[number, X]> {
  let i = 0;
  for (/*await*/ const x of xs) yield [i++, x];
}

export /*async*/ function* concat<X>(...xss: Iterable<X>[]): IterableIterator<X> {
  for (const xs of xss) for (/*await*/ const x of xs) yield x;
}

export /*async*/ function* zip2<X, Y>(xs: Iterable<X>, ys: Iterable<Y>): IterableIterator<[X, Y]> {
  const xit = iterator(xs);
  const yit = iterator(ys);
  while (true) {
    const [xr, yr] = /*await*/ /*Promise.all(*/ [xit.next(), yit.next()] /*)*/;
    if (xr.done || yr.done) break;
    yield [xr.value, yr.value];
  }
}

export /*async*/ function* zip3<X, Y, Z>(
  xs: Iterable<X>,
  ys: Iterable<Y>,
  zs: Iterable<Z>,
): IterableIterator<[X, Y, Z]> {
  const xit = iterator(xs);
  const yit = iterator(ys);
  const zit = iterator(zs);
  while (true) {
    const [xr, yr, zr] = /*await*/ /*Promise.all(*/ [xit.next(), yit.next(), zit.next()] /*)*/;
    if (xr.done || yr.done || zr.done) break;
    yield [xr.value, yr.value, zr.value];
  }
}

export /*async*/ function* zip(...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  const its = xss.map(iterator);
  while (true) {
    const rs = /*await*/ /*Promise.all(*/ its.map(it => it.next()) /*)*/;
    if (rs.some(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

// TODO: rename? Is this how regular zip commonly works?
export /*async*/ function* zipOuter(...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  const its = xss.map(iterator);
  while (true) {
    const rs = /*await*/ /*Promise.all(*/ its.map(it => it.next()) /*)*/;
    if (rs.every(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

export /*async*/ function* product2<A, B>(as: Iterable<A>, bs: Iterable<B>): IterableIterator<[A, B]> {
  // if (as === bs) [as, bs] = tee(as);
  let bs2: Iterable<B>;
  for (/*await*/ const a of as) {
    [bs, bs2] = tee(bs);
    for (/*await*/ const b of bs2) {
      yield [a, b];
    }
  }
}

export /*async*/ function* product3<A, B, C>(
  as: Iterable<A>,
  bs: Iterable<B>,
  cs: Iterable<C>,
): IterableIterator<[A, B, C]> {
  // if (as === bs) [as, bs] = tee(as);
  // if (as === cs) [as, cs] = tee(as);
  // if (bs === cs) [bs, cs] = tee(bs);
  let bs2: Iterable<B>;
  let cs2: Iterable<C>;
  for (/*await*/ const a of as) {
    [bs, bs2] = tee(bs);
    for (/*await*/ const b of bs2) {
      [cs, cs2] = tee(cs);
      for (/*await*/ const c of cs2) {
        yield [a, b, c];
      }
    }
  }
}

// TODO: generalize to n parameters
export /*async*/ function* product(xs: Iterable<{}>, ...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  throw new Error('Not implemented');
}

// TODO: other name (look at python itertools?)
// TODO: fix implementation
export /*async*/ function* combinations2<X>(xs: Iterable<X>): IterableIterator<[X, X]> {
  let [as, bs] = tee(xs);

  let bs2: Iterable<X>;
  let i = 1;
  for (/*await*/ const a of as) {
    [bs, bs2] = tee(bs);
    for (/*await*/ const b of skip<X>(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export /*async*/ function* combinations3<X>(xs: Iterable<X>): IterableIterator<[X, X, X]> {
  let [as, bs, cs] = teeN(xs, 3);

  let bs2: Iterable<X>;
  let cs2: Iterable<X>;
  let i = 1;
  let j = 2;
  for (/*await*/ const a of as) {
    [bs, bs2] = tee(bs);
    for (/*await*/ const b of skip<X>(i++)(bs2)) {
      [cs, cs2] = tee(cs);
      for (/*await*/ const c of skip<X>(j++)(cs2)) {
        yield [a, b, c];
      }
    }
  }
}

export /*async*/ function* combinations(xs: Iterable<{}>, r: number = 2): IterableIterator<{}[]> {
  throw Error('Not implemented');
}

export /*async*/ function* constantly<X>(value: X): IterableIterator<X> {
  while (true) yield value;
}

export /*async*/ function* cycle<X>(xs: Iterable<X>): IterableIterator<X> {
  let xs2: Iterable<X>;
  while (true) {
    [xs, xs2] = tee(xs);
    for (/*await*/ const x of xs2) yield x;
  }
}

export /*async*/ function* repeat<X>(xs: Iterable<X>, n: number): IterableIterator<X> {
  let xs2: Iterable<X>;
  for (let i = 0; i < n; i++) {
    [xs, xs2] = tee(xs);
    for (/*await*/ const x of xs2) yield x;
  }
}

export /*async*/ function* interleave2<X, Y>(xs: Iterable<X>, ys: Iterable<Y>): IterableIterator<X | Y> {
  const itx = iterator(xs);
  const ity = iterator(ys);
  while (true) {
    const rx = /*await*/ itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = /*await*/ ity.next();
    if (ry.done) break;
    else yield ry.value;
  }
}

export /*async*/ function* interleave3<X, Y, Z>(
  xs: Iterable<X>,
  ys: Iterable<Y>,
  zs: Iterable<Z>,
): IterableIterator<X | Y | Z> {
  const itx = iterator(xs);
  const ity = iterator(ys);
  const itz = iterator(zs);
  while (true) {
    const rx = /*await*/ itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = /*await*/ ity.next();
    if (ry.done) break;
    else yield ry.value;
    const rz = /*await*/ itz.next();
    if (rz.done) break;
    else yield rz.value;
  }
}

export /*async*/ function* interleave(...xss: Iterable<{}>[]): IterableIterator<{}> {
  const its = xss.map(iterator);
  // Throwback to the 90s
  outerloop: while (true) {
    for (const it of its) {
      const { done, value } = /*await*/ it.next();
      // Yup, this just happened
      if (done) break outerloop;
      else yield value;
    }
  }
}
