import { BaseCommand } from "./Command";
import { BaseContext } from "./Context";
import { Middleware, LastMiddlewareReturnType } from "./Middleware";
import { TypedEmitter } from "tiny-typed-emitter";

export interface CommandHandlerEvents<Context> {
    commandError: (err: Error, ctx: Context) => void,
    middlewareError: (err: Error, ctx: Context) => void,
}

export class CommandHandler<
    Context extends BaseContext = BaseContext,
    Command extends BaseCommand<Context> = BaseCommand<Context>,
> extends TypedEmitter<CommandHandlerEvents<Context>> {
    commands: Map<string, Command> = new Map();
    middlewares: Middleware<any, any>[] = [];

    constructor() {
        super();
    }

    use<T extends Context>(mw: Middleware<Context, T>): CommandHandler<T, Command> {
        this.middlewares.push(mw);
        // @ts-ignore
        return this;
    }

    add(cmd: Command) {
        this.commands.set(cmd.name, cmd);
        return this;
    }

    async run<T extends { input: string }>(ctx: T) {
        let context: BaseContext = {
            handler: this,
            ...ctx,
        };

        for (let mw of this.middlewares) {
            let next;
            try {
                next = await mw(context);
            } catch(err) {
                this.emit("middlewareError", err, context as Context);
                return;
            }
            if(!next) {
                return;
            }
            context = next;
        }
    }
}
