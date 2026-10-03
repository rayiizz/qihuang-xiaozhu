# Local TCM Acupoint Reference Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully offline, double-clickable Chinese web app with a two-entry homepage, a guided body-region consultation flow, concise acupoint reference results, and a product-introduction view.

**Architecture:** Use one static HTML document with multiple hidden views, a classic-script immutable knowledge file, and a small state machine that owns navigation and selection. Keep medical data, state transitions, DOM rendering, and visual styling separate so the demonstration data can later be professionally reviewed or replaced without rewriting the interface.

**Tech Stack:** Semantic HTML5, CSS3, vanilla JavaScript (classic scripts), Node.js built-in `node:test` for zero-dependency tests.

---

## Scope and file map

- Create `index.html`: semantic containers for the homepage, product introduction, safety gate, guided consultation steps, and results.
- Create `styles.css`: tokens, responsive layout, focus states, reduced-motion handling, and the approved modern-Chinese visual direction.
- Create `data.js`: immutable regions, symptoms, acupoints, safety messages, and source metadata.
- Create `app.js`: pure state transitions plus DOM rendering and event binding.
- Create `tests/shell.test.js`: static-document and script-order contract.
- Create `tests/data.test.js`: dataset counts, referential integrity, and medical-review marker checks.
- Create `tests/app.test.js`: state-machine, filtering, back-navigation, invalid-data, and reset behavior.

No package manager, build output, remote font, remote image, framework, router, local storage, service worker, analytics, or network request is included.

## Content provenance and release constraint

Acupoint naming and locations must be checked against the [WHO Standard Acupuncture Point Locations](https://iris.who.int/bitstream/handle/10665/353407/9789290613831-eng.pdf?isAllowed=y&sequence=1) and the Chinese national standard entry [GB/T 12346-2021 经穴名称与定位](https://std.samr.gov.cn/gb/search/gbDetailed?id=E116673DFF79A3B7E05397BE0A0AC6BF). LI4 pregnancy and skin-safety warnings have an additional patient-education reference from [Memorial Sloan Kettering Cancer Center](https://www.mskcc.org/cancer-care/patient-education/acupressure-pain-and-headaches). ST36 has a public-health reference from the [Beijing Administration of Traditional Chinese Medicine](https://zyj.beijing.gov.cn/sy/whkp/202102/t20210201_2250651.html).

The initial mappings are interface demonstration content. The application must visibly show “演示内容尚未完成专业审核” until a qualified TCM professional reviews the dataset. Removing that badge is outside this plan.

### Task 1: Establish the offline document contract

**Files:**
- Create: `tests/shell.test.js`
- Create: `index.html`

- [ ] **Step 1: Write the failing shell contract test**

Create `tests/shell.test.js`:

```js
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
```

- [ ] **Step 2: Run the test and confirm the expected failure**

Run:

```powershell
node --test tests/shell.test.js
```

Expected: FAIL with `ENOENT` for `index.html`.

- [ ] **Step 3: Create the complete semantic document**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="完全离线的日常穴位知识参考工具">
  <title>岐黄小助｜本地穴位参考</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <header class="site-header">
    <button class="brand" type="button" data-action="home" aria-label="返回首页">岐黄小助</button>
    <span class="local-badge">本地运行 · 隐私优先</span>
  </header>

  <main id="main-content" class="app-shell">
    <p class="review-banner" role="status">演示内容尚未完成专业审核</p>

    <section id="view-home" class="view is-active" data-view="home" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">日常轻微不适的穴位参考</p>
        <h1 id="home-title" tabindex="-1">从一处不适开始，找到一份温和参考。</h1>
        <p>完全离线运行，不上传你的选择。内容仅作健康知识参考。</p>
      </div>
      <div class="entry-grid">
        <button class="entry-card entry-card--primary" type="button" data-action="open-consultation">
          <span class="entry-kicker">主要入口</span>
          <span class="entry-title">在线问诊</span>
          <span>逐步选择不适部位与具体感受</span>
        </button>
        <button class="entry-card" type="button" data-action="open-product">
          <span class="entry-kicker">了解更多</span>
          <span class="entry-title">产品介绍</span>
          <span>了解理念、能力、隐私与使用边界</span>
        </button>
      </div>
      <p class="legal-note">仅供日常健康知识参考，不构成诊断或治疗建议。</p>
    </section>

    <section id="view-product" class="view" data-view="product" aria-labelledby="product-title" hidden>
      <button class="text-button" type="button" data-action="back">← 返回</button>
      <p class="eyebrow">产品介绍</p>
      <h1 id="product-title" tabindex="-1">一款尊重隐私边界的本地参考工具</h1>
      <div class="info-grid">
        <article><h2>产品理念</h2><p>把复杂的穴位知识整理为清楚、克制、易理解的日常参考。</p></article>
        <article><h2>主要能力</h2><p>通过部位与不适的逐步选择，展示简洁的穴位名称和定位。</p></article>
        <article><h2>隐私方式</h2><p>网页完全在本机运行，不要求账号，不保存或上传当次选择。</p></article>
        <article><h2>使用边界</h2><p>不诊断疾病，不处理急症，不替代医生或专业治疗。</p></article>
      </div>
    </section>

    <section id="view-safety" class="view" data-view="safety" aria-labelledby="safety-title" hidden>
      <button class="text-button" type="button" data-action="back">← 返回</button>
      <p class="eyebrow">开始前请确认</p>
      <h1 id="safety-title" tabindex="-1">以下情况请停止自助查询并及时就医</h1>
      <ul id="red-flag-list" class="warning-list"></ul>
      <div class="notice">不要按压破损、感染、红肿或明显疼痛的皮肤；孕期或有严重基础疾病时先咨询专业人员。</div>
      <button class="primary-button" type="button" data-action="accept-safety">我已了解，继续</button>
    </section>

    <section id="view-regions" class="view" data-view="regions" aria-labelledby="regions-title" hidden>
      <div class="step-row"><button class="text-button" type="button" data-action="back">← 返回</button><span>第 1 步，共 2 步</span></div>
      <div class="progress" aria-hidden="true"><span style="width:50%"></span></div>
      <h1 id="regions-title" tabindex="-1">主要是哪里不舒服？</h1>
      <div id="region-options" class="option-grid"></div>
    </section>

    <section id="view-symptoms" class="view" data-view="symptoms" aria-labelledby="symptoms-title" hidden>
      <div class="step-row"><button class="text-button" type="button" data-action="back">← 上一步</button><span>第 2 步，共 2 步</span></div>
      <div class="progress" aria-hidden="true"><span style="width:100%"></span></div>
      <p id="selected-region" class="eyebrow"></p>
      <h1 id="symptoms-title" tabindex="-1">更接近哪一种轻微不适？</h1>
      <div id="symptom-options" class="option-grid"></div>
      <p id="symptom-empty" class="empty-state" hidden>该部位的演示内容尚未收录，请返回选择其他部位。</p>
    </section>

    <section id="view-result" class="view" data-view="result" aria-labelledby="result-title" hidden>
      <button class="text-button" type="button" data-action="back">← 修改选择</button>
      <p class="eyebrow">参考结果</p>
      <h1 id="result-title" tabindex="-1">可了解这些穴位</h1>
      <p id="result-summary" class="result-summary"></p>
      <div id="acupoint-results" class="result-grid"></div>
      <p id="result-empty" class="empty-state" hidden>没有找到可靠的演示数据。请勿自行猜测或继续按压。</p>
      <div class="notice">仅供日常健康知识参考，不构成诊断或治疗建议。</div>
      <div class="button-row">
        <button class="secondary-button" type="button" data-action="restart">重新开始</button>
        <button class="primary-button" type="button" data-action="home">返回首页</button>
      </div>
    </section>
  </main>

  <noscript><p class="noscript">问诊功能需要启用 JavaScript。你仍可阅读本页的产品定位与安全说明。</p></noscript>
  <script src="data.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Run the shell test and confirm it passes**

Run: `node --test tests/shell.test.js`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the document shell**

```powershell
git add index.html tests/shell.test.js
git commit -m "feat: add offline application shell"
```

### Task 2: Add a validated, visibly unreviewed demonstration dataset

**Files:**
- Create: `tests/data.test.js`
- Create: `data.js`

- [ ] **Step 1: Write the failing dataset contract test**

Create `tests/data.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data.js");

test("dataset has the agreed initial scope", () => {
  assert.equal(data.reviewStatus, "professional-review-required");
  assert.equal(data.bodyRegions.length, 4);
  assert.equal(data.symptoms.length, 12);
  assert.equal(data.acupoints.length, 15);
  assert.ok(data.safetyNotices.redFlags.length >= 5);
});

test("all relationships resolve and every result stays concise", () => {
  const regionIds = new Set(data.bodyRegions.map((item) => item.id));
  const symptomIds = new Set(data.symptoms.map((item) => item.id));
  const pointIds = new Set(data.acupoints.map((item) => item.id));

  for (const symptom of data.symptoms) {
    assert.ok(regionIds.has(symptom.regionId), `${symptom.id} has an unknown region`);
    assert.ok(symptom.acupointIds.length >= 1 && symptom.acupointIds.length <= 3);
    for (const id of symptom.acupointIds) assert.ok(pointIds.has(id), `${id} is unknown`);
  }

  for (const region of data.bodyRegions) {
    assert.ok(data.symptoms.some((item) => item.regionId === region.id));
  }

  for (const point of data.acupoints) {
    assert.ok(point.location.length <= 48, `${point.name} location is too long`);
    assert.ok(point.sourceIds.length >= 1);
  }
  assert.equal(symptomIds.size, data.symptoms.length);
});

test("data is immutable", () => {
  assert.ok(Object.isFrozen(data));
  assert.ok(Object.isFrozen(data.bodyRegions));
  assert.ok(Object.isFrozen(data.acupoints[0]));
});
```

- [ ] **Step 2: Run the data test and confirm the expected failure**

Run: `node --test tests/data.test.js`

Expected: FAIL with `Cannot find module '../data.js'`.

- [ ] **Step 3: Create the exact initial data file**

Create `data.js`:

```js
(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  root.TCM_DATA = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  return deepFreeze({
    reviewStatus: "professional-review-required",
    sources: {
      WHO2008: "WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008)",
      GBT12346: "GB/T 12346-2021 经穴名称与定位",
      MSKCCLI4: "MSKCC Acupressure for Pain and Headaches",
      BEIJINGST36: "北京市中医药管理局：足三里科普",
    },
    safetyNotices: {
      redFlags: [
        "胸痛、呼吸困难或嘴唇发紫",
        "突然出现偏瘫、口角歪斜、言语不清或意识异常",
        "高热不退、抽搐或剧烈且快速加重的疼痛",
        "严重外伤、大量出血或疑似骨折",
        "孕期出现腹痛、出血、胎动异常或其他紧急不适",
      ],
      skin: "不要按压破损、感染、红肿、化脓或明显疼痛的皮肤。",
      pregnancy: "孕期不要自行按压合谷、肩井等穴位；任何不适先咨询专业人员。",
    },
    bodyRegions: [
      { id: "head-face", name: "头面部", hint: "头部、眼部、鼻部与睡眠" },
      { id: "shoulder-upper", name: "肩颈与上肢", hint: "颈肩、手臂、手腕" },
      { id: "chest-abdomen", name: "胸腹与消化", hint: "恶心、腹胀与呃逆" },
      { id: "lower-body", name: "腰背与下肢", hint: "腿部与足部疲劳" },
    ],
    symptoms: [
      { id: "mild-headache", regionId: "head-face", name: "轻微头痛", acupointIds: ["LI4", "GB20", "EX-HN5"] },
      { id: "eye-strain", regionId: "head-face", name: "眼部疲劳", acupointIds: ["GB20", "LI4"] },
      { id: "nasal-stuffiness", regionId: "head-face", name: "轻微鼻塞", acupointIds: ["LI20", "LI4"] },
      { id: "settling-sleep", regionId: "head-face", name: "入睡前难以放松", acupointIds: ["HT7", "EX-HN3"] },
      { id: "neck-shoulder", regionId: "shoulder-upper", name: "肩颈紧绷", acupointIds: ["GB20", "GB21", "SI3"] },
      { id: "arm-fatigue", regionId: "shoulder-upper", name: "手臂疲劳", acupointIds: ["LI10", "LI4"] },
      { id: "wrist-fatigue", regionId: "shoulder-upper", name: "手腕疲劳", acupointIds: ["PC6", "LI4"] },
      { id: "mild-nausea", regionId: "chest-abdomen", name: "轻微恶心", acupointIds: ["PC6", "ST36"] },
      { id: "post-meal-bloating", regionId: "chest-abdomen", name: "餐后轻微腹胀", acupointIds: ["ST36", "CV12"] },
      { id: "mild-hiccup", regionId: "chest-abdomen", name: "短暂呃逆", acupointIds: ["PC6", "CV12"] },
      { id: "leg-fatigue", regionId: "lower-body", name: "腿部疲劳", acupointIds: ["ST36", "GB34", "BL40"] },
      { id: "foot-fatigue", regionId: "lower-body", name: "足部疲劳", acupointIds: ["KI1", "ST36"] },
    ],
    acupoints: [
      { id: "LI4", name: "合谷", location: "手背第一、二掌骨之间，靠近第二掌骨中点处。", caution: "孕期不自行按压。", sourceIds: ["GBT12346", "WHO2008", "MSKCCLI4"] },
      { id: "EX-HN5", name: "太阳", location: "眉梢与外眼角之间向后约一横指的凹陷处。", caution: "避开眼球和受伤皮肤。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB20", name: "风池", location: "后枕骨下，胸锁乳突肌与斜方肌上端之间凹陷处。", caution: "轻触即可，不向颈前方深压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "LI20", name: "迎香", location: "鼻翼外缘中点旁，鼻唇沟中。", caution: "避开鼻部炎症或破损皮肤。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "HT7", name: "神门", location: "腕掌侧横纹靠小指一端的凹陷处。", caution: "局部受伤时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "EX-HN3", name: "印堂", location: "前额，两眉头连线的中点。", caution: "皮肤不适时停止。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB21", name: "肩井", location: "肩部，大椎与肩峰最外侧连线的中点。", caution: "孕期不自行按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "SI3", name: "后溪", location: "握拳时，小指掌指关节后方掌横纹末端。", caution: "手部受伤时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "LI10", name: "手三里", location: "前臂背面，肘横纹下约三横指。", caution: "局部肿痛时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "PC6", name: "内关", location: "前臂掌侧，腕横纹上约三横指，两筋之间。", caution: "腕部受伤时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "ST36", name: "足三里", location: "小腿前外侧，膝盖外下方约四横指。", caution: "局部受伤或感染时不按压。", sourceIds: ["GBT12346", "WHO2008", "BEIJINGST36"] },
      { id: "CV12", name: "中脘", location: "上腹部前正中线，肚脐上方约一掌宽。", caution: "孕期或急性腹痛时不自行按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "GB34", name: "阳陵泉", location: "小腿外侧，腓骨小头前下方凹陷处。", caution: "膝腿受伤时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "KI1", name: "涌泉", location: "足底前部，蜷足时足底出现的凹陷处。", caution: "足部破损或感染时不按压。", sourceIds: ["GBT12346", "WHO2008"] },
      { id: "BL40", name: "委中", location: "膝后横纹的中点。", caution: "静脉曲张、肿胀或疼痛处不按压。", sourceIds: ["GBT12346", "WHO2008"] },
    ],
  });
});
```

- [ ] **Step 4: Run the dataset test and confirm it passes**

Run: `node --test tests/data.test.js`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the dataset and its contract**

```powershell
git add data.js tests/data.test.js
git commit -m "feat: add validated demonstration knowledge data"
```

### Task 3: Implement the consultation state machine test-first

**Files:**
- Create: `tests/app.test.js`
- Create: `app.js`

- [ ] **Step 1: Write failing state and lookup tests**

Create `tests/app.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const data = require("../data.js");
const app = require("../app.js");

test("happy path reaches a result with one to three points", () => {
  let state = app.createInitialState();
  state = app.reduce(state, { type: "OPEN_CONSULTATION" }, data);
  assert.equal(state.view, "safety");
  state = app.reduce(state, { type: "ACCEPT_SAFETY" }, data);
  state = app.reduce(state, { type: "SELECT_REGION", id: "head-face" }, data);
  state = app.reduce(state, { type: "SELECT_SYMPTOM", id: "mild-headache" }, data);
  assert.deepEqual(state, { view: "result", regionId: "head-face", symptomId: "mild-headache" });
  assert.ok(app.getAcupoints(data, state.symptomId).length <= 3);
});

test("invalid or mismatched identifiers never advance", () => {
  const regionState = { view: "regions", regionId: null, symptomId: null };
  assert.deepEqual(app.reduce(regionState, { type: "SELECT_REGION", id: "missing" }, data), regionState);
  const symptomState = { view: "symptoms", regionId: "head-face", symptomId: null };
  assert.deepEqual(app.reduce(symptomState, { type: "SELECT_SYMPTOM", id: "leg-fatigue" }, data), symptomState);
  assert.deepEqual(app.getAcupoints(data, "missing"), []);
});

test("back, restart, product, and home transitions are deterministic", () => {
  const result = { view: "result", regionId: "head-face", symptomId: "mild-headache" };
  assert.equal(app.reduce(result, { type: "BACK" }, data).view, "symptoms");
  assert.deepEqual(app.reduce(result, { type: "RESTART" }, data), { view: "regions", regionId: null, symptomId: null });
  assert.equal(app.reduce(app.createInitialState(), { type: "OPEN_PRODUCT" }, data).view, "product");
  assert.deepEqual(app.reduce(result, { type: "HOME" }, data), app.createInitialState());
});

test("region filtering is isolated and unknown regions return an empty list", () => {
  const items = app.getSymptoms(data, "chest-abdomen");
  assert.equal(items.length, 3);
  assert.ok(items.every((item) => item.regionId === "chest-abdomen"));
  assert.deepEqual(app.getSymptoms(data, "missing"), []);
});
```

- [ ] **Step 2: Run the app test and confirm the expected failure**

Run: `node --test tests/app.test.js`

Expected: FAIL with `Cannot find module '../app.js'`.

- [ ] **Step 3: Implement the pure application API**

Create `app.js` with the pure API first:

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.TCM_APP = api;
  if (root.document) root.document.addEventListener("DOMContentLoaded", function () {
    api.mount(root.document, root.TCM_DATA);
  });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const initial = Object.freeze({ view: "home", regionId: null, symptomId: null });

  function createInitialState() {
    return { ...initial };
  }

  function getSymptoms(data, regionId) {
    if (!data || !Array.isArray(data.symptoms)) return [];
    return data.symptoms.filter((item) => item.regionId === regionId);
  }

  function getAcupoints(data, symptomId) {
    if (!data || !Array.isArray(data.symptoms) || !Array.isArray(data.acupoints)) return [];
    const symptom = data.symptoms.find((item) => item.id === symptomId);
    if (!symptom) return [];
    const byId = new Map(data.acupoints.map((item) => [item.id, item]));
    return symptom.acupointIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 3);
  }

  function reduce(state, event, data) {
    switch (event.type) {
      case "OPEN_CONSULTATION": return { view: "safety", regionId: null, symptomId: null };
      case "OPEN_PRODUCT": return { view: "product", regionId: null, symptomId: null };
      case "ACCEPT_SAFETY": return { view: "regions", regionId: null, symptomId: null };
      case "SELECT_REGION": {
        const exists = data.bodyRegions.some((item) => item.id === event.id);
        return exists ? { view: "symptoms", regionId: event.id, symptomId: null } : state;
      }
      case "SELECT_SYMPTOM": {
        const exists = data.symptoms.some((item) => item.id === event.id && item.regionId === state.regionId);
        return exists ? { ...state, view: "result", symptomId: event.id } : state;
      }
      case "BACK":
        if (state.view === "result") return { ...state, view: "symptoms", symptomId: null };
        if (state.view === "symptoms") return { view: "regions", regionId: null, symptomId: null };
        if (state.view === "regions") return { view: "safety", regionId: null, symptomId: null };
        return createInitialState();
      case "RESTART": return { view: "regions", regionId: null, symptomId: null };
      case "HOME": return createInitialState();
      default: return state;
    }
  }

  function mount() {}

  return { createInitialState, getSymptoms, getAcupoints, reduce, mount };
});
```

- [ ] **Step 4: Run the pure tests and confirm they pass**

Run: `node --test tests/app.test.js`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the pure application logic**

```powershell
git add app.js tests/app.test.js
git commit -m "feat: add guided consultation state machine"
```

### Task 4: Connect the state machine to the semantic views

**Files:**
- Modify: `app.js`
- Modify: `tests/app.test.js`

- [ ] **Step 1: Add a failing view-model test**

Append to `tests/app.test.js`:

```js
test("result view model resolves display names and safe fallback", () => {
  const ready = app.buildViewModel({ view: "result", regionId: "head-face", symptomId: "mild-headache" }, data);
  assert.equal(ready.region.name, "头面部");
  assert.equal(ready.symptom.name, "轻微头痛");
  assert.equal(ready.acupoints.length, 3);

  const broken = app.buildViewModel({ view: "result", regionId: "missing", symptomId: "missing" }, data);
  assert.equal(broken.region, null);
  assert.equal(broken.symptom, null);
  assert.deepEqual(broken.acupoints, []);
});
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `node --test --test-name-pattern="result view model" tests/app.test.js`

Expected: FAIL because `app.buildViewModel` is not defined.

- [ ] **Step 3: Add the view model and DOM controller**

In `app.js`, add these functions before `mount`, replace the empty `mount`, and include `buildViewModel` in the returned API:

```js
  function buildViewModel(state, data) {
    const region = data.bodyRegions.find((item) => item.id === state.regionId) || null;
    const symptom = data.symptoms.find((item) => item.id === state.symptomId) || null;
    return {
      ...state,
      region,
      symptom,
      symptoms: getSymptoms(data, state.regionId),
      acupoints: getAcupoints(data, state.symptomId),
    };
  }

  function makeButton(doc, item, action) {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "option-card";
    button.dataset.action = action;
    button.dataset.id = item.id;
    const title = doc.createElement("strong");
    title.textContent = item.name;
    button.appendChild(title);
    if (item.hint) {
      const hint = doc.createElement("span");
      hint.textContent = item.hint;
      button.appendChild(hint);
    }
    return button;
  }

  function mount(doc, data) {
    if (!data) return;
    let state = createInitialState();
    const views = Array.from(doc.querySelectorAll("[data-view]"));
    const regionOptions = doc.querySelector("#region-options");
    const symptomOptions = doc.querySelector("#symptom-options");
    const pointResults = doc.querySelector("#acupoint-results");
    const symptomEmpty = doc.querySelector("#symptom-empty");
    const resultEmpty = doc.querySelector("#result-empty");
    const redFlagList = doc.querySelector("#red-flag-list");

    data.safetyNotices.redFlags.forEach((message) => {
      const item = doc.createElement("li");
      item.textContent = message;
      redFlagList.appendChild(item);
    });

    function render() {
      const model = buildViewModel(state, data);
      views.forEach((view) => {
        const active = view.dataset.view === state.view;
        view.hidden = !active;
        view.classList.toggle("is-active", active);
      });

      if (state.view === "regions") {
        regionOptions.replaceChildren(...data.bodyRegions.map((item) => makeButton(doc, item, "select-region")));
      }

      if (state.view === "symptoms") {
        doc.querySelector("#selected-region").textContent = model.region ? model.region.name : "";
        symptomOptions.replaceChildren(...model.symptoms.map((item) => makeButton(doc, item, "select-symptom")));
        symptomEmpty.hidden = model.symptoms.length > 0;
      }

      if (state.view === "result") {
        doc.querySelector("#result-summary").textContent = model.symptom ? `你选择了：${model.symptom.name}` : "";
        const cards = model.acupoints.map((point) => {
          const article = doc.createElement("article");
          article.className = "point-card";
          const heading = doc.createElement("h2");
          heading.textContent = point.name;
          const location = doc.createElement("p");
          location.textContent = point.location;
          const caution = doc.createElement("small");
          caution.textContent = point.caution;
          article.append(heading, location, caution);
          return article;
        });
        pointResults.replaceChildren(...cards);
        resultEmpty.hidden = cards.length > 0;
      }

      const activeHeading = doc.querySelector(`[data-view="${state.view}"] h1`);
      if (activeHeading) activeHeading.focus();
    }

    doc.addEventListener("click", (event) => {
      const control = event.target.closest("[data-action]");
      if (!control) return;
      const actionMap = {
        "open-consultation": "OPEN_CONSULTATION",
        "open-product": "OPEN_PRODUCT",
        "accept-safety": "ACCEPT_SAFETY",
        "select-region": "SELECT_REGION",
        "select-symptom": "SELECT_SYMPTOM",
        back: "BACK",
        restart: "RESTART",
        home: "HOME",
      };
      state = reduce(state, { type: actionMap[control.dataset.action], id: control.dataset.id }, data);
      render();
    });

    render();
  }
```

Replace the return line with:

```js
  return { createInitialState, getSymptoms, getAcupoints, reduce, buildViewModel, mount };
```

- [ ] **Step 4: Run all JavaScript tests**

Run: `node --test`

Expected: 11 tests PASS.

- [ ] **Step 5: Commit the DOM integration**

```powershell
git add app.js tests/app.test.js
git commit -m "feat: connect consultation flow to page views"
```

### Task 5: Apply the approved visual system and responsive behavior

**Files:**
- Create: `styles.css`
- Modify: `tests/shell.test.js`

- [ ] **Step 1: Add a failing CSS contract test**

Append to `tests/shell.test.js`:

```js
test("stylesheet includes responsive, focus, hidden, and reduced-motion rules", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\[hidden\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run the CSS contract test and confirm it fails**

Run: `node --test --test-name-pattern="stylesheet" tests/shell.test.js`

Expected: FAIL with `ENOENT` for `styles.css`.

- [ ] **Step 3: Create the complete visual system**

Create `styles.css`:

```css
:root {
  --paper: #f2eee3;
  --paper-2: #fffaf2;
  --ink: #22352d;
  --muted: #6f7b74;
  --green: #24463a;
  --green-soft: #dfe8dd;
  --line: #d8d2c6;
  --warn: #8a3f31;
  --warn-bg: #fff1eb;
  --shadow: 0 18px 50px rgba(39, 54, 46, 0.1);
  --radius: 20px;
  font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
}

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--paper); }
body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 90% 0%, #dce6da 0 14rem, transparent 14.1rem), var(--paper); }
button { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
[hidden] { display: none !important; }

.skip-link { position: fixed; left: 1rem; top: -4rem; z-index: 20; padding: .75rem 1rem; background: var(--green); color: white; border-radius: 10px; }
.skip-link:focus { top: 1rem; }
.site-header { width: min(1100px, calc(100% - 2rem)); margin: 0 auto; min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.brand { border: 0; padding: .4rem 0; background: transparent; color: var(--ink); font-weight: 800; letter-spacing: .12em; cursor: pointer; }
.local-badge { border: 1px solid var(--line); border-radius: 999px; padding: .4rem .7rem; color: var(--muted); font-size: .75rem; background: rgba(255,255,255,.4); }
.app-shell { width: min(1100px, calc(100% - 2rem)); margin: 0 auto 4rem; }
.review-banner { width: fit-content; margin: .25rem 0 2rem; padding: .45rem .75rem; border-radius: 999px; color: var(--warn); background: var(--warn-bg); font-size: .78rem; font-weight: 700; }
.view { animation: reveal .25s ease both; }
.hero-copy { max-width: 720px; margin: 8vh 0 3rem; }
.eyebrow { color: var(--muted); font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: .5rem 0 1rem; max-width: 850px; font-family: "STSong", "SimSun", serif; font-size: clamp(2rem, 5vw, 4rem); line-height: 1.15; font-weight: 600; }
h2 { margin: 0 0 .6rem; font-size: 1.2rem; }
p { line-height: 1.75; }
.entry-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 1rem; }
.entry-card { min-height: 180px; padding: 1.5rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: .55rem; text-align: left; color: var(--ink); border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-2); box-shadow: var(--shadow); cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
.entry-card:hover { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(39, 54, 46, .14); }
.entry-card--primary { min-height: 230px; color: white; border-color: var(--green); background: var(--green); }
.entry-kicker { opacity: .72; font-size: .75rem; }
.entry-title { font-family: "STSong", "SimSun", serif; font-size: 1.75rem; }
.legal-note { margin-top: 1.5rem; color: var(--muted); font-size: .8rem; }
.text-button { margin-bottom: 1.5rem; border: 0; background: transparent; color: var(--green); font-weight: 700; cursor: pointer; }
.info-grid, .option-grid, .result-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.info-grid article, .point-card { padding: 1.35rem; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,250,242,.85); }
.warning-list { padding: 1rem 1rem 1rem 2.4rem; border-left: 4px solid var(--warn); border-radius: 8px 16px 16px 8px; background: var(--warn-bg); line-height: 1.8; }
.notice { margin: 1.5rem 0; padding: 1rem; border: 1px solid var(--line); border-radius: 14px; background: rgba(255,255,255,.45); line-height: 1.7; }
.primary-button, .secondary-button { min-height: 48px; padding: .75rem 1.15rem; border-radius: 12px; font-weight: 800; cursor: pointer; }
.primary-button { border: 1px solid var(--green); background: var(--green); color: white; }
.secondary-button { border: 1px solid var(--line); background: var(--paper-2); color: var(--ink); }
.step-row, .button-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.progress { height: 5px; margin: 0 0 2rem; overflow: hidden; border-radius: 999px; background: #d9ddd7; }
.progress span { display: block; height: 100%; border-radius: inherit; background: var(--green); }
.option-card { min-height: 120px; padding: 1.25rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: .45rem; text-align: left; border: 1px solid var(--line); border-radius: 16px; color: var(--ink); background: var(--paper-2); cursor: pointer; }
.option-card strong { font-size: 1.15rem; }
.option-card span, .point-card small { color: var(--muted); }
.point-card small { display: block; padding-top: .8rem; border-top: 1px solid var(--line); line-height: 1.6; }
.result-summary, .empty-state { color: var(--muted); }
.empty-state { padding: 1rem; border-radius: 12px; background: var(--warn-bg); }
.noscript { margin: 1rem; padding: 1rem; border: 1px solid var(--warn); background: var(--warn-bg); }

button:focus-visible, a:focus-visible, [tabindex="-1"]:focus-visible { outline: 3px solid #bb6a43; outline-offset: 4px; }
@keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

@media (max-width: 700px) {
  body { background: var(--paper); }
  .site-header, .app-shell { width: min(100% - 1.25rem, 1100px); }
  .hero-copy { margin-top: 5vh; }
  .entry-grid, .info-grid, .option-grid, .result-grid { grid-template-columns: 1fr; }
  .entry-card, .entry-card--primary { min-height: 150px; }
  .button-row { align-items: stretch; flex-direction: column-reverse; }
  .button-row button { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 4: Run every automated test**

Run: `node --test`

Expected: 12 tests PASS.

- [ ] **Step 5: Commit the visual system**

```powershell
git add styles.css tests/shell.test.js
git commit -m "feat: add responsive modern Chinese visual system"
```

### Task 6: Verify the complete offline experience

**Files:**
- Modify only if a verification step exposes a defect: `index.html`, `styles.css`, `data.js`, `app.js`, or the corresponding test.

- [ ] **Step 1: Run syntax and automated regression checks**

Run:

```powershell
node --check data.js
node --check app.js
node --test
git diff --check
```

Expected: both syntax checks exit 0, all 12 tests PASS, and `git diff --check` prints nothing.

- [ ] **Step 2: Verify direct-file startup**

Open the absolute `file:///.../index.html` path in the in-app browser or default browser without starting an HTTP server.

Expected: the page renders with no remote-resource or cross-origin error; the homepage shows the primary “在线问诊” card and secondary “产品介绍” card.

- [ ] **Step 3: Exercise the primary guided path**

Perform exactly:

```text
首页 → 在线问诊 → 阅读安全说明 → 我已了解，继续
→ 头面部 → 轻微头痛 → 修改选择 → 轻微鼻塞
→ 重新开始 → 肩颈与上肢 → 肩颈紧绷 → 返回首页
```

Expected: headings receive focus after each view change; each result shows 1–3 cards; the review banner and disclaimer remain visible; restart clears both selections.

- [ ] **Step 4: Exercise the secondary and fallback paths**

Verify:

```text
首页 → 产品介绍 → 返回
问诊安全页 → 返回
data.js 中临时把一个症状的 acupointIds 改为 ["missing"] → 结果页
```

Expected: product and safety back actions return home; broken data produces the explicit empty-state message and no guessed result. Restore the valid ID immediately after the check and rerun the tests.

- [ ] **Step 5: Check responsive and keyboard behavior**

At approximately 360px and 1280px viewport widths, complete one consultation using only `Tab`, `Shift+Tab`, `Enter`, and `Space`.

Expected: no horizontal overflow; focus is always visible; entry and option cards become a single column on mobile; content remains readable at 200% zoom; reduced-motion emulation removes visible transitions.

- [ ] **Step 6: Confirm repository state and create the verification commit only if fixes were needed**

Run:

```powershell
git status --short
git log --oneline -5
```

Expected: no uncommitted product files. If verification required a fix, first add a regression assertion to the relevant test, then commit the focused fix:

```powershell
git add index.html styles.css data.js app.js tests
git commit -m "fix: resolve offline verification findings"
```
