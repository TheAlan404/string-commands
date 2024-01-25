export interface Command<Context> {
    name: string,
    description?: string,
    run: (ctx: Context, args: any[]) => Promise<void> | void,
}


