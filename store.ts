import { renderAvatar, traitsFromSeed } from "@decomm/avatar/render";
import { fingerprint } from "./hash.ts";

const join = (root: string, name: string): string => `${root}/${name}`;

export type Identity = {
  handle: string;
  seed: string;
  color: string;
  palette: string;
  fingerprint: string;
  created: string;
};

export const isHandle = (name: string): boolean => /^[a-z0-9][a-z0-9._-]{0,31}$/.test(name);

export const identityDir = (dir: string, handle: string): string => join(dir, handle);

export const listHandles = async (dir: string): Promise<string[]> => {
  const names: string[] = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isDirectory && isHandle(entry.name)) names.push(entry.name);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return [];
    throw error;
  }
  return names.sort();
};

export const readIdentity = async (dir: string, handle: string): Promise<Identity> => {
  if (!isHandle(handle)) throw new Error(`Bad handle: ${handle}`);
  try {
    const text = await Deno.readTextFile(join(identityDir(dir, handle), "ident.json"));
    return JSON.parse(text) as Identity;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) throw new Error(`No ident named ${handle}`);
    throw error;
  }
};

export const svgPath = (dir: string, handle: string): string =>
  join(identityDir(dir, handle), "face.svg");

export const cardPath = (dir: string, handle: string): string =>
  join(identityDir(dir, handle), "card.html");

export const printableCard = (ident: Identity, svg: string): string => {
  const escaped = ident.handle
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escaped} · decomm ident</title>
<style>
  @page { size: 90mm 54mm; margin: 6mm; }
  html, body { margin: 0; background: #09090b; color: #f4f4f5; font: 14px/1.35 ui-sans-serif, system-ui, sans-serif; }
  .card { width: 90mm; min-height: 54mm; box-sizing: border-box; padding: 10px 12px; display: flex; gap: 12px; align-items: center; }
  .face { width: 96px; height: 96px; flex: none; }
  .face svg { width: 96px; height: 96px; display: block; }
  .meta { min-width: 0; }
  .handle { font-size: 22px; font-weight: 650; letter-spacing: -0.03em; }
  .fp { font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: #a1a1aa; word-break: break-all; }
  .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; vertical-align: -1px; margin-right: 6px; }
  .label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #f5b942; margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="card">
    <div class="face">${svg}</div>
    <div class="meta">
      <div class="label">decomm ident</div>
      <div class="handle">${escaped}</div>
      <div class="fp"><span class="swatch" style="background:${ident.color}"></span>${ident.color} · ${ident.palette}</div>
      <div class="fp">${ident.fingerprint}</div>
    </div>
  </div>
</body>
</html>
`;
};

export const createIdentity = async (
  dir: string,
  handle: string,
  options: { force?: boolean } = {},
): Promise<Identity> => {
  if (!isHandle(handle)) throw new Error(`Bad handle: ${handle}`);
  const root = identityDir(dir, handle);
  try {
    await Deno.lstat(root);
    if (!options.force) {
      throw new Error(`Ident ${handle} already exists. Pass --force to overwrite.`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) throw error;
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }

  await Deno.mkdir(root, { recursive: true });
  const seed = handle;
  const traits = traitsFromSeed(seed);
  const svg = renderAvatar(seed);
  const ident: Identity = {
    handle,
    seed,
    color: traits.palette.body,
    palette: traits.palette.name,
    fingerprint: await fingerprint(handle, seed),
    created: new Date().toISOString(),
  };
  await Deno.writeTextFile(join(root, "ident.json"), JSON.stringify(ident, null, 2) + "\n");
  await Deno.writeTextFile(svgPath(dir, handle), svg.endsWith("\n") ? svg : svg + "\n");
  await Deno.writeTextFile(cardPath(dir, handle), printableCard(ident, svg));
  return ident;
};
