import { ExtractOutputs, MiddlewareResolvable } from "./IO";
import { Middleware } from "./Middleware";

export type MiddlewareMixin<Requirements extends MiddlewareResolvable[], Provides> = Middleware<
    ExtractOutputs<Requirements>,
    ExtractOutputs<Requirements> & Provides
>;

export type Provider<T> = Middleware<unknown, T>;
export type Consumer<T> = Middleware<T, any>;
