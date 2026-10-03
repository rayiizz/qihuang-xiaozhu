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

  return { createInitialState, getSymptoms, getAcupoints, reduce, buildViewModel, mount };
});
