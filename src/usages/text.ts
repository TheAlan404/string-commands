import { ExecutorContext } from "../interfaces/ExecutorContext";
import { Usage, ValueContext } from "../interfaces/Usage";

type TextUsageOptions = Partial<{
    max: number,
    min: number,
    regex: RegExp,
}>;

let quotes = [`"`, `'`];

const TextUsage: Usage<string, TextUsageOptions> = {
    read(ctx) {
        let q = ctx.reader.peekChar();
        if(quotes.includes(q)) {
            q = ctx.reader.readChar();
            let str = ctx.reader.readUntil(q);
            ctx.reader.readChar();
            return str;
        } else {
            return ctx.reader.readUntil(" ");
        };
    },
    // thanks typescript
    parse<T>(ctx: ValueContext<T extends string ? T : never, TextUsageOptions>) {
        let str = ctx.value;

        if(ctx.options.max && str.length > ctx.options.max) ctx.throw("TOO_LONG");
        if(ctx.options.min && str.length < ctx.options.min) ctx.throw("TOO_SHORT");
        if(ctx.options.regex && !ctx.options.regex.test(str)) ctx.throw("REGEX_MISMATCH");

        return str;
    },
};

export {
    TextUsage,
    TextUsageOptions,
};