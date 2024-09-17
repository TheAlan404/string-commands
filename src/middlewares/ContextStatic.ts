import { CombineObjects, PlainObject } from "simplytyped";
import { Middleware } from "../Middleware";

export const ContextStatic = <
    T extends PlainObject,
    Input extends object,
>(obj: T): Middleware<Input, CombineObjects<Input, T>> => ((ctx) => ({
    ...ctx,
    ...obj,
}));
