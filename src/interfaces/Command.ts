import { MaybePromise } from "../types";

export default interface Command {
    name: string,
    run(): MaybePromise<any>,
};

export interface CommandArgs {
    args: any[],
};