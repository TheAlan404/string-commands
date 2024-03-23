import { BaseContext } from ".";
import { StringReader } from "./utils/StringReader";

export type ArgumentLike = Argument<any>;

export type Argument<
    S extends ParserStore,
    T extends keyof S = "string",
> = {
    type: T,
};

export interface ParserStore<Ctx extends BaseContext = BaseContext> {
    [key: string]: Parser<typeof this, typeof key, keyof typeof this | void, any, Ctx>; 
};

export type Parser<
    S extends ParserStore,
    Id extends string,
    T extends (keyof S | void),
    U,
    Ctx,
> = ExtendingArgumentParser<S, Id, T, U, Ctx> | ReaderArgumentParser<S, Id, U, Ctx>;

export type ExtendingArgumentParser<
    S extends ParserStore,
    Id extends string,
    T extends (keyof S | void),
    U,
    Ctx,
> = {
    id: Id,
    extends?: T,
    parse: (value: (ValueOf<S, T> & Ctx)) => Promise<U> | U,
};

export type ReaderArgumentParser<
    S extends ParserStore,
    Id extends string,
    U,
    Ctx,
> = {
    id: Id,
    read: (ctx: Ctx & { reader: StringReader }) => Promise<U> | U,
};

type ValueOf<S extends ParserStore, I extends (keyof S | void)> =
    I extends keyof S ? (
        S[I] extends Parser<S, infer Id, I, infer U, infer Ctx> ? U : never
    ) : (
        string
    );

export const DefaultParserTypes: ParserStore = {
    string: {
        id: "string",
        read({ reader }) {
            return reader.rest();
        },
    }
};
