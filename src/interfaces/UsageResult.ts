export type UsageResult<T> = {
    fail: true,
    message?: string,
    [others: string]: any;
} | {
    fail: false | undefined,
    parsed: T,
} | T;