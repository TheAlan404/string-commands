import Middleware from "../interfaces/Middleware";

const ResolveCommand = (): Middleware => {
    return {
        id: "resolveCommand",
        run(ctx, next) {
            
        },
    };
};

export default ResolveCommand;