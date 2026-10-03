# Disclaimer View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent disclaimer link and an accessible, fully offline disclaimer view to the existing local TCM reference application.

**Architecture:** Extend the existing single-page state machine with one `disclaimer` view and one `OPEN_DISCLAIMER` event. Keep all approved copy in semantic HTML, place the entry in a shared footer outside the view container, and use the existing delegated click handler and heading-focus behavior for navigation and accessibility.

**Tech Stack:** Semantic HTML5, vanilla CSS, vanilla JavaScript, Node.js built-in `node:test`.

---

## File map

- Modify `tests/app.test.js`: define and verify disclaimer state transitions before production code changes.
- Modify `app.js`: add the `OPEN_DISCLAIMER` transition and delegated action mapping.
- Modify `tests/shell.test.js`: define the disclaimer HTML, copy, footer, and responsive CSS contracts.
- Modify `index.html`: add the approved disclaimer view and shared footer link.
- Modify `styles.css`: style the disclaimer layout and shared footer without changing other views.

### Task 1: Add the disclaimer state transition

**Files:**
- Modify: `tests/app.test.js`
- Modify: `app.js`

- [ ] **Step 1: Write the failing state-machine test**

Append this test to `tests/app.test.js`:

```js
test("disclaimer opens from any flow and returns home without retaining selections", () => {
  const result = { view: "result", regionId: "head-face", symptomId: "mild-headache" };
  const disclaimer = app.reduce(result, { type: "OPEN_DISCLAIMER" }, data);

  assert.deepEqual(disclaimer, { view: "disclaimer", regionId: null, symptomId: null });
  assert.deepEqual(app.reduce(disclaimer, { type: "HOME" }, data), app.createInitialState());
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
node --test --test-name-pattern="disclaimer opens" tests/app.test.js
```

Expected: FAIL because the reducer returns the unchanged `result` state for the unknown `OPEN_DISCLAIMER` event.

- [ ] **Step 3: Implement the minimal state transition**

In `app.js`, add this case immediately after `OPEN_PRODUCT` in `reduce`:

```js
      case "OPEN_DISCLAIMER": return { view: "disclaimer", regionId: null, symptomId: null };
```

In the `actionMap` inside `mount`, add this entry immediately after `open-product`:

```js
        "open-disclaimer": "OPEN_DISCLAIMER",
```

The existing `HOME` event remains the single return path, so leaving the disclaimer always produces a clean home state.

- [ ] **Step 4: Run targeted and full application tests**

Run:

```powershell
node --test --test-name-pattern="disclaimer opens" tests/app.test.js
node --test tests/app.test.js
```

Expected: targeted test PASS; all application tests PASS.

- [ ] **Step 5: Commit the state transition**

```powershell
git add app.js tests/app.test.js
git commit -m "feat: add disclaimer navigation state"
```

### Task 2: Add the approved disclaimer view and persistent link

**Files:**
- Modify: `tests/shell.test.js`
- Modify: `index.html`

- [ ] **Step 1: Extend the view inventory test and add the failing content contract**

In the ID array in `document contains every application view`, add:

```js
    "view-disclaimer",
```

Append this test to `tests/shell.test.js`:

```js
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
```

- [ ] **Step 2: Run the shell tests and verify RED**

Run:

```powershell
node --test --test-name-pattern="application view|approved disclaimer" tests/shell.test.js
```

Expected: both selected tests FAIL because `view-disclaimer` and the shared footer do not exist.

- [ ] **Step 3: Add the semantic disclaimer view**

In `index.html`, insert this section immediately after `view-result` and before the closing `</main>`:

```html
    <section id="view-disclaimer" class="view disclaimer-view" data-view="disclaimer" aria-labelledby="disclaimer-title" hidden>
      <button class="text-button" type="button" data-action="home">← 返回首页</button>
      <p class="eyebrow">使用边界与安全说明</p>
      <h1 id="disclaimer-title" tabindex="-1">免责声明与使用须知</h1>
      <p class="disclaimer-lead">请在使用“在线问诊”和穴位参考功能前阅读以下内容。</p>

      <div class="disclaimer-sections">
        <section aria-labelledby="disclaimer-nature">
          <h2 id="disclaimer-nature"><span>01</span> 产品性质</h2>
          <p>本产品仅提供中医穴位与日常健康知识参考，不是医疗机构或互联网医院，不建立医患关系。“在线问诊”仅为功能名称，实际属于健康信息引导。</p>
        </section>
        <section aria-labelledby="disclaimer-medical">
          <h2 id="disclaimer-medical"><span>02</span> 不构成诊疗建议</h2>
          <p>页面内容、穴位推荐和操作说明不构成医学诊断、处方、个体化治疗方案或疗效保证，也不能代替执业医师、中医师或其他合格医疗专业人员的判断。用户不应因使用本产品而延误、取消或改变正规诊疗。</p>
        </section>
        <section class="disclaimer-section--urgent" aria-labelledby="disclaimer-urgent">
          <h2 id="disclaimer-urgent"><span>03</span> 紧急与严重症状</h2>
          <p>若出现胸痛、呼吸困难、意识异常、突发肢体无力或言语不清、严重出血、严重过敏、持续高热、剧烈或快速加重的疼痛等紧急或严重症状，应立即停止自行处理并联系当地急救服务或尽快前往正规医疗机构。</p>
        </section>
        <section aria-labelledby="disclaimer-location">
          <h2 id="disclaimer-location"><span>04</span> 穴位图片与操作边界</h2>
          <p>穴位图片仅为示意图，不能代替专业取穴，且个体体型与解剖位置存在差异。本产品只提供非侵入性的日常按压参考，不指导针刺、放血、艾灸或其他专业、侵入性操作。皮肤破损、感染、明显红肿或剧烈疼痛处不应自行按压；操作中若出现明显疼痛、头晕、恶心或其他不适，应立即停止。</p>
        </section>
        <section aria-labelledby="disclaimer-groups">
          <h2 id="disclaimer-groups"><span>05</span> 特殊人群</h2>
          <p>孕妇、儿童、老年人，以及患有慢性疾病、凝血问题、正在服药或近期接受手术的人群，在尝试任何穴位刺激前应先咨询合格的医疗专业人员。</p>
        </section>
        <section aria-labelledby="disclaimer-review">
          <h2 id="disclaimer-review"><span>06</span> 内容准确性与审核状态</h2>
          <p>当前穴位资料和图片属于演示内容，尚未经过执业中医师逐项审核。内容可能存在遗漏、简化或更新不及时的情况，不保证完全准确、完整或适用于每一位用户。</p>
        </section>
        <section aria-labelledby="disclaimer-privacy">
          <h2 id="disclaimer-privacy"><span>07</span> 隐私与本地运行</h2>
          <p>本产品在用户设备本地运行，不要求注册，也不会主动上传或保存用户在问诊流程中填写的身体状况。用户仍需自行管理设备、浏览器及本地文件的安全。</p>
        </section>
        <section aria-labelledby="disclaimer-liability">
          <h2 id="disclaimer-liability"><span>08</span> 责任边界</h2>
          <p>用户应结合自身情况谨慎判断和使用。对于将本产品内容误认为医学诊断、未及时就医或不当自行操作所产生的损失，开发者在适用法律允许的范围内不承担相应责任；法律规定不得排除或限制的责任不受本条影响。</p>
        </section>
      </div>

      <p class="disclaimer-updated">最后更新：2026年10月3日</p>
      <button class="primary-button" type="button" data-action="home">返回首页</button>
    </section>
```

- [ ] **Step 4: Add the shared footer link**

In `index.html`, insert this footer immediately after `</main>` and before `<noscript>`:

```html
  <footer class="site-footer">
    <p>岐黄小助 · 本地穴位知识参考</p>
    <a class="footer-link" href="#view-disclaimer" data-action="open-disclaimer">免责声明</a>
  </footer>
```

Because the footer is outside every `[data-view]` section, the entry remains available on the home, product, consultation, and result views. The browser hash is an offline local anchor; the delegated handler activates the same target view before the native anchor navigation completes.

- [ ] **Step 5: Run targeted and full shell tests**

Run:

```powershell
node --test --test-name-pattern="application view|approved disclaimer" tests/shell.test.js
node --test tests/shell.test.js
```

Expected: targeted tests PASS; all shell tests PASS.

- [ ] **Step 6: Commit the semantic view and entry link**

```powershell
git add index.html tests/shell.test.js
git commit -m "feat: add disclaimer view and footer link"
```

### Task 3: Style the disclaimer view and footer responsively

**Files:**
- Modify: `tests/shell.test.js`
- Modify: `styles.css`

- [ ] **Step 1: Write the failing style contract**

Append this test to `tests/shell.test.js`:

```js
test("disclaimer and shared footer have readable responsive styles", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /\.site-footer\s*\{/);
  assert.match(css, /\.footer-link\s*\{/);
  assert.match(css, /\.disclaimer-sections\s*\{/);
  assert.match(css, /\.disclaimer-sections\s*>\s*\.disclaimer-section--urgent\s*\{/);
  assert.match(css, /\.disclaimer-view\s*>\s*\.primary-button/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*\.disclaimer-sections/);
});
```

- [ ] **Step 2: Run the targeted CSS test and verify RED**

Run:

```powershell
node --test --test-name-pattern="disclaimer and shared footer" tests/shell.test.js
```

Expected: FAIL because the disclaimer and footer selectors do not yet exist.

- [ ] **Step 3: Add the desktop disclaimer and footer styles**

In `styles.css`, add these rules before `.noscript`:

```css
.site-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 1.25rem 0 2rem;
  gap: 1rem;
  border-top: 1px solid rgba(185, 173, 154, 0.65);
  color: var(--muted);
  font-size: 0.78rem;
}

.site-footer p {
  margin: 0;
}

.footer-link {
  min-height: 2.75rem;
  padding: 0.7rem 0;
  color: var(--jade);
  font-weight: 800;
  text-underline-offset: 0.24rem;
}

.disclaimer-view {
  max-width: 58rem;
}

.disclaimer-lead {
  max-width: 42rem;
  margin: 0 0 2rem;
  color: var(--muted);
}

.disclaimer-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.disclaimer-sections > section {
  padding: 1.35rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-medium);
  background: var(--white-wash);
}

.disclaimer-sections h2 span {
  display: block;
  margin-bottom: 0.65rem;
  color: var(--cinnabar);
  font-family: Georgia, serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
}

.disclaimer-sections p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}

.disclaimer-sections > .disclaimer-section--urgent {
  border-color: rgba(162, 68, 50, 0.32);
  background: rgba(245, 225, 216, 0.72);
}

.disclaimer-updated {
  margin: 1.5rem 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.disclaimer-view > .primary-button {
  min-width: 10rem;
}
```

- [ ] **Step 4: Add the mobile layout rules**

Inside the existing `@media (max-width: 700px)` block, add:

```css
  .site-footer {
    width: min(100% - 1.25rem, 1120px);
    align-items: flex-start;
    flex-direction: column;
  }

  .disclaimer-sections {
    grid-template-columns: 1fr;
  }

  .disclaimer-view > .primary-button {
    width: 100%;
  }
```

- [ ] **Step 5: Run targeted and full tests**

Run:

```powershell
node --test --test-name-pattern="disclaimer and shared footer" tests/shell.test.js
node --test
```

Expected: targeted test PASS; full suite PASS with no failed tests.

- [ ] **Step 6: Commit responsive presentation**

```powershell
git add styles.css tests/shell.test.js
git commit -m "feat: style disclaimer view responsively"
```

### Task 4: Verify the complete offline disclaimer flow

**Files:**
- Modify only if verification reveals a defect: `index.html`, `app.js`, `styles.css`, or the matching test.

- [ ] **Step 1: Run fresh syntax, test, and whitespace checks**

Run:

```powershell
node --check app.js
node --check data.js
node --test
git diff --check
git status --short
```

Expected: syntax checks exit 0; all tests PASS; whitespace check prints nothing; working tree is clean after the three implementation commits.

- [ ] **Step 2: Verify the disclaimer remains fully offline**

Run:

```powershell
rg -n "https?://|fetch\(|XMLHttpRequest|localStorage|sessionStorage" index.html app.js styles.css
```

Expected: no matches. The disclaimer does not introduce remote content, storage, or telemetry.

- [ ] **Step 3: Exercise the local-file navigation manually**

Open `index.html` directly in a browser and verify:

```text
首页 → 页脚“免责声明” → 《免责声明与使用须知》 → 返回首页
在线问诊 → 选择任意部位 → 页脚“免责声明” → 返回首页
产品介绍 → 页脚“免责声明” → 返回首页
```

Expected: every entry displays the same eight-section disclaimer and update date; both return buttons go to a clean home screen; no page opens a network request or a new window.

- [ ] **Step 4: Check accessibility and responsive presentation**

At approximately 360px and 1280px widths and at 200% zoom, navigate using only the keyboard.

Expected: the footer link and both return controls have visible focus; the disclaimer title receives focus after navigation; cards use one column at narrow width and two columns at wide width; no horizontal scrolling or clipped text appears.

- [ ] **Step 5: Correct any verified defect using TDD**

If verification exposes a defect, add a focused failing test to `tests/app.test.js` or `tests/shell.test.js`, run it to confirm RED, implement the minimal correction, run `node --test` to confirm GREEN, and commit only the correction:

```powershell
git add index.html app.js styles.css tests
git commit -m "fix: resolve disclaimer verification finding"
```
