import { CommandHandler } from '../src/index.js';

/*
This example is a simple console commands handler
*/

let handler = new CommandHandler({
  prefix: '',
  buildArguments: (build) => [build.args]
});

handler.registerCommand({
  name: 'help',
  desc: 'Shows commands',
  async run(args) {
    handler.Commands.forEach((cmd) => {
      console.log('> ' + cmd.name);
      console.log('  ' + cmd.desc);
      console.log('  Usage: ' + handler.prettyPrint(cmd));
    });
  }
});

handler.registerCommand({
  name: 'say',
  desc: 'Repeats your words',
  args: [
    {
      type: 'text',
      rest: true
    }
  ],
  async run([text]) {
    // Because rest: true, it all gets collected to the first element
    console.log(text);
  }
});

handler.registerCommand({
  name: 'add',
  desc: 'Add two numbers',
  args: [
    {
      type: 'number',
      name: 'a'
    },
    {
      type: 'number',
      name: 'b'
    }
  ],
  async run([a, b]) {
    let sum = a + b;
    console.log(a + ' + ' + b + ' = ' + sum);
  }
});

handler.registerCommand({
  name: 'exit',
  desc: 'Exit this example',
  async run() {
    console.log('OK, bye!');
    process.exit();
  }
});

var stdin = process.openStdin();
stdin.addListener('data', (d) => {
  let input = d.toString().trim();
  handler.run(input);
});

handler.run('help');
