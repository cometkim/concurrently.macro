import concurrently from '../../../../concurrently.macro';

const A = Promise.resolve();
const B = (...args: any[]) => Promise.resolve();
const C = (args: any[]) => Promise.resolve();

concurrently(async () => {
  await A;
  const a1 = await A;
  const b1 = await B();
  const b2 = await B(a1);
  const c1 = await C([a1, b1]);
  const c2 = await C([b1, b2]);

  return [c1, c2];
});
