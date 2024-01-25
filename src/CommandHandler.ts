import { Command } from "./Command";
import { BaseContext } from "./Context";
import { Middleware } from "./Middleware";

type LastMiddlewareReturnType<T extends Middleware<any, any>[]> = T extends [...infer _, infer Last] ? Last extends Middleware<any, infer R> ? R : BaseContext : BaseContext;
type InputOf<T extends Middleware<any, any>> = T extends Middleware<infer I, any> ? I : never;
type OutputOf<T extends Middleware<any, any>> = T extends Middleware<any, infer O> ? O : never;

export class CommandHandler<
    Context extends LastMiddlewareReturnType<MiddlewareTypes>,
    MiddlewareTypes extends Middleware<any, any>[] = [],
> {
    commands: Map<string, Command<Context>> = new Map();
    middlewares: [...MiddlewareTypes] = [] as any;

    constructor() {

    }

    use<T extends Context, U extends T>(mw: Middleware<T, U>):
        CommandHandler<
            LastMiddlewareReturnType<[...MiddlewareTypes, Middleware<T, U>]>,
            [...MiddlewareTypes, Middleware<T, U>]
        > {
        this.middlewares.push(mw);
        // TODO: i have no idea what i am doing but it kinda works?
        // @ts-ignore
        return this;
    }

    add(cmd: Command<Context>) {
        this.commands.set(cmd.name, cmd);
    }

    async run(input: string) {
        let context: BaseContext = {
            handler: this,
            input,
        };

        for (let mw of this.middlewares) {
            context = await mw.run(context);
            if(!context) return;
        }
    }
}
