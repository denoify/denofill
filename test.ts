// Copyright 2020 the Denoify authors. All rights reserved. MIT License.

import { getPolyfill, unstable } from "./mod.ts";
import {
  assert,
  assertEquals,
  assertStrictEquals,
} from "https://deno.land/std@0.103.0/testing/asserts.ts";

import keys from "./deno-keys.ts";

const { test } = Deno;

const denofill = await getPolyfill();

test({
  name: "denofill equality",
  fn() {
    assert(denofill !== Deno);
  },
});

const unstableNames = keys.unstable.keys.filter((k) =>
  !keys.stable.keys.includes(k)
);

Deno.test({
  name: "denofill - Check all properties of Deno are present in denofill",
  fn() {
    const missing: string[] = [];
    const mismatch: string[] = [];
    for (const key of Object.keys(Deno)) {
      if (unstableNames.includes(key)) {
        // denofill does not contain unstable APIs.
        continue;
      }

      const expectedType = typeof Deno[key as keyof typeof Deno];

      try {
        assert(key in denofill);
      } catch (_e) {
        missing.push(`${key} : ${expectedType}`);
        continue;
      }

      const gotType = typeof denofill[key as keyof typeof denofill];

      try {
        assertStrictEquals(gotType, expectedType);
      } catch (_e) {
        mismatch.push(`${key} : expected ${expectedType} but got ${gotType}`);
        continue;
      }
      const desc = Object.getOwnPropertyDescriptor(denofill, key);
      assert(desc);
      assertEquals(desc.enumerable, true, "should be enumerable");
      assertEquals(desc.writable, false, "should be read only");
      assertEquals(desc.configurable, false, "should not be configurable");
    }
    missing.sort();
    assertEquals(
      missing,
      [],
      `Properies missing from denofill\n - ${missing.join("\n - ")}`,
    );
    mismatch.sort();
    assertEquals(
      mismatch,
      [],
      `Properies of denofill should have types denofill\n - ${
        missing.join("\n - ")
      }`,
    );
  },
});

Deno.test({
  name: "denofill - Check all properties of denofill are present in Deno",
  fn() {
    const superfluous: string[] = [];
    for (const key of Object.keys(denofill)) {
      if (!(key in Deno)) {
        superfluous.push(`${key}`);
      }
    }
    assertEquals(
      superfluous,
      [],
      `denofill should not have properties\n - ${superfluous.join("\n - ")}`,
    );
  },
});

Deno.test({
  name:
    "denofill - Check all unstable properties of Deno are present in unstable denofill",
  async fn() {
    await unstable();
    const unstableShim = await getPolyfill();
    const missing: string[] = [];
    for (const key of unstableNames) {
      if (!(key in Deno)) {
        continue;
      }
      const expectedType = typeof Deno[key as keyof typeof Deno];
      if (!(key in unstableShim)) {
        missing.push(`${key} : ${expectedType}`);
        continue;
      }
      const gotType = typeof unstableShim[key as keyof typeof unstableShim];
      assertStrictEquals(
        gotType,
        expectedType,
        `Types of property ${key} should match.`,
      );
      const desc = Object.getOwnPropertyDescriptor(unstableShim, key);
      assert(desc);
      assertEquals(desc.enumerable, true, "should be enumerable");
      assertEquals(desc.writable, false, "should be read only");
      assertEquals(desc.configurable, false, "should not be configurable");
    }
    assertEquals(
      missing,
      [],
      `Properies missing from unstable denofill\n - ${missing.join("\n - ")}`,
    );
  },
});

Deno.test({
  name: "denofill - basic file system APIs",
  async fn() {
    const shim = await getPolyfill();
    const tmpFile = await shim.makeTempFile();
    await shim.writeTextFile(tmpFile, "hello world!");
    const actual = await shim.readTextFile(tmpFile);
    assertEquals(actual, "hello world!");
  },
});
