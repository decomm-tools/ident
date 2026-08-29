/**
 * A face and a name for a box with no accounts.
 *
 * `create <handle>` writes handle, seed, color, fingerprint, an SVG face, and a
 * printable card. No LAN UI. Point `--dir` at the folder you will ferry over.
 *
 * {@linkcode renderAvatar} comes from `@decomm/avatar/render`. Same handle,
 * same seed, same face.
 *
 * @example
 * ```ts
 * import { run } from "jsr:@decomm/ident";
 *
 * await run(["--dir", "./idents", "init"]);
 * await run(["--dir", "./idents", "create", "holden"]);
 * console.log(await run(["--dir", "./idents", "show", "holden"]));
 * ```
 *
 * @module
 */
import { parseArgs } from "./args.ts";
import { cardPath, createIdentity, listHandles, readIdentity, svgPath } from "./store.ts";

const HELP = `decomm ident

A face and a name for a box with no accounts. Printable card, no LAN UI.

Commands:
  init                 Create the ident folder
  create <handle>      Write ident.json, face.svg, and card.html
  show <handle>        Print the record
  list                 Handles in --dir
  card <handle>        Path to the printable card

Flags:
  --dir <path>         Ident folder (default ./idents or IDENT_DIR)
  --force              Overwrite an existing handle

Examples:
  ./ident.sh --dir ./idents init
  ./ident.sh --dir ./idents create holden
  ./ident.sh --dir ./idents show holden

Env: IDENT_DIR

Compile on a connected machine (no Deno needed on the far side):
  deno task compile
`;

/**
 * Run the ident CLI.
 *
 * @param argv Typically `Deno.args`.
 */
export const run = async (argv: string[]): Promise<string> => {
  const args = parseArgs(argv);
  if (args.help || args.command === "" || args.command === "help") return HELP;

  switch (args.command) {
    case "init": {
      await Deno.mkdir(args.dir, { recursive: true });
      return `Ident folder ${args.dir}\n`;
    }
    case "create": {
      if (!args.handle) throw new Error("create needs a handle");
      const ident = await createIdentity(args.dir, args.handle, { force: args.force });
      return (
        `created ${ident.handle}\n` +
        `seed ${ident.seed}\n` +
        `color ${ident.color} (${ident.palette})\n` +
        `fingerprint ${ident.fingerprint}\n` +
        `${svgPath(args.dir, ident.handle)}\n` +
        `${cardPath(args.dir, ident.handle)}\n`
      );
    }
    case "show": {
      if (!args.handle) throw new Error("show needs a handle");
      const ident = await readIdentity(args.dir, args.handle);
      return (
        `${ident.handle}\n` +
        `seed ${ident.seed}\n` +
        `color ${ident.color} (${ident.palette})\n` +
        `fingerprint ${ident.fingerprint}\n` +
        `${svgPath(args.dir, ident.handle)}\n` +
        `${cardPath(args.dir, ident.handle)}\n`
      );
    }
    case "list": {
      const names = await listHandles(args.dir);
      return names.length === 0 ? "(none)\n" : names.join("\n") + "\n";
    }
    case "card": {
      if (!args.handle) throw new Error("card needs a handle");
      await readIdentity(args.dir, args.handle);
      return `${cardPath(args.dir, args.handle)}\n`;
    }
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
};

if (import.meta.main) {
  try {
    const text = await run(Deno.args);
    await Deno.stdout.write(new TextEncoder().encode(text));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}
