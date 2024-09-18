import { PlainObject } from "simplytyped";
import { Middleware } from "../../../core";

export const Static = <
    T extends PlainObject,
    Input extends object,
>(obj: T): Middleware<Input, T & Input> => ((ctx) => ({
    ...ctx,
    ...obj,
}));
