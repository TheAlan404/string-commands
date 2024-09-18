import { Enum } from "@alan404/enum";
import { AnyMiddleware, Middleware, MiddlewareList } from "../middleware";

type ArrayLast<T> = T extends [...infer _, infer Last] ? Last : never;
type ArrayFirst<T> = T extends [infer First, ...infer _] ? First : never;
type ArraySliceFirst<T> = T extends [infer _, ...infer Tail] ? Tail : never;

export type Pipeline<Types extends any[]> = {
    middlwares: MiddlewareList<ArrayFirst<Types>, ArraySliceFirst<Types>>;
    pipe: <Next>(mw: Middleware<ArrayLast<Types>, Next>) =>
        Pipeline<[...Types, Next]>;
    execute: (initial: ArrayFirst<Types>) => Promise<ExecutionResult<ArrayLast<Types>>>;
    fire: (initial: ArrayFirst<Types>) => Pipeline<Types>;
}

export type ExecutionResult<T> = Enum<{
    success: T;
    cancelled: {
        middleware: AnyMiddleware;
    };
    error: {
        middleware: AnyMiddleware;
        error: Error;
    };
}>;

export const createPipeline = <
    Input,
    Output extends Input = Input,
>(mw: Middleware<Input, Output>): Pipeline<[Input, Output]> => {
    let pipeline = {
        middlwares: [mw],
        pipe: (next) => {
            pipeline.middlwares.push(next);
            return pipeline;
        },
        execute: async (initial: Input) => {
            let ctx = initial as any;
            for(let middleware of pipeline.middlwares) {
                let next: any;
                try {
                    next = await middleware(ctx);
                } catch(error) {
                    return ({
                        type: "error",
                        data: {
                            middleware,
                            error,
                        },
                    } as ExecutionResult<any>);
                }

                if(!next) return ({
                    type: "cancelled",
                    data: {
                        middleware,
                    },
                } as ExecutionResult<any>);

                ctx = next;
            }

            return ({
                type: "success",
                data: ctx,
            } as ExecutionResult<any>);
        },
        fire: (initial: Input) => {
            pipeline.execute(initial);
            return pipeline;
        },
    }

    return pipeline as Pipeline<[Input, Output]>;
};
