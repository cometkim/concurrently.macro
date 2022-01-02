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

type DeepArray = [
  string,
  number,
];

const deepObject = () => Promise.resolve({} as DeepObject);
const deepArray = () => Promise.resolve({} as DeepArray);
const A = Promise.resolve();
const B = (...args: any[]) => Promise.resolve();

concurrently(async () => {
  const {
    a: {
      b: {
        c: [s1, s2],
        d: {
          value: s3,
        },
      },
    },
  } = await deepObject();
  const [s4, n1] = await deepArray();

  await A;
  const b1 = await B(s1, s2);
  const b2 = await B(s3, s4);
  const b3 = await B(b1);
  const b4 = await B(n1);
});
