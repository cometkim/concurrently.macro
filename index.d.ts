interface AsyncFunction {
  (...args: any[]): Promise<any>;
}

type SideEffectFn = () => void;

export default function concurrently<T extends AsyncFunction>(func: (effect: SideEffectFn) => T, concurrency?: number): T;
export default function concurrently<T extends AsyncFunction>(func: T, concurrency?: number): T;
