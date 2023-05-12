import Usage from "../interfaces/Usage";

type TextUsageOptions = Partial<{
    max: number,
    min: number,
    regex: RegExp,
}>;

const TextUsage: Usage<string, TextUsageOptions> = {
    parse(ctx) {
        let str = ctx.reader.readUntil(" ");
        if(ctx.options.max && str.length > ctx.options.max) 
    },
};

export {
    TextUsage,
    TextUsageOptions,
};