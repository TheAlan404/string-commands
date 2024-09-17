import { BaseCommand } from "./Command";
import { BaseContext } from "./Context";
import { ArrayLast } from "./utils";

export interface TNamespace<
    MiddlewareTypes extends any[] = any[],
    TCommand extends BaseCommand<ArrayLast<MiddlewareTypes>> = BaseCommand<ArrayLast<MiddlewareTypes>>,
> {
    middlewareTypes: MiddlewareTypes,
    middlewares: MiddlewareList<MiddlewareTypes>,
    context: ArrayLast<MiddlewareTypes>,
    command: TCommand,
}
