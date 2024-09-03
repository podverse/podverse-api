export function parseArgs() {
  const args = process.argv.slice(2); // Skip the first two arguments (node and script path)
  const parsedArgs: { [key: string]: string | string[] } = { _: [] };
  let currentKey: string | null = null;

  args.forEach(arg => {
    if (arg.startsWith('-')) {
      currentKey = arg.replace(/^-+/, ''); // Remove leading dashes
      parsedArgs[currentKey] = '';
    } else if (currentKey) {
      parsedArgs[currentKey] = arg;
      currentKey = null;
    } else {
      (parsedArgs._ as string[]).push(arg); // Collect positional arguments
    }
  });

  return parsedArgs;
}
