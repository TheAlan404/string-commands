import { ExecutorContext } from "../interfaces/ExecutorContext";

export default class InternalError extends Error {
    ctx: ExecutorContext;

    constructor(ctx: ExecutorContext, message: string) {
        super(message);

        this.ctx = ctx;
    }
};