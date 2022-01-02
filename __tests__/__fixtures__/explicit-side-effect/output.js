const A = () => Promise.resolve();

const B = (...args) => Promise.resolve();

async () => {
  let { 1: a1 } = await Promise.all([A(), A()]);
  console.log("side-effect!");
  let a2 = await A();
  let a3 = await B(a1, a2);
};
