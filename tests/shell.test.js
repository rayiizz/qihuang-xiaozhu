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
    "view-disclaimer",
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

test("document includes static missing-data and substantive no-script fallbacks", () => {
  assert.match(html, /id=["']app-error["'][^>]*hidden/);
  const noScript = html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || "";
  assert.match(noScript, /产品定位/);
  assert.match(noScript, /安全提醒/);
  assert.match(noScript, /仅供日常健康知识参考/);
  assert.match(noScript, /问诊功能需要启用 JavaScript/);
});

test("product introduction includes the agreed applicable-scope section", () => {
  const productView = html.match(/id=["']view-product["'][\s\S]*?<\/section>/i)?.[0] || "";
  assert.match(productView, /<h2>适用范围<\/h2>/);
});

test("stylesheet includes responsive, focus, hidden, and reduced-motion rules", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\[hidden\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("acupoint figures preserve the full SVG and remain responsive", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\.point-figure\s*\{/);
  assert.match(css, /\.point-figure img\s*\{/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*2/);
});

test("document exposes the approved disclaimer through a shared footer link", () => {
  const disclaimerStart = html.indexOf('id="view-disclaimer"');
  const disclaimerEnd = html.indexOf("</main>", disclaimerStart);
  const disclaimerView = html.slice(disclaimerStart, disclaimerEnd);

  assert.ok(disclaimerStart > -1, "disclaimer view must exist");
  assert.match(html, /<footer[^>]+class=["']site-footer["']/);
  assert.match(html, /<a[^>]+href=["']#view-disclaimer["'][^>]+data-action=["']open-disclaimer["']/);
  assert.match(disclaimerView, /免责声明与使用须知/);
  assert.match(disclaimerView, /“在线问诊”仅为功能名称/);
  assert.match(disclaimerView, /不构成医学诊断、处方、个体化治疗方案或疗效保证/);
  assert.match(disclaimerView, /立即停止自行处理并联系当地急救服务/);
  assert.match(disclaimerView, /不指导针刺、放血、艾灸/);
  assert.match(disclaimerView, /孕妇、儿童、老年人/);
  assert.match(disclaimerView, /尚未经过执业中医师逐项审核/);
  assert.match(disclaimerView, /不会主动上传或保存/);
  assert.match(disclaimerView, /法律规定不得排除或限制的责任/);
  assert.match(disclaimerView, /最后更新：2026年10月3日/);
  assert.match(disclaimerView, /data-action=["']home["']/);
});
