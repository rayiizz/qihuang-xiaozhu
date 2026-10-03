const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("document contains every application view", () => {
  for (const id of [
    "view-home",
    "view-product",
    "view-safety",
    "view-regions",
    "view-symptoms",
    "view-result",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("document loads local classic scripts in dependency order", () => {
  const dataIndex = html.indexOf('src="data.js"');
  const appIndex = html.indexOf('src="app.js"');
  assert.ok(dataIndex > -1, "data.js must be loaded");
  assert.ok(appIndex > dataIndex, "app.js must load after data.js");
  assert.doesNotMatch(html, /type=["']module["']/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test("document includes safety, keyboard, and no-script affordances", () => {
  assert.match(html, /仅供日常健康知识参考/);
  assert.match(html, /演示内容尚未完成专业审核/);
  assert.match(html, /<noscript>/);
  assert.match(html, /<button[^>]+data-action=/);
});
