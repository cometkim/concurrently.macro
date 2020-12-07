import concurrently from '../../../../concurrently.macro';

type DeepObject = {
  a: {
    b: {
      c: [string, string],
      d: {
        value: string
      },
    },
  },
};

const deep = () => Promise.resolve({} as DeepObject);
const A = Promise.resolve();
const B = (...args: any[]) => Promise.resolve();

concurrently(async () => {
  const {
    a: {
      b: {
        c: [c1, c2],
        d: {
          value: value1,
        },
      },
    },
  } = await deep();
  await A;
  const b1 = await B(c1, c2);
  const b2 = await B(value1);
});
