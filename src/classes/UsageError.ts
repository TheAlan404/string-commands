import { ExecutorContext } from "../interfaces/ExecutorContext";

export default class UsageError extends Error {
    ctx: ExecutorContext;
    code: string;
    meta: any;

    constructor(ctx: ExecutorContext, code: string, meta: any) {
        super();

        this.ctx = ctx;
        this.code = code;
        this.meta = meta;
    }
};