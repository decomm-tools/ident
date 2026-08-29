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

```sh
deno run -A jsr:@decomm/ident/init ./ident
cd ident
deno task compile
./ident.sh --dir ./idents init
./ident.sh --dir ./idents create holden
```

Print `idents/holden/card.html`. Copy the folder with
[ferry](https://github.com/decomm-tools/ferry).
