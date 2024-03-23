export interface BaseCommand<
    Context,
    Args = [],
> {
    name?: string,
    description?: string,
    run?: (ctx: Context, args: any[]) => Promise<void> | void,
    subcommands?: Record<string, BaseCommand<Context>>,
}


