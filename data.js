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
    ],
  });
});
