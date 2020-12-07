const A = Promise.resolve();
const B = (...args: any[]) => Promise.resolve();

async () => {
  const { 1: a1 } = await Promise.all([A(), A()]);

  console.log("side-effect!");

  const a2 = await A();
  const b = await B(a1, a2);
}
