// Copyright 2020 the Denoify authors. All rights reserved. MIT License.

import { getPolyfill, unstable } from "./mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.65.0/testing/asserts.ts";

const { test } = Deno;

const denofill = await getPolyfill();

test({
  name: "denofill equality",
  fn() {
    assert(denofill !== Deno);
  },
});

const unstableNames = [
  "umask",
  "linkSync",
  "link",
  "symlinkSync",
  "symlink",
  "dir",
  "loadavg",
  "osRelease",
  "openPlugin",
  "DiagnosticCategory",
  "formatDiagnostics",
  "transpileOnly",
  "compile",
  "bundle",
  "applySourceMap",
  "Signal",
  "SignalStream",
  "signal",
  "signals",
  "setRaw",
  "utimeSync",
  "utime",
  "ShutdownMode",
  "shutdown",
  "listenDatagram",
  "startTls",
  "kill",
  "Permissions",
  "permissions",
  "PermissionStatus",
  "hostname",
  "mainModule",
];

test({
  name: "denofill - property match",
  fn() {
    for (const key of Object.keys(Deno)) {
      if (unstableNames.includes(key)) {
        // denofill does not contain unstable APIs.
        continue;
      }
      assert(key in denofill, `${key} should be in denofill`);
      assert(
        typeof denofill[key as keyof typeof denofill] ===
          typeof Deno[key as keyof typeof Deno],
        `Types of property ${key} should match.`,
      );
      const desc = Object.getOwnPropertyDescriptor(denofill, key);
      assert(desc);
      assertEquals(desc.enumerable, true, "should be enumerable");
      assertEquals(desc.writable, false, "should be read only");
      assertEquals(desc.configurable, false, "should not be configurable");
    }
  },
});

test({
  name: "denofill - unstable property match",
  async fn() {
    await unstable();
    const unstableShim = await getPolyfill();
    for (const key of unstableNames) {
      if (!(key in Deno)) {
        continue;
      }
      assert(key in unstableShim, `${key} should be in shim`);
      assert(
        typeof unstableShim[key as keyof typeof unstableShim] ===
          typeof Deno[key as keyof typeof Deno],
        `Types of property ${key} should match.`,
      );
      const desc = Object.getOwnPropertyDescriptor(unstableShim, key);
      assert(desc);
      assertEquals(desc.enumerable, true, "should be enumerable");
      assertEquals(desc.writable, false, "should be read only");
      assertEquals(desc.configurable, false, "should not be configurable");
    }
  },
});

test({
  name: "denofill - basic file system APIs",
  async fn() {
    const shim = await getPolyfill();
    const tmpFile = await shim.makeTempFile();
    await shim.writeTextFile(tmpFile, "hello world!");
    const actual = await shim.readTextFile(tmpFile);
    assertEquals(actual, "hello world!");
  },
});
