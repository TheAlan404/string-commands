import { BaseCommand } from "./Command";
import { BaseContext } from "./Context";
import { Middleware, LastMiddlewareReturnType } from "./Middleware";
import { TypedEmitter } from "tiny-typed-emitter";

export interface CommandHandlerEvents<Context> {
    earlyReturn: (ctx: Context, id: string) => void,
    commandError: (err: Error, ctx: Context) => void,
    middlewareError: (err: Error, ctx: Context, id: string) => void,
}

export class CommandHandler<
    Context extends BaseContext & LastMiddlewareReturnType<MiddlewareTypes>,
    MiddlewareTypes extends Middleware<any, any>[] = [],
    Command extends BaseCommand<Context> = BaseCommand<Context>,
> extends TypedEmitter<CommandHandlerEvents<Context>> {
    commands: Map<string, Command> = new Map();
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

    getMiddleware<Id extends MiddlewareTypes[number]["id"]>(id: Id): MiddlewareTypes[number] {
        // @ts-ignore
        return this.middlewares.find(mw => mw.id == id);
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
                next = await mw.run(context);
            } catch(err) {
                this.emit("middlewareError", err, context as Context, mw.id);
                return;
            }
            if(!next) {
                this.emit("earlyReturn", context as Context, mw.id);
                return;
            }
            context = next;
        }
    }
}
