import Command from "./interfaces/Command";

export type MaybePromise<T> = Promise<T> | T;
export type Constructor<T extends {} = {}> = new (...args: any[]) => T;
export type MaybeCommand = Constructor<Command> | {default: Constructor<Command>} | {[k: string]: Constructor<Command>};
