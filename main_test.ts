import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { parseArgs } from "./args.ts";
import { run } from "./main.ts";
import { readIdentity } from "./store.ts";

Deno.test("parseArgs create handle", () => {
  const args = parseArgs(["create", "holden", "--dir", "./idents"]);
  assertEquals(args.command, "create");
  assertEquals(args.handle, "holden");
  assertEquals(args.dir, "./idents");
  assertEquals(args.force, false);
});

Deno.test("parseArgs --force and --help", () => {
  assertEquals(parseArgs(["--force", "create", "a"]).force, true);
  assertEquals(parseArgs(["-h"]).help, true);
});

Deno.test("run --help is decomm ident", async () => {
  const text = await run(["--help"]);
  assertStringIncludes(text, "decomm ident");
  assertStringIncludes(text, "printable card");
  assertEquals(text.includes("serve"), false);
  assertEquals(text.includes("decomm ledger"), false);
});

Deno.test("create writes json svg and card; same handle is stable", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-" });
  try {
    assertStringIncludes(await run(["--dir", dir, "init"]), dir);
    const created = await run(["--dir", dir, "create", "holden"]);
    assertStringIncludes(created, "created holden");
    assertStringIncludes(created, "fingerprint");
    assertStringIncludes(created, `${dir}/holden/face.svg`);
    assertStringIncludes(created, `${dir}/holden/card.html`);

    const ident = await readIdentity(dir, "holden");
    assertEquals(ident.handle, "holden");
    assertEquals(ident.seed, "holden");
    assertEquals(ident.fingerprint.includes("-"), true);
    const svg = await Deno.readTextFile(`${dir}/holden/face.svg`);
    assertStringIncludes(svg, "<svg");
    const card = await Deno.readTextFile(`${dir}/holden/card.html`);
    assertStringIncludes(card, "holden");
    assertStringIncludes(card, ident.fingerprint);
    assertStringIncludes(card, ident.color);

    const again = await run(["--dir", dir, "create", "--force", "holden"]);
    assertStringIncludes(again, ident.fingerprint);
    assertStringIncludes(await run(["--dir", dir, "list"]), "holden");
    assertStringIncludes(await run(["--dir", dir, "show", "holden"]), ident.fingerprint);
    assertEquals(
      (await run(["--dir", dir, "card", "holden"])).trim(),
      `${dir}/holden/card.html`,
    );
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("create refuses a collision without --force", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-clash-" });
  try {
    await run(["--dir", dir, "create", "box"]);
    await assertRejects(() => run(["--dir", dir, "create", "box"]), Error, "already exists");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("bad handle is rejected", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-bad-" });
  try {
    await assertRejects(() => run(["--dir", dir, "create", "Bad Handle"]), Error, "Bad handle");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
