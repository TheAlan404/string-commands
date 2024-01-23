export interface Command<Context> {
    name: string,
    description: string,
    run: (ctx: Context, args: any[]) => PromiseLike<void>,
}


