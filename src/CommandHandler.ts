import { CommandHandlerOptions } from "./interfaces/CommandHandlerOptions";
import { ExecutorContext } from "./interfaces/ExecutorContext";
import Middleware from "./interfaces/Middleware";

class CommandHandler {
    middlewares: Middleware[] = [];

    constructor(opts?: CommandHandlerOptions) {

    }

    use(mw: Middleware | Middleware["run"] | (Middleware | Middleware["run"])[]): CommandHandler {
        if(Array.isArray(mw)) {
            for (const m of mw) {
                this.use(m);
            }
            return this;
        };

        if(typeof mw == "function") mw = {
            id: "anonymous " + this.middlewares.length,
            before: "run",
            run: mw,
        };

        this.middlewares.push(mw);

        return this;
    };

    async run(input: string, customContext: object) {
        let ctx: ExecutorContext = {
            handler: this,
            rawInput: input,
            input,
            ...customContext,
        };


    }
};

export {
    CommandHandler,
};