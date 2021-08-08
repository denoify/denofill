import old from "./deno-keys.ts";

const unstable = Deno.args.includes("unstable");

const out = {
  stable: {
    count: old.stable.count,
    keys: [...old.stable.keys],
  },
  unstable: {
    count: old.unstable.count,
    keys: [...old.unstable.keys],
  },
};

const keys = Object.keys(Deno);
keys.sort();

if (unstable) {
  out.unstable.count = keys.length;
  out.unstable.keys = keys;
} else {
  out.stable.count = keys.length;
  out.stable.keys = keys;
}

Deno.writeTextFileSync(
  "./deno-keys.ts",
  `export default ${JSON.stringify(out, null, 2)};`,
);
