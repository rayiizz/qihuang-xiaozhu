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
