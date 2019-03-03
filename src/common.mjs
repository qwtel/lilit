export function pipe(x, ...fs) {
    let res = x;
    for (const f of fs) res = f(res);
    return res;
}

export function iterator(xs) {
    return xs[Symbol.iterator]();
}

export function asyncIterator(xs) {
    return xs[Symbol.asyncIterator] ? xs[Symbol.asyncIterator]() : xs[Symbol.iterator]();
}

export function isIterator(xs) {
    // By convention, an iterator returns itself when calling `Symbol.iterator`.
    return iterator(xs) === xs;
}

export function isAsyncIterator(xs) {
    return asyncIterator(xs) === xs;
}

// https://stackoverflow.com/a/46416353/870615
export function tee(it) {
    // If `it` is not an iterator, i.e. can be traversed more than once, 
    // we just return it unmodified.
    if (!isIterator(it)) return [it, it];

    const source = it[Symbol.iterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = i => {
        if (buffers[i].length) return buffers[i].shift();
        const x = source.next();
        if (x.done) return DONE;
        buffers[1 - i].push(x.value);
        return x.value;
    };

    return buffers.map(function* (_, i) {
        while (true) {
            const x = next(i);
            if (x === DONE) break;
            yield x;
        }
    });
}

export function asyncTee(it) {
    if (!isAsyncIterator(it)) return [it, it];

    const source = it[Symbol.asyncIterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = async i => {
        if (buffers[i].length) return buffers[i].shift();
        const x = await source.next();
        if (x.done) return DONE;
        buffers[1 - i].push(x.value);
        return x.value;
    };

    return buffers.map(async function* (_, i) {
        while (true) {
            const x = await next(i);
            if (x === DONE) break;
            yield x;
        }
    });
}

// TODO: more performant impl?
export function teeN(it, n = 2) {
    const res = [];
    let orig = it, copy;
    for (let i = 0; i < n - 1; i++) {
        [orig, copy] = tee(orig);
        res.push(copy);
    }
    res.push(orig);
    return res;
}

export function asyncTeeN(it, n = 2) {
    const res = [];
    let orig = it, copy;
    for (let i = 0; i < n - 1; i++) {
        [orig, copy] = asyncTee(orig);
        res.push(copy);
    }
    res.push(orig);
    return res;
}