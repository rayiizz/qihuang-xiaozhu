const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = require("../data.js");

test("every configured acupoint SVG exists", () => {
  for (const point of data.acupoints) {
    const absolute = path.join(__dirname, "..", point.image);
    assert.ok(fs.existsSync(absolute), `${point.image} is missing`);
  }
});

test("all acupoint SVGs are local, static, and structurally consistent", () => {
  for (const point of data.acupoints) {
    const svg = fs.readFileSync(path.join(__dirname, "..", point.image), "utf8");
    assert.match(svg, /<svg[^>]+viewBox="0 0 480 320"/);
    assert.match(svg, /class="acupoint-marker"/);
    assert.match(svg, /位置示意图/);
    assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\/|<script|<foreignObject|<image/i);
    assert.doesNotMatch(svg, /[ \t]+$/m);
  }
});
