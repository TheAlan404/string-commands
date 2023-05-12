export type ArgumentObject = {
    type?: string,
    [others: string]: any;
};
export type Argument = string | ArgumentObject;