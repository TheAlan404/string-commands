import { CommandHandler } from "../src/index.js";

/*
This example is a simple console commands handler
*/

let username = "guest";

let handler = new CommandHandler({
	prefix: "",
	buildArguments: (build) => [build.args],
});

handler.on("invalidUsage", ({ command, errors }) => {
	console.log("/!\\ Invalid Usage!");
	console.log("Usage: " + handler.prettyPrint(command));
	console.log(errors.map((x) => "- " + x.message).join("\n"));
});

handler.on("failedChecks", ({ checks }) => {
	console.log("(x) Error: Failed Checks:");
	console.log(checks.map((x) => "- " + x.message).join("\n"));
});

// -- commands --

handler.registerCommand({
	name: "help",
	desc: "Shows commands",
	async run(args) {
		handler.Commands.forEach((cmd) => {
			console.log("> " + cmd.name + " : " + cmd.desc);
			if(cmd.args && cmd.args.length)
				console.log("  Usage: " + handler.prettyPrint(cmd));
		});
	},
});

handler.registerCommand({
	name: "say",
	desc: "Repeats your words",
	args: [
		{
			type: "text",
			rest: true,
		},
	],
	async run([text]) {
		// Because rest: true, it all gets collected to the first element
		console.log(text);
	},
});

handler.registerCommand({
	name: "add",
	desc: "Add two numbers",
	args: [
		{
			type: "number",
			name: "a",
		},
		{
			type: "number",
			name: "b",
		},
	],
	async run([a, b]) {
		let sum = a + b;
		console.log(a + " + " + b + " = " + sum);
	},
});

handler.registerCommand({
	name: "exit",
	desc: "Exit this example",
	async run() {
		console.log("OK, bye!");
		process.exit();
	},
});

handler.registerCommand({
	name: "su",
	desc: "Switch user",
	args: ["uname:string"],
	async run([ uname ]) {
		username = uname;
		console.log("Welcome back, " + username + "!");
	},
});

handler.registerCommand({
	name: "make_sandwich",
	desc: "No (unless you're 'root')",
	checks: [
		async () => {
			if(username == "root") {
				// Okay.
				return { pass: true };
			} else {
				return { pass: false, message: "What? Make it yourself." };
			};
		},
	],
	async run() {
		console.log("Ok, heres your virtual sandwich:");
		console.log("  🥪  ");
	},
});

var stdin = process.openStdin();
stdin.addListener("data", (d) => {
	let input = d.toString().trim();
	handler.run(input);
});

handler.run("help");
