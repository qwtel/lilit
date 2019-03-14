import { asyncTee, asyncTeeN, forAwaitableIterator } from './common';

import { ForOfAwaitable } from './common';

// OPERATORS

export function map<A, B>(f: (x: A) => B) {
  return async function*(xs: ForOfAwaitable<A>): AsyncIterableIterator<B> {
    for await (const x of xs) yield f(x);
  };
}

export function tap<X>(f: (x: X) => any) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    for await (const x of xs) {
      f(x);
      yield x;
    }
  };
}

export const inspect = tap;

export function forEach<X>(f: (x: X) => any) {
  return async function(xs: ForOfAwaitable<X>): Promise<void> {
    for await (const x of xs) f(x);
  };
}

export const subscribe = forEach;

export function reduce<X, R>(f: (acc: R, x: X) => R, init: R) {
  return async function(xs: ForOfAwaitable<X>): Promise<R> {
    let res = init;
    for await (const x of xs) {
      res = f(res, x);
    }
    return res;
  };
}

export function scan<X, R>(f: (acc: R, x: X) => R, init: R) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<R> {
    let res = init;
    for await (const x of xs) {
      res = f(res, x);
      yield res;
    }
  };
}

export const reducutions = scan;

export function some<X>(p: (x: X) => boolean) {
  return async function(xs: ForOfAwaitable<X>): Promise<boolean> {
    for await (const x of xs) {
      if (p(x)) return true;
    }
    return false;
  };
}

export function every<X>(p: (x: X) => boolean) {
  return async function(xs: ForOfAwaitable<X>): Promise<boolean> {
    for await (const x of xs) {
      if (!p(x)) return false;
    }
    return true;
  };
}

export function filter<X>(p: (x: X) => boolean) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    for await (const x of xs) {
      if (p(x)) yield x;
    }
  };
}

export function partition<X>(p: (x: X) => boolean) {
  return function(xs: ForOfAwaitable<X>): [AsyncIterableIterator<X>, AsyncIterableIterator<X>] {
    const [xs1, xs2] = asyncTee(xs);
    return [filter(p)(xs1), filter((x: X) => !p(x))(xs2)];
  };
}

export function skip<X>(n: number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    let i = 0;
    for await (const x of xs) {
      if (++i <= n) continue;
      yield x;
    }
  };
}

export function take<X>(n: number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    let i = 0;
    for await (const x of xs) {
      if (++i > n) break;
      yield x;
    }
  };
}

// TODO: rename?
export function partitionAt<X>(n: number) {
  return function(xs: ForOfAwaitable<X>): [AsyncIterableIterator<X>, AsyncIterableIterator<X>] {
    const [xs1, xs2] = asyncTee(xs);
    return [take<X>(n)(xs1), skip<X>(n)(xs2)];
  };
}

export const splitAt = partitionAt;

export function skipWhile<X>(f: (x: X) => boolean) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    const it = forAwaitableIterator(xs);
    let first: X;
    for await (const x of it) {
      first = x;
      if (!f(x)) break;
    }
    yield first;
    for await (const x of it) yield x;
  };
}

export function takeWhile<X>(f: (x: X) => boolean) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    for await (const x of xs) {
      if (f(x)) yield x;
      else break;
    }
  };
}

export function partitionWhile<X>(f: (x: X) => boolean) {
  return function(xs: ForOfAwaitable<X>): [AsyncIterableIterator<X>, AsyncIterableIterator<X>] {
    const [xs1, xs2] = asyncTee(xs);
    return [takeWhile<X>(f)(xs1), skipWhile<X>(f)(xs2)];
  };
}

export function find<X>(p: (x: X) => boolean) {
  return async function(xs: ForOfAwaitable<X>): Promise<X | null> {
    for await (const x of xs) {
      if (p(x)) return x;
    }
    return null;
  };
}

export function findIndex<X>(p: (x: X) => boolean) {
  return async function(xs: ForOfAwaitable<X>): Promise<number> {
    let i = 0;
    for await (const x of xs) {
      if (p(x)) return i;
      i++;
    }
    return -1;
  };
}

export function pluck<X>(key: string | number) {
  return async function*(xs: ForOfAwaitable<Object>): AsyncIterableIterator<X | null> {
    for await (const x of xs) yield x[key];
  };
}

// like pluck, but accepts an iterable of keys
export function select<X>(keys: Array<string | number>) {
  return async function*(xs: ForOfAwaitable<Object>): AsyncIterableIterator<X | null> {
    for await (const x of xs) {
      let r = x;
      for (const k of keys) {
        r = r != null ? r[k] : undefined;
      }
      yield r as (X | null);
    }
  };
}

export function unzip2<X, Y>() {
  return function(xs: ForOfAwaitable<[X, Y]>): [AsyncIterableIterator<X>, AsyncIterableIterator<Y>] {
    const [xs1, xs2] = asyncTee(xs);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2)];
  };
}

export function unzip3<X, Y, Z>() {
  return function(
    xs: ForOfAwaitable<[X, Y, Z]>,
  ): [AsyncIterableIterator<X>, AsyncIterableIterator<Y>, AsyncIterableIterator<Z>] {
    const [xs1, xs2, xs3] = asyncTeeN(xs, 3);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2), pluck<Z>(2)(xs3)];
  };
}

export function unzip(n: number = 2) {
  return function(xs: ForOfAwaitable<{}[]>): AsyncIterableIterator<{}>[] {
    const xss = asyncTeeN(xs, n);
    return xss.map((xs, i) => pluck(i)(xs));
  };
}

export function groupBy<X, K>(f: (x: X) => K) {
  return async function(xs: ForOfAwaitable<X>): Promise<Map<K, X[]>> {
    const res = new Map<K, X[]>();
    for await (const x of xs) {
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
  return async function*(xs: ForOfAwaitable<[A, U]>): AsyncIterableIterator<[B, U]> {
    for await (const [k, v] of xs) yield [f(k), v];
  };
}

export function mapValues<A, B, U>(f: (v: A) => B) {
  return async function*(xs: ForOfAwaitable<[U, A]>): AsyncIterableIterator<[U, B]> {
    for await (const [k, v] of xs) yield [k, f(v)];
  };
}

export function pairwise<X>() {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X]> {
    const it = forAwaitableIterator(xs);
    let prev = (await it.next()).value;
    for await (const x of it) {
      yield [prev, x];
      prev = x;
    }
  };
}

export function length() {
  return async function(xs: ForOfAwaitable<{}>): Promise<number> {
    let c = 0;
    for await (const _ of xs) c++;
    return c;
  };
}

export function min() {
  return async function(xs: ForOfAwaitable<number>): Promise<number> {
    let res = Number.POSITIVE_INFINITY;
    for await (const x of xs) {
      if (x < res) res = x;
    }
    return res;
  };
}

export function max() {
  return async function(xs: ForOfAwaitable<number>): Promise<number> {
    let res = Number.NEGATIVE_INFINITY;
    for await (const x of xs) {
      if (x > res) res = x;
    }
    return res;
  };
}

export function minMax() {
  return async function(xs: ForOfAwaitable<number>): Promise<[number, number]> {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for await (const x of xs) {
      if (x < min) min = x;
      if (x > max) max = x;
    }
    return [min, max];
  };
}

export function minBy<X>(cf: (a: X, b: X) => number) {
  return async function(xs: ForOfAwaitable<X>): Promise<X | null> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return null;
    let res = value;
    for await (const x of it) if (cf(x, res) < 0) res = x;
    return res;
  };
}

export function maxBy<X>(cf: (a: X, b: X) => number) {
  return async function(xs: ForOfAwaitable<X>): Promise<X | null> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return null;
    let res = value;
    for await (const x of it) if (cf(x, res) > 0) res = x;
    return res;
  };
}

export function minMaxBy<X>(cf: (a: X, b: X) => number) {
  return async function(xs: ForOfAwaitable<X>): Promise<[X | null, X | null]> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return [null, null];
    let min = value;
    let max = value;
    for await (const x of it) {
      if (cf(x, min) < 0) min = x;
      if (cf(x, max) > 0) max = x;
    }
    return [min, max];
  };
}

export function minByScan<X>(cf: (a: X, b: X) => number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X | null> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) yield null;
    let res = value;
    for await (const x of it) {
      if (cf(x, res) < 0) res = x;
      yield res;
    }
  };
}

export function maxByScan<X>(cf: (a: X, b: X) => number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X | null> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) yield null;
    let res = value;
    for await (const x of it) {
      if (cf(x, res) > 0) res = x;
      yield res;
    }
  };
}

export function sum(zero: number = 0) {
  return async function(xs: ForOfAwaitable<number>): Promise<number> {
    let res = zero;
    for await (const x of xs) res += x;
    return res;
  };
}

export function replaceWhen<X, Y>(pf: (x: X) => boolean, ys: ForOfAwaitable<Y>) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X | Y> {
    for await (const [x, y] of zip2(xs, ys)) {
      if (!pf(x)) yield x;
      else yield y;
    }
  };
}

export function grouped<X>(n: number, step: number = n) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X[]> {
    let group = [];
    for await (const x of xs) {
      group.push(x);
      if (group.length === n) {
        yield [...group];
        for (let i = 0; i < step; i++) group.shift();
      }
    }
  };
}

export function startWith<X>(...as: X[]) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    for await (const a of as) yield a;
    for await (const x of xs) yield x;
  };
}

export function endWith<X>(...zs: X[]) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    for await (const x of xs) yield x;
    for await (const z of zs) yield z;
  };
}

export function sort<X>(cf: (a: X, b: X) => number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    let arr = [];
    for await (const x of xs) arr.push(x);
    for (const x of arr.sort(cf)) yield x;
  };
}

export function sortScan<X>(cf: (a: X, b: X) => number) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X[]> {
    let arr = [];
    for await (const x of xs) {
      arr.push(x);
      yield [...arr.sort(cf)];
    }
  };
}

export function flatMap<A, B>(f: (x: A) => B) {
  return async function*(xss: ForOfAwaitable<ForOfAwaitable<A>>): AsyncIterableIterator<B> {
    for await (const xs of xss) for await (const x of xs) yield await f(x);
  };
}

export function distinctUntilChanged<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    const it = forAwaitableIterator(xs);
    let { done, value: initial } = await it.next();
    if (done) return;
    yield initial;
    for await (const x of it) if (!comp(x, initial)) yield (initial = x);
  };
}

export function unique<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    const arr = [];
    for await (const x of xs) arr.push(x);
    const unq = arr.filter((x, i, self) => self.findIndex(y => comp(x, y)) === i);
    for (const u of unq) yield u;
  };
}

export function uniqueSorted<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return async function*(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
    const arr = [];
    for await (const x of xs) arr.push(x);
    arr.sort();
    for await (const x of distinctUntilChanged(comp)(arr)) yield x;
  };
}

// CONSTRUCTORS

export async function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): AsyncIterableIterator<number> {
  for (let i = start; end > start ? i < end : i > end; i += step) yield i;
}

// TODO: rename to `entries`?
export async function* enumerate<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[number, X]> {
  let i = 0;
  for await (const x of xs) yield [i++, x];
}

export async function* concat<X>(...xss: ForOfAwaitable<X>[]): AsyncIterableIterator<X> {
  for (const xs of xss) for await (const x of xs) yield x;
}

export const chain = concat;

export async function* zip2<X, Y>(xs: ForOfAwaitable<X>, ys: ForOfAwaitable<Y>): AsyncIterableIterator<[X, Y]> {
  const xit = forAwaitableIterator(xs);
  const yit = forAwaitableIterator(ys);
  while (true) {
    const [xr, yr] = await Promise.all([xit.next(), yit.next()]);
    if (xr.done || yr.done) break;
    yield [xr.value, yr.value];
  }
}

export async function* zip3<X, Y, Z>(
  xs: ForOfAwaitable<X>,
  ys: ForOfAwaitable<Y>,
  zs: ForOfAwaitable<Z>,
): AsyncIterableIterator<[X, Y, Z]> {
  const xit = forAwaitableIterator(xs);
  const yit = forAwaitableIterator(ys);
  const zit = forAwaitableIterator(zs);
  while (true) {
    const [xr, yr, zr] = await Promise.all([xit.next(), yit.next(), zit.next()]);
    if (xr.done || yr.done || zr.done) break;
    yield [xr.value, yr.value, zr.value];
  }
}

export async function* zip(...xss: ForOfAwaitable<{}>[]): AsyncIterableIterator<{}[]> {
  const its = xss.map(forAwaitableIterator);
  while (true) {
    const rs = await Promise.all(its.map(it => it.next()));
    if (rs.some(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

// TODO: rename? Is this how regular zip commonly works?
export async function* zipOuter(...xss: ForOfAwaitable<{}>[]): AsyncIterableIterator<{}[]> {
  const its = xss.map(forAwaitableIterator);
  while (true) {
    const rs = await Promise.all(its.map(it => it.next()));
    if (rs.every(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

export async function* product2<A, B>(as: ForOfAwaitable<A>, bs: ForOfAwaitable<B>): AsyncIterableIterator<[A, B]> {
  // if (as === bs) [as, bs] = asyncTee(as);
  let bs2: ForOfAwaitable<B>;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of bs2) {
      yield [a, b];
    }
  }
}

export async function* product3<A, B, C>(
  as: ForOfAwaitable<A>,
  bs: ForOfAwaitable<B>,
  cs: ForOfAwaitable<C>,
): AsyncIterableIterator<[A, B, C]> {
  // if (as === bs) [as, bs] = asyncTee(as);
  // if (as === cs) [as, cs] = asyncTee(as);
  // if (bs === cs) [bs, cs] = asyncTee(bs);
  let bs2: ForOfAwaitable<B>;
  let cs2: ForOfAwaitable<C>;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of bs2) {
      [cs, cs2] = asyncTee(cs);
      for await (const c of cs2) {
        yield [a, b, c];
      }
    }
  }
}

// TODO: generalize to n parameters
export async function* product(xs: ForOfAwaitable<{}>, ...xss: ForOfAwaitable<{}>[]): AsyncIterableIterator<{}[]> {
  throw new Error('Not implemented');
}

// TODO: other name (look at python itertools?)
// TODO: fix implementation
export async function* combinations2<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X]> {
  let [as, bs] = asyncTee(xs);

  let bs2: ForOfAwaitable<X>;
  let i = 1;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of skip<X>(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export async function* combinations3<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X, X]> {
  throw Error('Not implemented');
  // let [as, bs, cs] = asyncTeeN(xs, 3);

  // let bs2: ForOfAwaitable<X>;
  // let cs2: ForOfAwaitable<X>;
  // let i = 1;
  // let j = 2;
  // for await (const a of as) {
  //   [bs, bs2] = asyncTee(bs);
  //   for await (const b of skip<X>(i++)(bs2)) {
  //     [cs, cs2] = asyncTee(cs);
  //     for await (const c of skip<X>(j++)(cs2)) {
  //       yield [a, b, c];
  //     }
  //   }
  // }
}

export async function* combinations(xs: ForOfAwaitable<{}>, r: number = 2): AsyncIterableIterator<{}[]> {
  throw Error('Not implemented');
}

export async function* combinationsWithReplacement2<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X]> {
  let [as, bs] = asyncTee(xs);

  let bs2: ForOfAwaitable<X>;
  let i = 0;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of skip<X>(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export async function* combinationsWithReplacement3<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X, X]> {
  throw Error('Not implemented');
  // let [as, bs, cs] = asyncTeeN(xs, 3);

  // let bs2: ForOfAwaitable<X>;
  // let cs2: ForOfAwaitable<X>;
  // let i = 0;
  // let j = 0;
  // for await (const a of as) {
  //   [bs, bs2] = asyncTee(bs);
  //   for await (const b of skip<X>(i++)(bs2)) {
  //     [cs, cs2] = asyncTee(cs);
  //     for await (const c of skip<X>(j++)(cs2)) {
  //       yield [a, b, c];
  //     }
  //   }
  // }
}

export async function* combinationsWithReplacement(xs: ForOfAwaitable<{}>, r: number = 2): AsyncIterableIterator<{}[]> {
  throw Error('Not implemented');
}

export async function* permutations2<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X]> {
  throw Error('Not implemented');
}

export async function* permutations3<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<[X, X, X]> {
  throw Error('Not implemented');
}

export async function* permutations(xs: ForOfAwaitable<{}>, r: number = 2): AsyncIterableIterator<{}[]> {
  throw Error('Not implemented');
}

export async function* constantly<X>(value: X): AsyncIterableIterator<X> {
  while (true) yield value;
}

export async function* cycle<X>(xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
  let xs2: ForOfAwaitable<X>;
  while (true) {
    [xs, xs2] = asyncTee(xs);
    for await (const x of xs2) yield x;
  }
}

export async function* repeat<X>(xs: ForOfAwaitable<X>, n: number): AsyncIterableIterator<X> {
  let xs2: ForOfAwaitable<X>;
  for (let i = 0; i < n; i++) {
    [xs, xs2] = asyncTee(xs);
    for await (const x of xs2) yield x;
  }
}

export async function* interleave2<X, Y>(xs: ForOfAwaitable<X>, ys: ForOfAwaitable<Y>): AsyncIterableIterator<X | Y> {
  const itx = forAwaitableIterator(xs);
  const ity = forAwaitableIterator(ys);
  while (true) {
    const rx = await itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = await ity.next();
    if (ry.done) break;
    else yield ry.value;
  }
}

export async function* interleave3<X, Y, Z>(
  xs: ForOfAwaitable<X>,
  ys: ForOfAwaitable<Y>,
  zs: ForOfAwaitable<Z>,
): AsyncIterableIterator<X | Y | Z> {
  const itx = forAwaitableIterator(xs);
  const ity = forAwaitableIterator(ys);
  const itz = forAwaitableIterator(zs);
  while (true) {
    const rx = await itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = await ity.next();
    if (ry.done) break;
    else yield ry.value;
    const rz = await itz.next();
    if (rz.done) break;
    else yield rz.value;
  }
}

export async function* interleave(...xss: ForOfAwaitable<{}>[]): AsyncIterableIterator<{}> {
  const its = xss.map(forAwaitableIterator);
  // Throwback to the 90s
  outerloop: while (true) {
    for (const it of its) {
      const { done, value } = await it.next();
      // Yup, this just happened
      if (done) break outerloop;
      else yield value;
    }
  }
}

// https://github.com/Microsoft/TypeScript/issues/17718#issuecomment-402931751
export async function pipe<T1>(x: T1): Promise<T1>;
export async function pipe<T1, T2>(x: T1, f1: (x: T1) => T2): Promise<T2>;
export async function pipe<T1, T2, T3>(x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3): Promise<T3>;
export async function pipe<T1, T2, T3, T4>(x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4): Promise<T4>;
export async function pipe<T1, T2, T3, T4, T5>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
): Promise<T5>;
export async function pipe<T1, T2, T3, T4, T5, T6>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
): Promise<T6>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
): Promise<T7>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
): Promise<T8>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9,
): Promise<T9>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9,
  f9: (x: T9) => T10,
): Promise<T10>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9,
  f9: (x: T9) => T10,
  f10: (x: T10) => T11,
): Promise<T11>;
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
  x: T1,
  f1: (x: T1) => T2,
  f2: (x: T2) => T3,
  f3: (x: T3) => T4,
  f4: (x: T4) => T5,
  f5: (x: T5) => T6,
  f6: (x: T6) => T7,
  f7: (x: T7) => T8,
  f8: (x: T8) => T9,
  f9: (x: T9) => T10,
  f10: (x: T10) => T11,
  f11: (x: T11) => T12,
): Promise<T12>;

export async function pipe(x: any, ...fs: Function[]): Promise<any> {
  let res = x;
  for (const f of fs) res = await f(res);
  return res;
}