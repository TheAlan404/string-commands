import { Command } from "./Command";
import { BaseContext } from "./Context";
import { Middleware, LastMiddlewareReturnType } from "./Middleware";
import { TypedEmitter } from "tiny-typed-emitter";

export interface CommandHandlerEvents<Context> {
    earlyReturn: (ctx: Context) => void,
}

export class CommandHandler<
    Context extends LastMiddlewareReturnType<MiddlewareTypes>,
    MiddlewareTypes extends Middleware<any, any>[] = [],
> extends TypedEmitter<CommandHandlerEvents<Context>> {
    commands: Map<string, Command<Context>> = new Map();
    middlewares: [...MiddlewareTypes] = [] as any;

    constructor() {
        super();
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
        return this;
    }

    async run(input: string) {
        let context: BaseContext = {
            handler: this,
            input,
        };

        for (let mw of this.middlewares) {
            let next = await mw.run(context);
            if(!next) {
                return;
            }
            context = next;
        }
    }
}
