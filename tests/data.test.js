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
