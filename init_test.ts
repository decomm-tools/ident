import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { init } from "./init.ts";

Deno.test("init copies the self-contained tree", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-init-" });
  const dest = `${dir}/copy`;
  try {
    await init(dest);
    for (const name of ["main.ts", "store.ts", "ident.sh", "deno.json", "README.md"]) {
      await Deno.stat(`${dest}/${name}`);
    }
    const mode = (await Deno.lstat(`${dest}/ident.sh`)).mode ?? 0;
    assertEquals((mode & 0o111) !== 0, true);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("init refuses a non-empty directory without force", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-init-full-" });
  try {
    await Deno.writeTextFile(`${dir}/x.txt`, "x\n");
    await assertRejects(() => init(dir), Error, "not empty");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("init --force overwrites", async () => {
  const dir = await Deno.makeTempDir({ prefix: "decomm-ident-init-force-" });
  try {
    await Deno.writeTextFile(`${dir}/x.txt`, "x\n");
    await init(dir, { force: true });
    assertStringIncludes(await Deno.readTextFile(`${dir}/README.md`), "decomm ident");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
