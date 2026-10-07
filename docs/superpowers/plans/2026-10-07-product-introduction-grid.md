# Product Introduction Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive four-card product introduction section with neutral, source-based copy and local images.

**Architecture:** Store immutable product records beside the existing site data, render semantic product cards through a focused `createProductCard` function, and mount them into a static product-grid container. Keep all assets local and extend the established paper/jade/cinnabar design system with responsive and accessible disclosure styles.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Node.js built-in test runner.

---

### Task 1: Add the product data contract

**Files:**
- Modify: `tests/data.test.js`
- Modify: `data.js`

- [ ] **Step 1: Write the failing product data test**

Append a test that requires exactly four unique products and validates the complete record shape:

```js
test("product introductions contain four complete neutral records", () => {
  assert.equal(data.products.length, 4);
  assert.deepEqual(data.products.map((item) => item.name), [
    "闪亮菁华眼贴",
    "易灸灸蕲艾敷贴",
    "全元倍生·小双瓶",
    "芝麻丸",
  ]);
  for (const product of data.products) {
    assert.match(product.image, /^assets\/products\/[a-z-]+\.(?:jpg|png)$/);
    assert.ok(product.imageAlt.length >= 8);
    assert.ok(product.type.length > 0);
    assert.ok(product.summary.length > 0);
    assert.ok(product.composition.length > 0);
    assert.ok(product.usage.length > 0);
    assert.ok(product.caution.length > 0);
  }
  assert.equal(new Set(data.products.map((item) => item.id)).size, 4);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/data.test.js`

Expected: FAIL because `data.products` is undefined.

- [ ] **Step 3: Add the four immutable product records**

Add a `products` array to the object returned by `data.js`. Each record must use these properties: `id`, `name`, `type`, `summary`, `composition`, `usage`, `caution`, `image`, and `imageAlt`. Use the approved neutral copy:

```js
products: [
  {
    id: "brightening-eye-mask",
    name: "闪亮菁华眼贴",
    type: "眼周外用贴",
    summary: "用于长时间用眼后的日常眼周放松。",
    composition: "资料列出天然冰片、蕲艾、薄荷脑、黄柏、野菊花与活性蓝莓等成分。",
    usage: "清洁眼周后贴敷约 15 分钟；具体频次以产品包装说明为准。",
    caution: "仅限外用，避免接触眼球、黏膜及破损皮肤；出现刺激或不适时立即停用。",
    image: "assets/products/eye-mask.jpg",
    imageAlt: "闪亮菁华眼贴产品资料图",
  },
  {
    id: "moxa-herbal-patch",
    name: "易灸灸蕲艾敷贴",
    type: "蕲艾自发热外用敷贴",
    summary: "由蕲艾植物包、植物精油与自发热结构组成的外用敷贴。",
    composition: "资料列出蕲艾，以及甘草、川芎、红花、姜粉、丹参、大黄、桂枝、侧柏叶等植物原料。",
    usage: "按包装步骤组合植物包、精油和敷贴后贴于身体外部；温度与时长以实际包装说明为准。",
    caution: "仅限外用，避免破损、感染或敏感皮肤；感觉过热、刺痛或不适时立即取下。",
    image: "assets/products/moxa-patch.png",
    imageAlt: "易灸灸蕲艾敷贴产品资料图",
  },
  {
    id: "dual-bottle",
    name: "全元倍生·小双瓶",
    type: "植物饮品与压片糖果组合",
    summary: "由黄精酸枣仁植物饮品与虫草蔓越莓压片糖果组成。",
    composition: "资料列出黄精、黄芪、酸枣仁、人参、蛹虫草与蔓越莓等原料。",
    usage: "属于组合食品，食用方法与食用量请以产品包装标示为准。",
    caution: "留意配料、适用人群和个人饮食限制；特殊人群或正在用药者食用前宜咨询专业人员。",
    image: "assets/products/dual-bottle.jpg",
    imageAlt: "全元倍生小双瓶产品资料图",
  },
  {
    id: "sesame-pill",
    name: "芝麻丸",
    type: "黑芝麻复合食品",
    summary: "以黑芝麻、黄精和蜂蜜制成的丸状食品。",
    composition: "图片标注三味原料：黑芝麻、黄精、蜂蜜，并标注不加蔗糖。",
    usage: "作为普通食品按包装建议食用，食用量与保存方式以实际包装说明为准。",
    caution: "对芝麻或蜂蜜等原料过敏者不宜食用；控糖或有特殊饮食要求者应留意配料表。",
    image: "assets/products/sesame-pill.jpg",
    imageAlt: "黑芝麻黄精蜂蜜芝麻丸资料图",
  },
],
```

- [ ] **Step 4: Run the data tests**

Run: `node --test tests/data.test.js`

Expected: all data tests PASS.

- [ ] **Step 5: Commit the data contract**

```bash
git add data.js tests/data.test.js
git commit -m "feat: add product introduction data"
```

### Task 2: Render accessible product cards

**Files:**
- Modify: `tests/app.test.js`
- Modify: `app.js`

- [ ] **Step 1: Write the failing card-rendering test**

Extend `FakeElement` with properties used by images and details, then add a test that calls `createProductCard`, locates `img`, `details`, and the three labelled information groups, and verifies image metadata, text, lazy loading, and image-only error hiding.

```js
test("product card renders image, summary, details, and safe image fallback", () => {
  const doc = { createElement: (tag) => new FakeElement(tag) };
  const product = data.products[0];
  const card = app.createProductCard(doc, product);
  const nodes = flatten(card);
  const image = nodes.find((item) => item.tagName === "img");
  const details = nodes.find((item) => item.tagName === "details");

  assert.equal(image.src, product.image);
  assert.equal(image.alt, product.imageAlt);
  assert.equal(image.loading, "lazy");
  assert.ok(details);
  assert.match(card.textContent || nodes.map((item) => item.textContent).join(" "), /主要成分|主要结构/);
  image.dispatch("error");
  assert.equal(image.hidden, true);
});
```

- [ ] **Step 2: Run the app test to verify it fails**

Run: `node --test tests/app.test.js`

Expected: FAIL because `createProductCard` is not exported.

- [ ] **Step 3: Implement `createProductCard` and mount the grid**

Add this focused renderer before `mount`:

```js
function createProductCard(doc, product) {
  const article = doc.createElement("article");
  article.className = "product-card";

  const media = doc.createElement("div");
  media.className = "product-card__media";
  const image = doc.createElement("img");
  image.src = product.image;
  image.alt = product.imageAlt;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", function () { image.hidden = true; }, { once: true });
  media.appendChild(image);

  const body = doc.createElement("div");
  body.className = "product-card__body";
  const type = doc.createElement("p");
  type.className = "product-card__type";
  type.textContent = product.type;
  const heading = doc.createElement("h3");
  heading.textContent = product.name;
  const summary = doc.createElement("p");
  summary.className = "product-card__summary";
  summary.textContent = product.summary;

  const details = doc.createElement("details");
  const toggle = doc.createElement("summary");
  toggle.textContent = "查看基础信息";
  const list = doc.createElement("dl");
  [
    ["主要成分 / 结构", product.composition],
    ["基本用法", product.usage],
    ["注意事项", product.caution],
  ].forEach(([label, value]) => {
    const term = doc.createElement("dt");
    term.textContent = label;
    const description = doc.createElement("dd");
    description.textContent = value;
    list.append(term, description);
  });
  details.append(toggle, list);
  body.append(type, heading, summary, details);
  article.append(media, body);
  return article;
}
```

In `mount`, select and populate the container once after rendering the safety notices:

```js
const productGrid = doc.querySelector("#product-grid");
if (productGrid && Array.isArray(data.products)) {
  productGrid.replaceChildren(...data.products.map((product) => createProductCard(doc, product)));
}
```

Add `createProductCard` to the returned public API.

- [ ] **Step 4: Run the app tests**

Run: `node --test tests/app.test.js`

Expected: all app tests PASS.

- [ ] **Step 5: Commit product rendering**

```bash
git add app.js tests/app.test.js
git commit -m "feat: render accessible product cards"
```

### Task 3: Add product section markup and responsive styling

**Files:**
- Modify: `tests/shell.test.js`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Write failing shell tests**

Add assertions that the product view contains `id="product-grid"`, the shared medical-boundary copy, and CSS selectors for `.product-grid`, `.product-card`, `.product-card__media`, `.product-card details`, and a mobile single-column override.

```js
test("product view exposes the four-card grid and neutral use boundary", () => {
  const productView = html.match(/id=["']view-product["'][\s\S]*?<\/section>/i)?.[0] || "";
  assert.match(productView, /id=["']product-grid["']/);
  assert.match(productView, /产品信息来自所提供资料/);
  assert.match(productView, /不能替代医疗建议/);
});

test("product grid has card, disclosure, and mobile styles", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /\.product-grid\s*\{/);
  assert.match(css, /\.product-card__media\s*\{/);
  assert.match(css, /\.product-card details\s*\{/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*\.product-grid/);
});
```

- [ ] **Step 2: Run shell tests to verify they fail**

Run: `node --test tests/shell.test.js`

Expected: FAIL because the grid and styles do not exist.

- [ ] **Step 3: Add semantic product-section markup**

Replace the introductory part of `#view-product` while keeping the current `.info-grid` after it:

```html
<p class="eyebrow">产品介绍</p>
<h1 id="product-title" tabindex="-1">四款日常产品，信息清楚再选择</h1>
<p class="product-intro">从产品形态、主要组成到基本用法，先了解，再按自己的需要判断。</p>
<div id="product-grid" class="product-grid" aria-label="产品列表"></div>
<p class="product-boundary">产品信息来自所提供资料，具体配料、用法、适用人群与保质信息以实际包装说明为准；本页内容不能替代医疗建议。</p>
<h2 class="section-heading">关于岐黄小助</h2>
```

- [ ] **Step 4: Add the approved visual system**

Add these styles before the existing `.info-grid` block and include `.product-grid` in the existing mobile grid rule:

```css
.product-intro {
  max-width: 44rem;
  color: var(--muted);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 2rem;
}

.product-card {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-large);
  background: var(--white-wash);
  box-shadow: var(--shadow-soft);
}

.product-card__media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--paper-deep);
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__body { padding: 1.35rem; }
.product-card__type {
  margin: 0 0 0.45rem;
  color: var(--cinnabar);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.product-card h3 { margin: 0; font-family: var(--display-font); font-size: 1.5rem; }
.product-card__summary { min-height: 3.5rem; color: var(--muted); }
.product-card details { border-top: 1px solid var(--line); }
.product-card summary {
  padding: 0.9rem 0;
  color: var(--jade);
  cursor: pointer;
  font-weight: 700;
}
.product-card summary:focus-visible { outline: 3px solid var(--cinnabar-pale); outline-offset: 3px; }
.product-card dl { margin: 0; }
.product-card dt { margin-top: 0.9rem; color: var(--ink); font-weight: 700; }
.product-card dd { margin: 0.3rem 0 0; color: var(--muted); line-height: 1.75; }
.product-boundary {
  margin: 1.2rem 0 2.5rem;
  padding: 1rem 1.1rem;
  border-left: 0.25rem solid var(--cinnabar);
  color: var(--ink-soft);
  background: var(--cinnabar-pale);
}
.section-heading { margin-top: 3rem; }

@media (max-width: 700px) {
  .product-grid { grid-template-columns: 1fr; }
  .product-card__summary { min-height: 0; }
}
```

- [ ] **Step 5: Run shell tests**

Run: `node --test tests/shell.test.js`

Expected: all shell tests PASS.

- [ ] **Step 6: Commit markup and styles**

```bash
git add index.html styles.css tests/shell.test.js
git commit -m "feat: style product introduction grid"
```

### Task 4: Add local product images and verify the complete site

**Files:**
- Create: `assets/products/eye-mask.jpg`
- Create: `assets/products/moxa-patch.png`
- Create: `assets/products/dual-bottle.jpg`
- Create: `assets/products/sesame-pill.jpg`
- Modify: `tests/assets.test.js`

- [ ] **Step 1: Write the failing asset test**

Add this test to `tests/assets.test.js`:

```js
const data = require("../data.js");

test("every product uses a substantial local image", () => {
  for (const product of data.products) {
    const imagePath = path.join(__dirname, "..", product.image);
    assert.ok(fs.existsSync(imagePath), `${product.name} image is missing`);
    assert.ok(fs.statSync(imagePath).size > 1024, `${product.name} image is unexpectedly small`);
  }
});
```

- [ ] **Step 2: Run the asset test to verify it fails**

Run: `node --test tests/assets.test.js`

Expected: FAIL because `assets/products/` has not been populated.

- [ ] **Step 3: Copy the four approved source images into the site**

Create `assets/products/`, then copy these exact approved preview sources without re-encoding:

```powershell
Copy-Item -LiteralPath '.superpowers\brainstorm\product-layout-20261006\content\assets\eye-mask.jpg' -Destination 'assets\products\eye-mask.jpg'
Copy-Item -LiteralPath '.superpowers\brainstorm\product-layout-20261006\content\assets\moxa-patch.png' -Destination 'assets\products\moxa-patch.png'
Copy-Item -LiteralPath '.superpowers\brainstorm\product-layout-20261006\content\assets\dual-bottle.jpg' -Destination 'assets\products\dual-bottle.jpg'
Copy-Item -LiteralPath '.superpowers\brainstorm\product-layout-20261006\content\assets\sesame-pill.jpg' -Destination 'assets\products\sesame-pill.jpg'
```

- [ ] **Step 4: Run the entire automated test suite**

Run: `node --test tests/*.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 5: Perform browser visual verification**

Serve the repository locally, open the product view, and inspect at desktop and mobile widths. Confirm four cards render in 2×2 and 1-column layouts respectively, every disclosure opens, all images load, keyboard focus is visible, and the original product-principles section remains after the cards.

- [ ] **Step 6: Commit the local assets and asset test**

```bash
git add assets/products tests/assets.test.js
git commit -m "test: verify local product assets"
```

- [ ] **Step 7: Check the final diff and repository state**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and no uncommitted implementation files.
