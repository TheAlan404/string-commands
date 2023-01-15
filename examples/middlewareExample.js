import { CommandHandler } from "../src/index.js";

/*
This example is like consoleExample.js but with middlewares
*/

let handler = new CommandHandler();

handler.buildArguments = ({ ctx, args }) => [ctx, args];

// Initialize a dummy database
let dummyDB = {
    dennis: 12,
    may: 20,
    skyrina: 3,
    voltrex: 5,
    julia: 16,
    guest: 5,
};

let currentUser = "guest";

// The middleware
handler.use({
    id: "dummydb",
    before: "run",
    run(execCtx, next) {
        execCtx.ctx.balance = dummyDB[currentUser];
        execCtx.ctx.setBalance = (x) => dummyDB[currentUser] = x;
        execCtx.ctx.setBalanceOf = (u, x) => dummyDB[u] = x;
        execCtx.ctx.getBalances = () => dummyDB;

        next();
    }
})

// Pre-defined checks:

const Checks = {
    /**
     * Generate a command check
     * @param {number} n Index of the argument to check for an user
     * @returns {import("../src").CommandCheck}
     */
    userMustExist: (n) => {
        return async (ctx, args) => {
            if(Object.keys(dummyDB).includes(args[n])) {
                return { pass: true };
            } else {
                return { pass: false, message: "User doesn't exist" };
            }
        }
    }
}

handler.addCommand({
    name: "baltop",
    desc: "List top balances",
    run(ctx, args) {
        console.log("== Bal Top ==")
        console.log(Object.entries(ctx.getBalances())
            .map(([name, bal], i) => `${i+1}. ${name}: ${bal}`)
            .join("\n"));
        console.log("== Bal Top ==")
    }
});

handler.addCommand({
    name: "bal",
    desc: "Shows your balance",
    run(ctx, args) {
        console.log("You have " + ctx.balance + " money.");
    }
});

handler.addCommand({
    name: "login",
    args: ["user:string"],
    checks: [
        Checks.userMustExist(0),
    ],
    desc: "Login as another user",
    run(ctx, [user]) {
        currentUser = user;
        console.log(`Welcome back ${currentUser}`);
    }
})

handler.addCommand({
    name: "pay",
    args: ["user:string", "amount:number"],
    checks: [
        Checks.userMustExist(0),
        async (ctx, [user, amount]) => {
            // todo check if balance > amount
            return { pass: true };
        },
    ],
    run(ctx, [ user, amount ]) {
        ctx.setBalanceOf(user, ctx.balance + amount);
        ctx.setBalance(ctx.balance - amount);
    },
})

handler.registerCommand({
	name: "help",
	desc: "this;",
	async run() {
		handler.Commands.forEach((cmd) => {
			console.log("> " + cmd.name + " : " + cmd.desc);
			if(cmd.args && cmd.args.length)
				console.log("  Usage: " + handler.prettyPrint(cmd));
		});
	},
});

var stdin = process.openStdin();
stdin.addListener("data", (d) => {
	let input = d.toString().trim();
	handler.run(input, {});
});
console.log("Type 'help' for a list of commands");
