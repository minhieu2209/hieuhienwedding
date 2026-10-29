import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const moduleUrl = new URL("../lib/supabase.ts", import.meta.url).href;

// Each process loads the actual module with a separate configuration. These
// local-only test values do not connect to Supabase or write any records.
function loadClient(url, key) {
  const env = { ...process.env };
  delete env.NEXT_PUBLIC_SUPABASE_URL;
  delete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== undefined) env.NEXT_PUBLIC_SUPABASE_URL = url;
  if (key !== undefined) env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;

  const result = spawnSync(process.execPath, [
    "--experimental-strip-types",
    "--input-type=module",
    "-e",
    `import { supabase } from ${JSON.stringify(moduleUrl)}; console.log(supabase === null ? 'unavailable' : 'configured');`,
  ], { env, encoding: "utf8" });

  assert.equal(result.status, 0, "Loading the invitation's database module must not throw");
  return result.stdout.trim();
}

test("Missing Preview configuration does not crash module evaluation", () => {
  assert.equal(loadClient(), "unavailable");
});

test("A missing URL disables submission even when a key is present", () => {
  assert.equal(loadClient(undefined, "test-only-key"), "unavailable");
});

test("A missing key disables submission even when a URL is present", () => {
  assert.equal(loadClient("http://127.0.0.1:54321"), "unavailable");
});

test("Invalid or blank configuration does not crash the invitation", () => {
  assert.equal(loadClient("not-a-url", "test-only-key"), "unavailable");
  assert.equal(loadClient("   ", "test-only-key"), "unavailable");
});

test("Valid configuration still initializes the database client", () => {
  assert.equal(loadClient(" http://127.0.0.1:54321 ", " test-only-key "), "configured");
});
