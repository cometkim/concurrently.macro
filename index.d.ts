interface AsyncFunction {
  (...args: any[]): Promise<any>;
}

function macro<T extends AsyncFunction>(func: T): T;
export default macro;
