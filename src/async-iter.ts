import { asyncTee, asyncTeeN, forAwaitableIterator } from './common';

import { ForOfAwaitable } from './common';

export async function pipe(x: any, ...fs: Function[]): Promise<{}> {
  let res = x;
  for (const f of fs) res = await f(res);
  return res;
}

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

// export function concatWith1(ys) {
//     return function (xs) {
//         return concat(xs, ys);
//     }
// }

// export function concatWith(...yss) {
//     return function (xs) {
//         return concat(xs, ...yss);
//     };
// }

// export function zipWith1(ys) {
//     return function* (xs) {
//         const it = ys[Symbol.asyncIterator]();
//         for await (const x of xs) {
//             yield [x, (await it.next()).value];
//         }
//     };
// }

// export function zipWith(...yss) {
//     return function* (xs) {
//         const its = yss.map(ys => ys[Symbol.asyncIterator]());
//         for await (const x of xs) {
//             yield [x, ...its.map(it => it.next().value)];
//         }
//     };
// }

export function pluck<X>(key: string | number) {
  return async function*(xs: ForOfAwaitable<Object>): AsyncIterableIterator<X | null> {
    for await (const x of xs) yield x[key];
  };
}

export function unzip2<X, Y>() {
  return function(xs: ForOfAwaitable<[X, Y]>): [AsyncIterableIterator<X>, AsyncIterableIterator<Y>] {
    const [xs1, xs2] = asyncTee(xs);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2)];
  };
}

export function unzip3<X, Y, Z>() {
  return function(xs: ForOfAwaitable<[X, Y, Z]>): [AsyncIterableIterator<X>, AsyncIterableIterator<Y>, AsyncIterableIterator<Z>] {
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

export function mapKeys<A, B>(f: (k: A) => B) {
  return async function*(xs: ForOfAwaitable<[A, {}]>): AsyncIterableIterator<[B, {}]> {
    for await (const [k, v] of xs) yield [f(k), v];
  };
}

export function mapValues<A, B>(f: (v: A) => B) {
  return async function*(xs: ForOfAwaitable<[{}, A]>): AsyncIterableIterator<[{}, B]> {
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
  return async function(xs: ForOfAwaitable<X>): Promise<X | number> {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return Number.POSITIVE_INFINITY;
    let res = value;
    for await (const x of it) if (cf(x, res) < 0) res = x;
    return res;
  };
}

export function maxBy(cf = (a, b) => a - b) {
  return async function(xs) {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return Number.NEGATIVE_INFINITY;
    let res = value;
    for await (const x of it) if (cf(x, res) > 0) res = x;
    return res;
  };
}

export function minMaxBy(cf = (a, b) => a - b) {
  return async function(xs) {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) return [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let min = value;
    let max = value;
    for await (const x of it) {
      if (cf(x, min) < 0) min = x;
      if (cf(x, max) > 0) max = x;
    }
    return [min, max];
  };
}

export function minByScan(cf = (a, b) => a - b) {
  return async function*(xs) {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) yield Number.POSITIVE_INFINITY;
    let res = value;
    for await (const x of it)
      if (cf(x, res) < 0) {
        res = x;
        yield res;
      }
  };
}

export function maxByScan(cf = (a, b) => a - b) {
  return async function*(xs) {
    const it = forAwaitableIterator(xs);
    const { done, value } = await it.next();
    if (done) yield Number.NEGATIVE_INFINITY;
    let res = value;
    for await (const x of it)
      if (cf(x, res) > 0) {
        res = x;
        yield res;
      }
  };
}

export function sum(zero = 0) {
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

export function grouped<X>(n: number, step = n) {
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

// export function interleaveWith1(ys) {
//     return function (xs) {
//         return interleave2(xs, ys);
//     }
// }

// export function interleaveWith(...yss) {
//     return function (xs) {
//         return interleave(xs, ...yss);
//     }
// }

export function sort(cf) {
  return async function*(xs) {
    let arr = [];
    for await (const x of xs) arr.push(x);
    for (const x of arr.sort(cf)) yield x;
  };
}

export function sortScan(cf) {
  return async function*(xs) {
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

// export function distinctUntilChanged<X>(equals: (a: X, b: X) => boolean = (a, b) => a === b) {
//   return async function* (xs: ForOfAwaitable<X>): AsyncIterableIterator<X> {
//     let initial = Symbol();
//     for await (const x of xs) if (!equals(x, initial)) yield (initial = x);
//   };
// }

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

// TODO: generalize to n parameters
// export async function* product<A, B>(as: ForOfAwaitable<A>, bs: ForOfAwaitable<B>) {
//   if (as === bs) [as, bs] = asyncTee(as);

//   let bs2;
//   for await (const a of as) {
//     [bs, bs2] = asyncTee(bs);
//     for await (const b of bs2) {
//       yield [a, b];
//     }
//   }
// }

// TODO: generalize to n parameters
// TODO: other name (look at python itertools?)
// TODO: fix implementation
// export async function* combinations(xs) {
//   let [as, bs] = asyncTee(xs);

//   let bs2,
//     i = 1;
//   for await (const a of as) {
//     [bs, bs2] = asyncTee(bs);
//     for await (const b of skip(i++)(bs2)) {
//       yield [a, b];
//     }
//   }
// }

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
