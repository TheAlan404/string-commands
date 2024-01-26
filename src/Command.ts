export interface Command<
    Context,
    Args = [],
> {
    name?: string,
    description?: string,
    run?: (ctx: Context, args: any[]) => Promise<void> | void,
    subcommands?: Record<string, Command<Context>>,
}


