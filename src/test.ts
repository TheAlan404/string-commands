import { Inspect } from "./builtin/middlewares";
import { createPipeline } from "./core";

let piper = createPipeline<number>(x => x * 2)
    .pipe(x => x + 1)
    .pipe(x => x.toString())
    .pipe(x => `Output: ${x}`)
    .pipe(Inspect());


Promise.all([
    piper.execute(2),
    piper.execute(3),
]).then(r => console.log(r));


