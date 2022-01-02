const deepObject = () => Promise.resolve({});
const deepArray = () => Promise.resolve({});
const A = Promise.resolve();
const B = (...args) => Promise.resolve();

async () => {
  let {
    0: {
      a: {
        b: {
          c: [s1, s2],
          d: { value: s3 },
        },
      },
    },
    1: [s4, n1],
  } = await Promise.all([deepObject(), deepArray(), A]);
  let { 0: b1, 1: b2, 2: b4 } = await Promise.all([B(s1, s2), B(s3, s4), B(n1)]);
  let b3 = await B(b1);
};
