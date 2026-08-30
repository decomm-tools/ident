# decomm ident

A face and a name for a box with no accounts.

`create <handle>` writes handle, seed, color, fingerprint, an SVG from `jsr:@decomm/avatar/render`,
and a printable HTML card. Same handle, same face. There is no LAN UI.

## Commands

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `init`            | Create the ident folder                         |
| `create <handle>` | Write `ident.json`, `face.svg`, and `card.html` |
| `show <handle>`   | Print the record                                |
| `list`            | Handles in `--dir`                              |
| `card <handle>`   | Path to the printable card                      |

`--dir` is the folder you ferry. `--force` overwrites an existing handle.

## Carry-in

Init on a connected machine. Copy the folder. Run dark.

### Init

```sh
deno run -A jsr:@decomm/ident/init ./ident
cd ident
deno task compile
```

Or from this repo: `deno task compile`. That leaves `bin/ident`.

### Copy

Carry the whole `ident/` folder onto the isolated box — USB, sneakernet,
[ferry](https://github.com/decomm-tools/ferry). Include `bin/`.

### Run dark

No network. The box never needs to come back online.

```sh
./ident.sh --dir ./idents init
./ident.sh --dir ./idents create holden
./ident.sh --dir ./idents show holden
```

Print `idents/holden/card.html`.

`ident.sh` uses the compiled binary if present, otherwise `deno run`. The isolated box does not need
Deno if you compiled first.
