const A = Promise.resolve();

const B = (...args) => Promise.resolve();

const C = (args) => Promise.resolve();

async () => {
  let { 1: a1, 2: b1 } = await Promise.all([
    A,
    A,
    B(),
  ]);

  let { 0: b2, 1: c1 } = await Promise.all([
    B(a1),
    C([a1, b1]),
  ]);

  let c2 = await C([b1, b2]);

  return [c1, c2];
};
