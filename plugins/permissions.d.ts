import { CommandHandlerMiddleware, BasicExecutorContext } from "../src/index";

type PermissionsOptions = {
    getPermissions?: (ctx: BasicExecutorContext) => Promise<string[]>,
    getPermissionsSource?: (ctx: BasicExecutorContext) => Promise<string[]>,
};

export type Permissions = (opts?: PermissionsOptions) => CommandHandlerMiddleware;

export type Permissions = {
    check: (required: string[] | string, posessed: string[] | string) => {
        passed: true,
    } | {
        passed: false,
        unmet: string[],
    };
    compare: (target: string, source: string) => boolean;
};