import concurrently from '../../../../concurrently.macro';

const defer = <T>(value: T) => new Promise<T>(res => setTimeout(() => res(value), 1000));

const calc = concurrently(async () => {
  const a = await defer(1);
  const b = await defer(2);
  return a + b;
});
