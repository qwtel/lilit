import { pipe, asyncTee, asyncTeeN, asyncIterator } from './common';

export { pipe };

// OPERATORS

export function map(f) {
  return async function*(xs) {
    for await (const x of xs) yield f(x);
  };
}

export function tap(f) {
  return async function*(xs) {
    for await (const x of xs) {
      f(x);
      yield x;
    }
  };
}

export const inspect = tap;

export function forEach(f) {
  return async function(xs) {
    for await (const x of xs) f(x);
  };
}

export const subscribe = forEach;

export function reduce(f, init) {
  return async function(xs) {
    let res = init;
    for await (const x of xs) {
      res = f(res, x);
    }
    return res;
  };
}

export function scan(f, init) {
  return async function*(xs) {
    let res = init;
    for await (const x of xs) {
      res = f(res, x);
      yield res;
    }
  };
}

export const reducutions = scan;

export function some(p) {
  return async function(xs) {
    for await (const x of xs) {
      if (p(x)) return true;
    }
    return false;
  };
}

export function every(p) {
  return async function(xs) {
    for await (const x of xs) {
      if (!p(x)) return false;
    }
    return true;
  };
}

export function filter(p) {
  return async function*(xs) {
    for await (const x of xs) {
      if (p(x)) yield x;
    }
  };
}

export function partition(p) {
  return function(xs) {
    const [xs1, xs2] = asyncTee(xs);
    return [filter(p)(xs1), filter(x => !p(x))(xs2)];
  };
}

export function skip(n) {
  return async function*(xs) {
    let i = 0;
    for await (const x of xs) {
      if (++i <= n) continue;
      yield x;
    }
  };
}

export function take(n) {
  return async function*(xs) {
    let i = 0;
    for await (const x of xs) {
      if (++i > n) break;
      yield x;
    }
  };
}

// TODO: rename?
export function splitAt(n) {
  return function(xs) {
    const [xs1, xs2] = asyncTee(xs);
    return [take(n)(xs1), skip(n)(xs2)];
  };
}

export function find(p) {
  return async function(xs) {
    for await (const x of xs) {
      if (p(x)) return x;
    }
    return null;
  };
}

export function findIndex(p) {
  return async function(xs) {
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

export function unzip2() {
  return function(xs) {
    const [xs1, xs2] = asyncTee(xs);
    return [pluck(0)(xs1), pluck(1)(xs2)];
  };
}

export function unzip(n = 2) {
  return function(xs) {
    const xss = asyncTeeN(xs, n);
    return xss.map((xs, i) => pluck(i)(xs));
  };
}

export function pluck(key) {
  return async function*(xs) {
    for await (const x of xs) yield x[key];
  };
}

// like pluck, but accepts an iterable of keys
export function select(keys) {
  return async function*(xs) {
    for await (const x of xs) {
      let r = x;
      for (const k of keys) {
        r = r != null ? r[k] : undefined;
      }
      yield r;
    }
  };
}

export function groupBy(f) {
  return async function(xs) {
    const res = new Map();
    for await (const x of xs) {
      const key = f(x);
      if (!res.has(key)) res.set(key, []);
      res.get(key).push(x);
    }
    return res;
  };
}

export function groupByKey(key) {
  return groupBy(x => x[key]);
}

export function mapKeys(f) {
  return async function*(xs) {
    for await (const [k, v] of xs) yield [f(k), v];
  };
}

export function mapValues(f) {
  return async function*(xs) {
    for await (const [k, v] of xs) yield [k, f(v)];
  };
}

export function pairwise() {
  return async function*(xs) {
    const it = asyncIterator(xs);
    let prev = (await it.next()).value;
    for await (const x of it) {
      yield [prev, x];
      prev = x;
    }
  };
}

export function length() {
  return async function(xs) {
    let c = 0;
    for await (const _ of xs) c++;
    return c;
  };
}

export function min() {
  return async function(xs) {
    let res = Number.POSITIVE_INFINITY;
    for await (const x of xs) {
      if (x < res) res = x;
    }
    return res;
  };
}

export function max() {
  return async function(xs) {
    let res = Number.NEGATIVE_INFINITY;
    for await (const x of xs) {
      if (x > res) res = x;
    }
    return res;
  };
}

export function minMax() {
  return async function(xs) {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for await (const x of xs) {
      if (x < min) min = x;
      if (x > max) max = x;
    }
    return [min, max];
  };
}

export function minBy(cf = (a, b) => a - b) {
  return async function(xs) {
    const it = asyncIterator(xs);
    const { done, value } = await it.next();
    if (done) return Number.POSITIVE_INFINITY;
    let res = value;
    for await (const x of it) if (cf(x, res) < 0) res = x;
    return res;
  };
}

export function maxBy(cf = (a, b) => a - b) {
  return async function(xs) {
    const it = asyncIterator(xs);
    const { done, value } = await it.next();
    if (done) return Number.NEGATIVE_INFINITY;
    let res = value;
    for await (const x of it) if (cf(x, res) > 0) res = x;
    return res;
  };
}

export function minMaxBy(cf = (a, b) => a - b) {
  return async function(xs) {
    const it = asyncIterator(xs);
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
    const it = asyncIterator(xs);
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
    const it = asyncIterator(xs);
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
  return async function(xs) {
    let res = zero;
    for await (const x of xs) res += x;
    return res;
  };
}

export function replaceWhen(pf, ys) {
  return async function*(xs) {
    for await (const [x, y] of zip(xs, ys)) {
      if (!pf(x)) yield x;
      else yield y;
    }
  };
}

export function grouped(n, step = n) {
  return async function*(xs) {
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

export function startWith(...as) {
  return async function*(xs) {
    for await (const a of as) yield a;
    for await (const x of xs) yield x;
  };
}

export function endWith(...zs) {
  return async function*(xs) {
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

// CONSTRUCTORS

export async function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
  for (let i = start; end > start ? i < end : i > end; i += step) yield i;
}

// TODO: rename to `entries`?
export async function* enumerate(xs) {
  let i = 0;
  for await (const x of xs) yield [i++, x];
}

export async function* concat(...xss) {
  for (const xs of xss) for await (const x of xs) yield x;
}

export async function* zip(...xss) {
  const its = xss.map(asyncIterator);
  while (true) {
    const rs = await Promise.all(its.map(it => it.next()));
    if (rs.some(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

// TODO: rename? Is this how regular zip commonly works?
export async function* zipOuter(...xss) {
  const its = xss.map(asyncIterator);
  while (true) {
    const rs = await Promise.all(its.map(it => it.next()));
    if (rs.every(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

// TODO: generalize to n parameters
export async function* product(as, bs) {
  if (as === bs) [as, bs] = asyncTee(as);

  let bs2;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of bs2) {
      yield [a, b];
    }
  }
}

// TODO: generalize to n parameters
// TODO: other name (look at python itertools?)
// TODO: fix implementation
export async function* combinations(xs) {
  let [as, bs] = asyncTee(xs);

  let bs2,
    i = 1;
  for await (const a of as) {
    [bs, bs2] = asyncTee(bs);
    for await (const b of skip(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export async function* constantly(value) {
  while (true) yield value;
}

export async function* cycle(xs) {
  let xs2;
  while (true) {
    [xs, xs2] = asyncTee(xs);
    for await (const x of xs2) yield x;
  }
}

export async function* repeat(xs, n) {
  let xs2;
  for (let i = 0; i < n; i++) {
    [xs, xs2] = asyncTee(xs);
    for await (const x of xs2) yield x;
  }
}

export async function* interleave2(xs, ys) {
  const itx = asyncIterator(xs);
  const ity = asyncIterator(ys);
  while (true) {
    const rx = await itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = await ity.next();
    if (ry.done) break;
    else yield ry.value;
  }
}

export async function* interleave(...xss) {
  const its = xss.map(asyncIterator);
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
