export type ArrayLast<T> = T extends [...infer _, ...infer Last] ? Last : never;

export type MaybePromise<T> = Promise<T> | T;
