import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs/GTMSprint");
const site = "https://gtmsprint.uk";

function directoryPages() {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "index.html")))
    .map((entry) => entry.name)
    .sort();
}

function localRefs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const refs = [];
  const attr = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
  const imported = /import\s+[^'"\n]*from\s+["']([^"']+)["']/g;
  for (const pattern of [attr, imported]) {
    for (const match of text.matchAll(pattern)) refs.push(match[1]);
  }
  return refs.filter((ref) => {
    if (/^(?:[a-z]+:|#|\/\/)/i.test(ref)) return false;
    return ref.startsWith(".") || ref.startsWith("/");
  });
}

function filesFor(htmlPath) {
  const dir = path.dirname(htmlPath);
  const found = [htmlPath];
  for (const ref of localRefs(htmlPath)) {
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    found.push(path.resolve(dir, clean));
    if (htmlPath.endsWith(".js")) continue;
  }
  const jsRefs = found.filter((file) => file.endsWith(".js"));
  for (const js of jsRefs) {
    if (!fs.existsSync(js)) continue;
    for (const ref of localRefs(js)) {
      const clean = ref.split("#")[0].split("?")[0];
      if (clean) found.push(path.resolve(path.dirname(js), clean));
    }
  }
  return [...new Set(found)];
}

test("every directory page redirects to its trailing-slash URL", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  const pages = directoryPages();
  assert.deepEqual(pages, ["agenda", "application", "mentors"]);
  assert.ok(Array.isArray(config.redirects));

  for (const page of pages) {
    const rule = config.redirects.find((item) => item.source === `/${page}`);
    assert.ok(rule, `missing redirect for /${page}`);
    assert.equal(rule.destination, `/${page}/`);
  }

  for (const rule of config.redirects) {
    assert.equal(rule.source.endsWith("/"), false);
    assert.equal(rule.destination, `${rule.source}/`);
    assert.equal(rule.source.includes("."), false);
  }
});

test("relative assets exist when the page URL has a trailing slash", () => {
  for (const page of directoryPages()) {
    const htmlPath = path.join(root, page, "index.html");
    const baseWithout = `${site}/${page}`;
    const baseWith = `${site}/${page}/`;
    const refs = localRefs(htmlPath);
    assert.ok(refs.some((ref) => ref.includes(".css")), `${page} should link a stylesheet`);

    for (const ref of refs) {
      const broken = new URL(ref, baseWithout);
      const fixed = new URL(ref, baseWith);
      if (ref.startsWith("./") && /\.(?:css|js)(?:\?|$)/.test(ref)) {
        assert.notEqual(broken.pathname, fixed.pathname, `${ref} should change when the slash is missing`);
      }
      const filePath = path.join(root, decodeURIComponent(fixed.pathname).replace(/^\//, ""));
      assert.equal(fs.existsSync(filePath), true, `${baseWith} + ${ref} -> missing ${filePath}`);
    }
  }
});

test("the home page and query strings keep resolving assets at the site root", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const refs = localRefs(path.join(root, "index.html"));
  assert.match(html, /href="\.\/mentors\/"/);
  for (const base of [`${site}/`, `${site}/?x=1`]) {
    for (const ref of refs) {
      const resolved = new URL(ref, base);
      assert.equal(resolved.origin, site);
      const filePath = path.join(root, decodeURIComponent(resolved.pathname).replace(/^\//, ""));
      assert.equal(fs.existsSync(filePath), true, `${base} + ${ref} -> missing ${filePath}`);
    }
  }
});
