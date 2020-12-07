const deep = () => Promise.resolve({});
const A = Promise.resolve();
const B = (...args) => Promise.resolve();

async () => {
  const {
    0: {
      a: {
        b: {
          c: [c1, c2],
          d: {
            value: value1,
          },
        },
      },
    },
  } = await Promise.all([deep(), A]);
  const { 0: b1, 1: b2 } = Promise.all([B(c1, c2), B(value1)]);
};
