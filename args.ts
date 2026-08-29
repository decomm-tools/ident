export type IdentArgs = {
  command: string;
  handle: string;
  dir: string;
  help: boolean;
  force: boolean;
};

const take = (args: string[], i: number, flag: string): string => {
  const value = args[i];
  if (!value || value.startsWith("-")) throw new Error(`${flag} needs a value`);
  return value;
};

export const parseArgs = (argv: string[]): IdentArgs => {
  const parsed: IdentArgs = {
    command: "",
    handle: "",
    dir: Deno.env.get("IDENT_DIR") ?? "./idents",
    help: false,
    force: false,
  };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--dir") parsed.dir = take(argv, ++i, "--dir");
    else if (arg === "--force" || arg === "-f") parsed.force = true;
    else if (arg === "--") continue;
    else if (!arg.startsWith("-")) rest.push(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  parsed.command = rest[0] ?? "";
  parsed.handle = rest[1] ?? "";
  return parsed;
};
