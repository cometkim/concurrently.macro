import concurrently, { sideEffect } from '../../../../concurrently.macro';

const A = () => Promise.resolve();
const B = (...args: any[]) => Promise.resolve();

concurrently(async () => {
  await A();
  const a1 = await A();

  console.log("side-effect!");
  sideEffect();

  const a2 = await A();
  const b = await B(a1, a2);
});
