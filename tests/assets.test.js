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
    const removedPhrases = [
      ["未完成", "专业审核"].join(""),
      ["需", "专业审核"].join(""),
    ];

    assert.match(svg, />穴位位置示意图<\/text>/);
    for (const phrase of removedPhrases) assert.doesNotMatch(svg, new RegExp(phrase));
    assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\/|<script|<foreignObject|<image/i);
    assert.doesNotMatch(svg, /[ \t]+$/m);
  }
});

test("each acupoint SVG states bilateral orientation and required landmarks", () => {
  const read = (id) => fs.readFileSync(path.join(__dirname, "..", "assets", "acupoints", `${id}.svg`), "utf8");

  for (const id of ["LI4", "EX-HN5", "GB20", "LI20", "HT7", "GB21", "SI3", "LI10", "PC6", "ST36", "GB34", "KI1", "BL40"]) {
    assert.match(read(id), /左右同取/, `${id} must state that the bilateral point is located on both sides`);
  }

  const requiredLabels = {
    HT7: ["前臂掌侧"],
    PC6: ["前臂掌侧"],
    LI10: ["前臂背侧"],
    SI3: ["第五掌指关节"],
    ST36: ["腓骨小头"],
    GB34: ["腓骨小头"],
    CV12: ["胸骨下端"],
    KI1: ["趾根", "足弓"],
    BL40: ["膝后部"],
  };

  for (const [id, labels] of Object.entries(requiredLabels)) {
    const svg = read(id);
    for (const label of labels) {
      assert.match(svg, new RegExp(label), `${id} must identify ${label}`);
    }
  }
});

test("every product uses a substantial local image", () => {
  for (const product of data.products) {
    const imagePath = path.join(__dirname, "..", product.image);
    assert.ok(fs.existsSync(imagePath), `${product.name} image is missing`);
    assert.ok(fs.statSync(imagePath).size > 1024, `${product.name} image is unexpectedly small`);
  }
});
