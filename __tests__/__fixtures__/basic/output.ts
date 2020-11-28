const defer = (value) =>
  new Promise((res) => setTimeout(() => res(value), 1000));

const calc = async () => {
  const { 0: a, 1: b } = await Promise.all([defer(1), defer(2)]);
  return a + b;
};
