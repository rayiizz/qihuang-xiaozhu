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
