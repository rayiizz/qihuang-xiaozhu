# Acupoint Location Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one accessible, fully offline SVG location illustration to each of the 15 existing acupoint result cards, with a safe text-only fallback when an image cannot load.

**Architecture:** Extend the immutable acupoint records with image metadata, generate 15 deterministic SVG assets from 10 reviewed regional templates, and isolate card construction in a testable `createPointCard` function. SVG generation remains a development utility; the shipped page loads only static local files and never performs a network request.

**Tech Stack:** Vanilla JavaScript, Node.js built-in `node:test`, SVG 1.1-compatible markup, existing HTML/CSS application.

---

## File map

- Modify `data.js`: add `image` and `imageAlt` to every acupoint.
- Create `scripts/generate-acupoint-svgs.js`: deterministic source for all 15 illustrations.
- Create `assets/acupoints/*.svg`: generated offline artwork committed with the project.
- Modify `app.js`: create and render semantic figures with error fallback.
- Modify `styles.css`: visual treatment for illustration figures.
- Modify `tests/data.test.js`: image-metadata contract.
- Create `tests/assets.test.js`: asset existence and SVG safety contract.
- Modify `tests/app.test.js`: result-card figure and error-fallback behavior.
- Modify `tests/shell.test.js`: responsive illustration-style contract.

## Medical and visual constraint

The illustrations are schematic interface assets, not a replacement for professional localization. Keep the existing “演示内容尚未完成专业审核” banner. Do not add needles, pressure depth, treatment instructions, efficacy claims, remote images, scripts, or embedded raster content. A qualified TCM professional must compare every marker with the existing `location` text and the cited WHO/GB standards before public release.

### Task 1: Add image metadata to all acupoint records

**Files:**
- Modify: `tests/data.test.js`
- Modify: `data.js`

- [ ] **Step 1: Write the failing metadata contract**

Append to `tests/data.test.js`:

```js
test("every acupoint has unique local image metadata", () => {
  const paths = new Set();
  for (const point of data.acupoints) {
    assert.match(point.image, /^assets\/acupoints\/[A-Z0-9-]+\.svg$/);
    assert.ok(point.imageAlt.length >= 18, `${point.name} needs a descriptive imageAlt`);
    assert.match(point.imageAlt, new RegExp(point.name));
    paths.add(point.image);
  }
  assert.equal(paths.size, data.acupoints.length);
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
node --test --test-name-pattern="image metadata" tests/data.test.js
```

Expected: FAIL because `point.image` is `undefined`.

- [ ] **Step 3: Add the exact metadata to `data.js`**

Replace the 15 objects inside `acupoints` with these records, preserving the surrounding immutable data wrapper:

```js
      { id: "LI4", name: "合谷", location: "手背第一、二掌骨之间，靠近第二掌骨中点处。", caution: "孕期不自行按压。", image: "assets/acupoints/LI4.svg", imageAlt: "合谷位置示意：手背第一、二掌骨之间，红点靠近第二掌骨中点", sourceIds: ["GBT12346", "WHO2008", "MSKCCLI4"] },
      { id: "EX-HN5", name: "太阳", location: "眉梢与外眼角之间向后约一横指的凹陷处。", caution: "避开眼球和受伤皮肤。", image: "assets/acupoints/EX-HN5.svg", imageAlt: "太阳位置示意：侧面头部眉梢与外眼角后方的颞部凹陷", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB20", name: "风池", location: "后枕骨下，胸锁乳突肌与斜方肌上端之间凹陷处。", caution: "轻触即可，不向颈前方深压。", image: "assets/acupoints/GB20.svg", imageAlt: "风池位置示意：后枕骨下方、颈后两侧肌肉之间的凹陷", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "LI20", name: "迎香", location: "鼻翼外缘中点旁，鼻唇沟中。", caution: "避开鼻部炎症或破损皮肤。", image: "assets/acupoints/LI20.svg", imageAlt: "迎香位置示意：正面鼻翼外缘中点旁的鼻唇沟", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "HT7", name: "神门", location: "腕掌侧横纹靠小指一端的凹陷处。", caution: "局部受伤时不按压。", image: "assets/acupoints/HT7.svg", imageAlt: "神门位置示意：手掌侧腕横纹靠小指一端的凹陷", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "EX-HN3", name: "印堂", location: "前额，两眉头连线的中点。", caution: "皮肤不适时停止。", image: "assets/acupoints/EX-HN3.svg", imageAlt: "印堂位置示意：正面前额两侧眉头连线的中点", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB21", name: "肩井", location: "肩部，大椎与肩峰最外侧连线的中点。", caution: "孕期不自行按压。", image: "assets/acupoints/GB21.svg", imageAlt: "肩井位置示意：后侧肩部大椎方向与肩峰连线的中点", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "SI3", name: "后溪", location: "握拳时，小指掌指关节后方掌横纹末端。", caution: "手部受伤时不按压。", image: "assets/acupoints/SI3.svg", imageAlt: "后溪位置示意：握拳时小指掌指关节后方的掌横纹末端", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "LI10", name: "手三里", location: "前臂背面，肘横纹下约三横指。", caution: "局部肿痛时不按压。", image: "assets/acupoints/LI10.svg", imageAlt: "手三里位置示意：前臂背面肘横纹下约三横指的位置", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "PC6", name: "内关", location: "前臂掌侧，腕横纹上约三横指，两筋之间。", caution: "腕部受伤时不按压。", image: "assets/acupoints/PC6.svg", imageAlt: "内关位置示意：前臂掌侧腕横纹上约三横指、两筋之间", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "ST36", name: "足三里", location: "小腿前外侧，膝盖外下方约四横指。", caution: "局部受伤或感染时不按压。", image: "assets/acupoints/ST36.svg", imageAlt: "足三里位置示意：小腿前外侧膝盖外下方约四横指", sourceIds: ["GBT12346", "WHO2008", "BEIJINGST36"] },
      { id: "CV12", name: "中脘", location: "上腹部前正中线，肚脐上方约一掌宽。", caution: "孕期或急性腹痛时不自行按压。", image: "assets/acupoints/CV12.svg", imageAlt: "中脘位置示意：上腹部前正中线上、肚脐上方约一掌宽", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB34", name: "阳陵泉", location: "小腿外侧，腓骨小头前下方凹陷处。", caution: "膝腿受伤时不按压。", image: "assets/acupoints/GB34.svg", imageAlt: "阳陵泉位置示意：小腿外侧腓骨小头前下方的凹陷", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "KI1", name: "涌泉", location: "足底前部，蜷足时足底出现的凹陷处。", caution: "足部破损或感染时不按压。", image: "assets/acupoints/KI1.svg", imageAlt: "涌泉位置示意：足底前部蜷足时出现的凹陷", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "BL40", name: "委中", location: "膝后横纹的中点。", caution: "静脉曲张、肿胀或疼痛处不按压。", image: "assets/acupoints/BL40.svg", imageAlt: "委中位置示意：膝后视图中膝后横纹的中点", sourceIds: ["GBT12346", "WHO2008"] },
```

- [ ] **Step 4: Run the targeted and full data tests**

Run:

```powershell
node --test --test-name-pattern="image metadata" tests/data.test.js
node --test tests/data.test.js
```

Expected: targeted test PASS; all 4 data tests PASS.

- [ ] **Step 5: Commit metadata separately**

```powershell
git add data.js tests/data.test.js
git commit -m "feat: add acupoint illustration metadata"
```

### Task 2: Generate and validate the 15 SVG assets

**Files:**
- Create: `tests/assets.test.js`
- Create: `scripts/generate-acupoint-svgs.js`
- Create: `assets/acupoints/LI4.svg`
- Create: `assets/acupoints/EX-HN5.svg`
- Create: `assets/acupoints/GB20.svg`
- Create: `assets/acupoints/LI20.svg`
- Create: `assets/acupoints/HT7.svg`
- Create: `assets/acupoints/EX-HN3.svg`
- Create: `assets/acupoints/GB21.svg`
- Create: `assets/acupoints/SI3.svg`
- Create: `assets/acupoints/LI10.svg`
- Create: `assets/acupoints/PC6.svg`
- Create: `assets/acupoints/ST36.svg`
- Create: `assets/acupoints/CV12.svg`
- Create: `assets/acupoints/GB34.svg`
- Create: `assets/acupoints/KI1.svg`
- Create: `assets/acupoints/BL40.svg`

- [ ] **Step 1: Write the failing asset safety tests**

Create `tests/assets.test.js`:

```js
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
  }
});
```

- [ ] **Step 2: Run the asset tests and verify RED**

Run: `node --test tests/assets.test.js`

Expected: FAIL because the first configured SVG file is missing.

- [ ] **Step 3: Create the deterministic SVG generator**

Create `scripts/generate-acupoint-svgs.js`:

```js
const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.join(__dirname, "..", "assets", "acupoints");

const templates = {
  "hand-dorsal": `
    <path class="body" d="M72 268 C96 224 106 176 124 138 C140 105 160 72 181 50 C194 37 211 47 205 65 L185 128 L220 53 C228 36 248 46 243 66 L217 142 L257 67 C267 49 286 62 278 80 L242 157 C278 137 320 135 360 152 C381 161 383 184 361 191 C319 198 294 205 270 232 C242 264 210 277 166 282 Z"/>
    <path class="landmark" d="M183 130 C212 146 236 164 261 193 M133 141 C164 154 190 176 210 207"/>
    <text x="84" y="296">手背 · 左右同取</text>`,
  "hand-ulnar": `
    <path class="body" d="M70 226 C112 191 142 164 180 150 C218 136 260 136 306 148 L401 181 C420 188 418 211 398 218 L306 235 C256 247 207 270 151 280 L84 279 Z"/>
    <path class="landmark" d="M168 179 Q206 199 252 198 M145 208 Q193 230 248 221"/>
    <text x="82" y="305">小指侧手部 · 握拳示意</text>`,
  "side-head": `
    <path class="body" d="M135 277 C116 234 109 180 121 129 C134 74 178 39 236 43 C298 47 340 92 344 151 C348 202 323 248 284 279 Z"/>
    <path class="landmark" d="M160 137 Q190 119 221 133 M221 133 Q246 147 271 135 M233 157 Q250 169 267 160"/>
    <circle class="landmark-fill" cx="223" cy="135" r="5"/>
    <text x="84" y="304">侧面头部 · 眉梢与外眼角</text>`,
  "front-face": `
    <path class="body" d="M149 278 C121 232 113 169 127 111 C143 57 187 30 240 31 C293 30 337 57 353 111 C367 169 359 232 331 278 Z"/>
    <path class="landmark" d="M159 127 Q195 108 222 127 M258 127 Q285 108 321 127 M240 117 L240 204 M209 221 Q240 237 271 221"/>
    <path class="landmark" d="M219 190 Q205 208 193 229 M261 190 Q275 208 287 229"/>
    <text x="96" y="304">正面面部 · 两侧对称</text>`,
  "neck-shoulder": `
    <path class="body" d="M154 54 Q240 18 326 54 L314 123 Q354 148 420 177 L430 286 L50 286 L60 177 Q126 148 166 123 Z"/>
    <path class="landmark" d="M181 73 Q240 109 299 73 M166 123 Q240 156 314 123 M240 110 L240 220 M82 187 Q163 166 240 183 Q317 166 398 187"/>
    <text x="118" y="308">后枕与肩部 · 左右同取</text>`,
  "forearm": `
    <path class="body" d="M105 75 Q143 45 181 58 L364 126 Q402 142 390 181 L360 253 Q347 283 313 272 L124 208 Q82 193 82 152 Z"/>
    <path class="landmark" d="M112 190 Q231 213 349 252 M128 169 Q242 191 365 226 M195 99 L153 205 M234 111 L194 217"/>
    <text x="92" y="305">前臂与腕部 · 掌侧/背侧见标注</text>`,
  "lower-leg": `
    <path class="body" d="M149 40 Q240 17 331 40 L343 108 Q326 145 307 166 L294 287 L186 287 L173 166 Q154 145 137 108 Z"/>
    <circle class="landmark" cx="240" cy="101" r="48"/>
    <path class="landmark" d="M214 143 L207 276 M278 143 L287 276"/>
    <text x="125" y="309">膝与小腿前外侧</text>`,
  "posterior-knee": `
    <path class="body" d="M149 36 Q240 18 331 36 L326 284 L154 284 Z"/>
    <path class="landmark" d="M163 151 Q240 177 317 151 M240 47 L240 279"/>
    <text x="145" y="308">膝后视图 · 横纹中点</text>`,
  abdomen: `
    <path class="body" d="M130 37 Q240 8 350 37 L368 286 L112 286 Z"/>
    <path class="landmark" d="M240 38 L240 282"/>
    <circle class="landmark-fill" cx="240" cy="215" r="9"/>
    <text x="117" y="309">上腹部 · 前正中线与肚脐</text>`,
  sole: `
    <path class="body" d="M171 289 C128 270 111 231 122 190 C131 155 149 134 151 98 C154 52 183 29 222 37 C262 45 287 82 295 126 C305 182 282 248 239 284 C219 300 193 300 171 289 Z"/>
    <path class="landmark" d="M156 122 Q214 144 284 125 M149 170 Q211 190 279 170"/>
    <text x="143" y="310">足底前部 · 左右同取</text>`,
};

const points = [
  ["LI4", "合谷", "hand-dorsal", 211, 157, 322, 93],
  ["EX-HN5", "太阳", "side-head", 286, 142, 375, 95],
  ["GB20", "风池", "neck-shoulder", 188, 111, 81, 71],
  ["LI20", "迎香", "front-face", 275, 193, 373, 172],
  ["HT7", "神门", "forearm", 338, 239, 407, 270],
  ["EX-HN3", "印堂", "front-face", 240, 126, 367, 80],
  ["GB21", "肩井", "neck-shoulder", 328, 174, 406, 129],
  ["SI3", "后溪", "hand-ulnar", 244, 218, 355, 265],
  ["LI10", "手三里", "forearm", 212, 143, 325, 80],
  ["PC6", "内关", "forearm", 282, 207, 405, 181],
  ["ST36", "足三里", "lower-leg", 288, 177, 395, 148],
  ["CV12", "中脘", "abdomen", 240, 145, 374, 111],
  ["GB34", "阳陵泉", "lower-leg", 313, 143, 408, 91],
  ["KI1", "涌泉", "sole", 213, 157, 356, 111],
  ["BL40", "委中", "posterior-knee", 240, 160, 369, 117],
];

function render([id, name, template, x, y, labelX, labelY]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" role="img" aria-labelledby="title desc">
  <title id="title">${name}位置示意图</title>
  <desc id="desc">局部轮廓、定位标志和${name}定位点示意，正式使用前需专业审核。</desc>
  <style>
    .body{fill:#efe0c9;stroke:#4f463d;stroke-width:4;stroke-linejoin:round}
    .landmark{fill:none;stroke:#a9967e;stroke-width:3;stroke-linecap:round;stroke-dasharray:7 7}
    .landmark-fill{fill:#a9967e}
    .leader{fill:none;stroke:#a24432;stroke-width:3}
    .acupoint-marker{fill:#a24432;stroke:#f2c8b7;stroke-width:9}
    text{fill:#28443a;font:16px sans-serif}.label{font-weight:700}.tag{font-size:13px;fill:#75685d}
  </style>
  <rect width="480" height="320" rx="24" fill="#fbf8f0"/>
  <text class="tag" x="24" y="30">位置示意图 · 未完成专业审核</text>
  ${templates[template]}
  <path class="leader" d="M${x} ${y} L${labelX} ${labelY}"/>
  <circle class="acupoint-marker" cx="${x}" cy="${y}" r="9"/>
  <rect x="${labelX - 38}" y="${labelY - 24}" width="76" height="34" rx="10" fill="#17382f"/>
  <text class="label" x="${labelX}" y="${labelY - 2}" text-anchor="middle" fill="#fffaf2">${name}</text>
</svg>\n`;
}

fs.mkdirSync(outputDir, { recursive: true });
for (const point of points) {
  fs.writeFileSync(path.join(outputDir, `${point[0]}.svg`), render(point), "utf8");
}
console.log(`Generated ${points.length} acupoint SVGs in ${outputDir}`);
```

- [ ] **Step 4: Generate the assets and run the asset tests**

Run:

```powershell
node scripts/generate-acupoint-svgs.js
node --test tests/assets.test.js
```

Expected: generator prints `Generated 15 acupoint SVGs`; 2 asset tests PASS.

- [ ] **Step 5: Prove generation is deterministic**

Run:

```powershell
git add assets/acupoints scripts/generate-acupoint-svgs.js tests/assets.test.js
node scripts/generate-acupoint-svgs.js
git diff --exit-code -- assets/acupoints
```

Expected: `git diff --exit-code` exits 0 and prints nothing.

- [ ] **Step 6: Commit generated assets and generator**

```powershell
git commit -m "feat: add local acupoint SVG illustrations"
```

### Task 3: Render figures with a text-only error fallback

**Files:**
- Modify: `tests/app.test.js`
- Modify: `app.js`

- [ ] **Step 1: Write the failing result-card test**

Append to `tests/app.test.js`:

```js
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.hidden = false;
    this.className = "";
    this.textContent = "";
  }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  dispatch(type) { if (this.listeners[type]) this.listeners[type](); }
}

function flatten(element) {
  return [element, ...element.children.flatMap(flatten)];
}

test("point card renders an accessible figure and hides only the figure on image error", () => {
  const doc = { createElement: (tag) => new FakeElement(tag) };
  const point = data.acupoints.find((item) => item.id === "LI4");
  const card = app.createPointCard(doc, point);
  const nodes = flatten(card);
  const figure = nodes.find((item) => item.tagName === "figure");
  const image = nodes.find((item) => item.tagName === "img");
  const location = nodes.find((item) => item.className === "point-location");

  assert.equal(image.src, point.image);
  assert.equal(image.alt, point.imageAlt);
  assert.equal(image.loading, "lazy");
  assert.equal(figure.hidden, false);
  image.dispatch("error");
  assert.equal(figure.hidden, true);
  assert.equal(location.textContent, point.location);
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
node --test --test-name-pattern="accessible figure" tests/app.test.js
```

Expected: FAIL because `app.createPointCard` is not defined.

- [ ] **Step 3: Add the card factory to `app.js`**

Add before `mount`:

```js
  function createPointCard(doc, point) {
    const article = doc.createElement("article");
    article.className = "point-card";

    const heading = doc.createElement("h2");
    heading.textContent = point.name;

    const figure = doc.createElement("figure");
    figure.className = "point-figure";
    const caption = doc.createElement("figcaption");
    caption.textContent = "位置示意图";
    const image = doc.createElement("img");
    image.src = point.image;
    image.alt = point.imageAlt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function () {
      figure.hidden = true;
    }, { once: true });
    figure.append(caption, image);

    const location = doc.createElement("p");
    location.className = "point-location";
    location.textContent = point.location;

    const caution = doc.createElement("small");
    caution.textContent = point.caution;
    article.append(heading, figure, location, caution);
    return article;
  }
```

Replace the current inline `model.acupoints.map` card-construction block in `render()` with:

```js
        const cards = model.acupoints.map((point) => createPointCard(doc, point));
```

Add `createPointCard` to the returned API:

```js
  return { createInitialState, getSymptoms, getAcupoints, reduce, buildViewModel, createPointCard, mount };
```

- [ ] **Step 4: Run targeted and full application tests**

Run:

```powershell
node --test --test-name-pattern="accessible figure" tests/app.test.js
node --test tests/app.test.js
```

Expected: targeted test PASS; all 7 app tests PASS.

- [ ] **Step 5: Commit card rendering**

```powershell
git add app.js tests/app.test.js
git commit -m "feat: render accessible acupoint figures"
```

### Task 4: Style the illustration figures responsively

**Files:**
- Modify: `tests/shell.test.js`
- Modify: `styles.css`

- [ ] **Step 1: Write the failing illustration-style contract**

Append to `tests/shell.test.js`:

```js
test("acupoint figures preserve the full SVG and remain responsive", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\.point-figure\s*\{/);
  assert.match(css, /\.point-figure img\s*\{/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*2/);
});
```

- [ ] **Step 2: Run the targeted CSS test and verify RED**

Run:

```powershell
node --test --test-name-pattern="acupoint figures" tests/shell.test.js
```

Expected: FAIL because `.point-figure` rules do not exist.

- [ ] **Step 3: Add the figure styles**

Insert after the existing `.point-card::before` rule in `styles.css`:

```css
.point-figure {
  position: relative;
  aspect-ratio: 3 / 2;
  margin: 0 0 1rem;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.85rem;
  background: var(--paper-bright);
}

.point-figure figcaption {
  position: absolute;
  z-index: 1;
  top: 0.65rem;
  left: 0.65rem;
  padding: 0.3rem 0.5rem;
  border-radius: 999px;
  color: var(--cinnabar-deep);
  background: rgba(251, 248, 240, 0.9);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.point-figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.point-location {
  min-height: 3.5em;
}
```

In the existing mobile media query, add:

```css
  .point-location {
    min-height: 0;
  }
```

- [ ] **Step 4: Run the targeted and full test suite**

Run:

```powershell
node --test --test-name-pattern="acupoint figures" tests/shell.test.js
node --test
```

Expected: targeted test PASS; full suite reports 20 tests PASS.

- [ ] **Step 5: Commit responsive figure styling**

```powershell
git add styles.css tests/shell.test.js
git commit -m "feat: style responsive acupoint illustrations"
```

### Task 5: Verify the complete illustrated result flow

**Files:**
- Modify only if a verification step exposes a defect: `data.js`, `app.js`, `styles.css`, `scripts/generate-acupoint-svgs.js`, `assets/acupoints/*.svg`, or the matching test.

- [ ] **Step 1: Run fresh syntax, generation, and automated checks**

Run:

```powershell
node --check data.js
node --check app.js
node --check scripts/generate-acupoint-svgs.js
node scripts/generate-acupoint-svgs.js
node --test
git diff --check
git status --short
```

Expected: syntax checks exit 0; generator reports 15 files; 20 tests PASS; whitespace check prints nothing; the generator produces no content changes.

- [ ] **Step 2: Inspect all SVG safety constraints**

Run:

```powershell
rg -n 'href="https?://|src="https?://|<script|<foreignObject|<image' assets/acupoints
rg -l "class=\"acupoint-marker\"" assets/acupoints | Measure-Object
```

Expected: first command has no matches; second command reports `Count : 15`.

- [ ] **Step 3: Exercise representative local-file paths manually**

Double-click `index.html`, then verify these paths:

```text
头面部 → 轻微头痛：合谷、风池、太阳 each show distinct figures
肩颈与上肢 → 肩颈紧绷：风池、肩井、后溪 show correct regional templates
胸腹与消化 → 餐后轻微腹胀：足三里 and 中脘 show leg/abdomen figures
腰背与下肢 → 腿部疲劳：足三里、阳陵泉、委中 show front/lateral/posterior orientation
```

Expected: each card shows its own image above the location text; no image is cropped; the “位置示意图” label and professional-review banner remain visible.

- [ ] **Step 4: Verify the image-error fallback manually**

Temporarily rename one SVG in a disposable copy of the project, reload the corresponding result, and restore the filename immediately after the check.

Expected: only that figure disappears; the point name, location, caution, other cards, and navigation remain usable. Do not perform this check in the working copy.

- [ ] **Step 5: Check responsive and accessible presentation**

At approximately 360px and 1280px widths and 200% zoom, inspect one 3-card result. Use keyboard navigation for the complete path.

Expected: no horizontal overflow; images remain 3:2 and fully visible; figures do not receive focus; alt text is present in the DOM; reduced-motion behavior remains unchanged.

- [ ] **Step 6: Commit only verified corrective changes, if any**

If verification exposes a defect, add a failing regression test first, implement the minimal fix, rerun the full suite, and commit:

```powershell
git add data.js app.js styles.css scripts/generate-acupoint-svgs.js assets/acupoints tests
git commit -m "fix: resolve acupoint illustration verification findings"
```
