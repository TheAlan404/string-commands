import { PlainObject } from "simplytyped";
import { ContextStatic, Inspect } from "./middlewares";
import { createPipeline } from "./Pipeline";
import { Middleware } from "./Middleware";


createPipeline(() => ({ a: 1 }))
    .pipe(ctx => ({ ...ctx, b: 2 }))
    .pipe(ContextStatic({ k: 1 }))
    .pipe((ctx) => ctx)
    .pipe(Inspect((ctx) => { ctx }))
    .execute
    

