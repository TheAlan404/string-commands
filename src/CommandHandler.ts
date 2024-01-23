import { Command } from "./Command";
import { BaseContext } from "./Context";
import { Middleware } from "./Middleware";

export class CommandHandler<Context extends BaseContext> {
    commands: Map<string, Command<Context>> = new Map();
    middlewares: Middleware<Context>[] = [];

    constructor() {

    }

    use(mw: Middleware<Context>) {
        this.middlewares.push(mw);
    }

    add(cmd: Command<Context>) {
        this.commands.set(cmd.name, cmd);
    }

    run(input: string, ctx: Context) {
        let baseCtx: BaseContext = {
            handler: this,
            input,
        };

        let context: Context = {
            ...baseCtx,
            ...ctx,
        };

        for (let mw of this.middlewares) {
            context = await mw.run(context);
        }
    }
}
