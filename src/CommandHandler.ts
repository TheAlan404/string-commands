import { CommandHandlerOptions } from "./interfaces/CommandHandlerOptions";
import Middleware from "./interfaces/Middleware";

class CommandHandler {
    middlewares: Middleware[] = [];

    constructor(opts?: CommandHandlerOptions) {

    }
};

export {
    CommandHandler,
};