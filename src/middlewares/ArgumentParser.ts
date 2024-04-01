import { CommandReplierCtx, CommandResolverCtx, SplitStringCtx } from ".";
import { BaseContext } from "..";
import { ParserStore } from "../Arguments";

export type ReplyInvalidUsage = {
    type: "invalidUsage",
    commandName: string,
};

export const ArgumentParser = <S extends ParserStore>(usages: S) => async <T extends BaseContext & CommandResolverCtx & CommandReplierCtx<ReplyInvalidUsage> & SplitStringCtx>() => {

};
