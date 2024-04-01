import { BaseContext } from "../Context";

export const MultiPrefix = ({
    prefixes = ["!"],
}: {
    prefixes: string[],
}) => (async <T extends BaseContext>(ctx: T): Promise<T> => {
    let { input } = ctx;

    if(!prefixes.some(p => input.startsWith(p))) return;

    return {
        ...ctx,
        input: input.slice(prefixes.find(p => input.startsWith(p)).length),
    };
});
