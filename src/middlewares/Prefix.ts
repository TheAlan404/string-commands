import { BaseContext } from "../Context";

export const Prefix = ({
    prefix = "!",
}: {
    prefix: string,
}) => (async <T extends BaseContext>(ctx: T): Promise<T> => {
    let { input } = ctx;

    if(!input.startsWith(prefix)) return;

    return {
        ...ctx,
        input: input.slice(prefix.length),
    };
});
