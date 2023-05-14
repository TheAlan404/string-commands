import { Usage } from "./Usage";

export type ArgumentObject = {
    type?: string,
    [others: string]: any;
};

export type Argument = string | ArgumentObject | Usage<unknown, unknown>;