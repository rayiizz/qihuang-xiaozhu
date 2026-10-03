# Remove Professional Review Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every professional-review status warning from the live page and generated acupoint illustrations while preserving the application’s medical safety guidance and content-accuracy caveat.

**Architecture:** Treat the page copy/CSS and generated SVG assets as two independently testable units. Update each unit with a RED-GREEN TDD cycle, keep the SVG generator as the source of truth, then run a repository-wide production-text scan and full regression suite.

**Tech Stack:** Semantic HTML5, vanilla CSS, Node.js, SVG, Node.js built-in `node:test`.

---

## File map

- Modify `tests/shell.test.js`: require the new accuracy copy, prohibit obsolete review-status phrases, and prohibit dead banner CSS.
- Modify `index.html`: remove the top review banner and rewrite disclaimer section 06.
- Modify `styles.css`: remove every `.review-banner` selector and rule.
- Modify `tests/assets.test.js`: require the replacement SVG tag and prohibit review-status wording.
- Modify `scripts/generate-acupoint-svgs.js`: update the accessible description and visible top tag.
- Regenerate `assets/acupoints/*.svg`: keep all 15 committed assets synchronized with the generator.

### Task 1: Remove the page banner and rewrite the accuracy disclaimer

**Files:**
- Modify: `tests/shell.test.js`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Write the failing page-copy and dead-style contract**

In `tests/shell.test.js`, remove this obsolete assertion from `document includes safety, keyboard, and no-script affordances`:

```js
  assert.match(html, /演示内容尚未完成专业审核/);
```

In `document exposes the approved disclaimer through a shared footer link`, replace:

```js
  assert.match(disclaimerView, /尚未经过执业中医师逐项审核/);
```

with:

```js
  assert.match(disclaimerView, /<span>06<\/span> 内容准确性<\/h2>/);
  assert.match(disclaimerView, /当前穴位资料和图片属于知识参考内容/);
  assert.match(disclaimerView, /可能存在遗漏、简化或更新不及时/);
```

Append this new test:

```js
test("document omits obsolete review status while retaining medical safety guidance", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  const removedPhrases = [
    ["演示内容尚未完成", "专业审核"].join(""),
    ["尚未经过执业中医师", "逐项审核"].join(""),
  ];

  for (const phrase of removedPhrases) assert.doesNotMatch(html, new RegExp(phrase));
  assert.doesNotMatch(css, /\.review-banner/);
  assert.match(html, /仅供日常健康知识参考，不构成诊断或治疗建议/);
  assert.match(html, /立即停止自行处理并联系当地急救服务/);
  assert.match(html, /穴位图片仅为示意图，不能代替专业取穴/);
});
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run:

```powershell
node --test --test-name-pattern="approved disclaimer|obsolete review status" tests/shell.test.js
```

Expected: FAIL because `index.html` still contains both obsolete review phrases, the new accuracy text is absent, and `styles.css` still contains `.review-banner`.

- [ ] **Step 3: Remove the banner and update disclaimer section 06**

In `index.html`, delete this complete node:

```html
    <p class="review-banner" role="status">演示内容尚未完成专业审核</p>
```

Replace disclaimer section 06 with:

```html
        <section aria-labelledby="disclaimer-review">
          <h2 id="disclaimer-review"><span>06</span> 内容准确性</h2>
          <p>当前穴位资料和图片属于知识参考内容，可能存在遗漏、简化或更新不及时的情况，不保证完全准确、完整或适用于每一位用户。</p>
        </section>
```

- [ ] **Step 4: Remove all dead review-banner styles**

In `styles.css`, change the combined selector:

```css
.local-badge,
.review-banner {
```

to:

```css
.local-badge {
```

Delete these complete rules:

```css
.review-banner {
  margin: 0 0 1.4rem;
  padding: 0.45rem 0.72rem;
  border: 1px solid rgba(162, 68, 50, 0.24);
  color: var(--cinnabar-deep);
  background: var(--cinnabar-pale);
}

.review-banner::before {
  margin-right: 0.4rem;
  content: "※";
}
```

Inside `@media (max-width: 420px)`, delete:

```css
  .review-banner {
    border-radius: 0.6rem;
    line-height: 1.45;
  }
```

- [ ] **Step 5: Run targeted and full shell tests**

Run:

```powershell
node --test --test-name-pattern="approved disclaimer|obsolete review status" tests/shell.test.js
node --test tests/shell.test.js
```

Expected: targeted tests PASS; all shell tests PASS.

- [ ] **Step 6: Commit the page and stylesheet change**

```powershell
git add index.html styles.css tests/shell.test.js
git commit -m "feat: remove page review status warnings"
```

### Task 2: Remove review status from generated SVG illustrations

**Files:**
- Modify: `tests/assets.test.js`
- Modify: `scripts/generate-acupoint-svgs.js`
- Regenerate: `assets/acupoints/BL40.svg`
- Regenerate: `assets/acupoints/CV12.svg`
- Regenerate: `assets/acupoints/EX-HN3.svg`
- Regenerate: `assets/acupoints/EX-HN5.svg`
- Regenerate: `assets/acupoints/GB20.svg`
- Regenerate: `assets/acupoints/GB21.svg`
- Regenerate: `assets/acupoints/GB34.svg`
- Regenerate: `assets/acupoints/HT7.svg`
- Regenerate: `assets/acupoints/KI1.svg`
- Regenerate: `assets/acupoints/LI10.svg`
- Regenerate: `assets/acupoints/LI20.svg`
- Regenerate: `assets/acupoints/LI4.svg`
- Regenerate: `assets/acupoints/PC6.svg`
- Regenerate: `assets/acupoints/SI3.svg`
- Regenerate: `assets/acupoints/ST36.svg`

- [ ] **Step 1: Write the failing SVG copy contract**

In `tests/assets.test.js`, replace:

```js
    assert.match(svg, /位置示意图/);
```

with:

```js
    const removedPhrases = [
      ["未完成", "专业审核"].join(""),
      ["需", "专业审核"].join(""),
    ];

    assert.match(svg, />穴位位置示意图<\/text>/);
    for (const phrase of removedPhrases) assert.doesNotMatch(svg, new RegExp(phrase));
```

- [ ] **Step 2: Run the targeted asset test and verify RED**

Run:

```powershell
node --test --test-name-pattern="local, static" tests/assets.test.js
```

Expected: FAIL because every current SVG contains the old visible review label and accessible review description.

- [ ] **Step 3: Update the SVG generator source**

In `scripts/generate-acupoint-svgs.js`, replace:

```js
  <desc id="desc">局部轮廓、定位标志和${name}定位点示意，正式使用前需专业审核。</desc>
```

with:

```js
  <desc id="desc">局部轮廓、定位标志和${name}定位点示意。</desc>
```

Replace:

```js
  <text class="tag" x="24" y="30">位置示意图 · 未完成专业审核</text>
```

with:

```js
  <text class="tag" x="24" y="30">穴位位置示意图</text>
```

- [ ] **Step 4: Regenerate the 15 SVG assets and verify GREEN**

Run:

```powershell
node scripts/generate-acupoint-svgs.js
node --test --test-name-pattern="local, static" tests/assets.test.js
node --test tests/assets.test.js
```

Expected: generator reports 15 SVGs; targeted test PASS; all asset tests PASS.

- [ ] **Step 5: Prove generation remains deterministic**

Run:

```powershell
git add scripts/generate-acupoint-svgs.js assets/acupoints tests/assets.test.js
node scripts/generate-acupoint-svgs.js
git diff --exit-code -- assets/acupoints
```

Expected: the second generation creates no additional SVG content changes; `git diff --exit-code` exits 0.

- [ ] **Step 6: Commit the generator, assets, and test**

```powershell
git commit -m "feat: remove SVG review status warnings"
```

### Task 3: Verify complete removal and safety regression coverage

**Files:**
- Modify only if verification exposes a defect: `index.html`, `styles.css`, `scripts/generate-acupoint-svgs.js`, `assets/acupoints/*.svg`, or the matching test.

- [ ] **Step 1: Run syntax, full tests, and whitespace checks**

Run:

```powershell
node --check app.js
node --check data.js
node --check scripts/generate-acupoint-svgs.js
node --test
git diff --check
git status --short
```

Expected: syntax checks exit 0; full suite reports no failed tests; whitespace check prints nothing; working tree is clean after the two implementation commits.

- [ ] **Step 2: Confirm obsolete review-status text is absent from live sources and tests**

Run:

```powershell
rg -n "演示内容尚未完成专业审核|尚未经过执业中医师逐项审核|未完成专业审核|需专业审核" index.html styles.css app.js data.js scripts assets tests
```

Expected: no matches and exit code 1. Historical specs and plans are intentionally excluded because they record the approved change.

- [ ] **Step 3: Confirm retained safety language remains present**

Run:

```powershell
rg -n "不构成诊断或治疗建议|立即停止自行处理并联系当地急救服务|不能代替专业取穴|可能存在遗漏、简化或更新不及时" index.html
```

Expected: all four retained safety and accuracy phrases are found.

- [ ] **Step 4: Verify SVG count and deterministic regeneration**

Run:

```powershell
rg -l ">穴位位置示意图</text>" assets/acupoints | Measure-Object
node scripts/generate-acupoint-svgs.js
git status --short
```

Expected: `Count : 15`; regeneration reports 15 SVGs and leaves the working tree clean.

- [ ] **Step 5: Check the local page manually**

Reload `index.html` and inspect:

```text
首页：顶部直接进入主内容，不再显示审核状态提示条
免责声明：第 06 节为“内容准确性”，保留准确性边界但没有审核状态
任一穴位结果：图片顶部只显示“穴位位置示意图”
```

Expected: no empty banner gap, no layout regression, and all other medical safety messages remain visible.

- [ ] **Step 6: Correct any verified defect using TDD**

If verification exposes a defect, add a focused failing test first, run it to confirm RED, implement the minimal correction, run `node --test` to confirm GREEN, and commit only the correction:

```powershell
git add index.html styles.css scripts/generate-acupoint-svgs.js assets/acupoints tests
git commit -m "fix: resolve review status removal finding"
```

