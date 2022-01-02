import concurrently from '../../../../concurrently.macro';

const A = () => Promise.resolve();
const B = (...args: any[]) => Promise.resolve();

concurrently(sideEffect => async () => {
  await A();
  const a1 = await A();

  console.log("side-effect!");
  sideEffect();

  const a2 = await A();
  const a3 = await B(a1, a2);
});
