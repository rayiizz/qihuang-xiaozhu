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

test("mount reveals a static error and disables data-dependent controls when data is missing", () => {
  const appError = { hidden: true };
  const controls = [{ disabled: false }, { disabled: false }];
  const doc = {
    querySelector(selector) {
      return selector === "#app-error" ? appError : null;
    },
    querySelectorAll(selector) {
      return selector === "[data-requires-data]" ? controls : [];
    },
  };

  app.mount(doc, null);

  assert.equal(appError.hidden, false);
  assert.ok(controls.every((control) => control.disabled));
});

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
