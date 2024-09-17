import { middlewares } from ".";
import { BaseCommand } from "./Command";
import { BaseContext } from "./Context";
import { Middleware, LastMiddlewareReturnType, MiddlewareList } from "./Middleware";
import { TypedEmitter } from "tiny-typed-emitter";
import { TNamespace } from "./Namespace";

export interface CommandHandlerEvents<Context> {
    commandError: (err: Error, ctx: Context) => void,
    middlewareError: (err: Error, ctx: Context) => void,
}

export class CommandHandler<
    Namespace extends TNamespace = TNamespace,
> extends TypedEmitter<CommandHandlerEvents<TNamespace["context"]>> {
    commands: Map<string, Namespace["command"]> = new Map();
    middlewares: TNamespace["middlewares"] = [(x) => x];

    constructor() {
        super();
    }

    use<T extends Namespace["context"], U extends T>(mw: Middleware<T, U>):
        CommandHandler<TNamespace<[BaseContext, ...Namespace["middlewareTypes"], U]>>
    {
        // @ts-ignore
        this.middlewares.push(mw);
        // @ts-ignore
        return this;
    }

    add(cmd: Namespace["command"]) {
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
