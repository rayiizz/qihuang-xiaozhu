const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.join(__dirname, "..", "assets", "acupoints");

const templates = {
  "hand-dorsal": `
    <path class="body" d="M72 268 C96 224 106 176 124 138 C140 105 160 72 181 50 C194 37 211 47 205 65 L185 128 L220 53 C228 36 248 46 243 66 L217 142 L257 67 C267 49 286 62 278 80 L242 157 C278 137 320 135 360 152 C381 161 383 184 361 191 C319 198 294 205 270 232 C242 264 210 277 166 282 Z"/>
    <path class="landmark" d="M183 130 C212 146 236 164 261 193 M133 141 C164 154 190 176 210 207"/>
    <text x="84" y="296">手背 · 左右同取</text>`,
  "hand-ulnar": `
    <path class="body" d="M70 226 C112 191 142 164 180 150 C218 136 260 136 306 148 L401 181 C420 188 418 211 398 218 L306 235 C256 247 207 270 151 280 L84 279 Z"/>
    <path class="landmark" d="M168 179 Q206 199 252 198 M145 208 Q193 230 248 221"/>
    <text x="82" y="305">小指侧手部 · 握拳示意</text>`,
  "side-head": `
    <path class="body" d="M135 277 C116 234 109 180 121 129 C134 74 178 39 236 43 C298 47 340 92 344 151 C348 202 323 248 284 279 Z"/>
    <path class="landmark" d="M160 137 Q190 119 221 133 M221 133 Q246 147 271 135 M233 157 Q250 169 267 160"/>
    <circle class="landmark-fill" cx="223" cy="135" r="5"/>
    <text x="84" y="304">侧面头部 · 眉梢与外眼角</text>`,
  "front-face": `
    <path class="body" d="M149 278 C121 232 113 169 127 111 C143 57 187 30 240 31 C293 30 337 57 353 111 C367 169 359 232 331 278 Z"/>
    <path class="landmark" d="M159 127 Q195 108 222 127 M258 127 Q285 108 321 127 M240 117 L240 204 M209 221 Q240 237 271 221"/>
    <path class="landmark" d="M219 190 Q205 208 193 229 M261 190 Q275 208 287 229"/>
    <text x="96" y="304">正面面部 · 两侧对称</text>`,
  "neck-shoulder": `
    <path class="body" d="M154 54 Q240 18 326 54 L314 123 Q354 148 420 177 L430 286 L50 286 L60 177 Q126 148 166 123 Z"/>
    <path class="landmark" d="M181 73 Q240 109 299 73 M166 123 Q240 156 314 123 M240 110 L240 220 M82 187 Q163 166 240 183 Q317 166 398 187"/>
    <text x="118" y="308">后枕与肩部 · 左右同取</text>`,
  "forearm": `
    <path class="body" d="M105 75 Q143 45 181 58 L364 126 Q402 142 390 181 L360 253 Q347 283 313 272 L124 208 Q82 193 82 152 Z"/>
    <path class="landmark" d="M112 190 Q231 213 349 252 M128 169 Q242 191 365 226 M195 99 L153 205 M234 111 L194 217"/>
    <text x="92" y="305">前臂与腕部 · 掌侧/背侧见标注</text>`,
  "lower-leg": `
    <path class="body" d="M149 40 Q240 17 331 40 L343 108 Q326 145 307 166 L294 287 L186 287 L173 166 Q154 145 137 108 Z"/>
    <circle class="landmark" cx="240" cy="101" r="48"/>
    <path class="landmark" d="M214 143 L207 276 M278 143 L287 276"/>
    <text x="125" y="309">膝与小腿前外侧</text>`,
  "posterior-knee": `
    <path class="body" d="M149 36 Q240 18 331 36 L326 284 L154 284 Z"/>
    <path class="landmark" d="M163 151 Q240 177 317 151 M240 47 L240 279"/>
    <text x="145" y="308">膝后视图 · 横纹中点</text>`,
  abdomen: `
    <path class="body" d="M130 37 Q240 8 350 37 L368 286 L112 286 Z"/>
    <path class="landmark" d="M240 38 L240 282"/>
    <circle class="landmark-fill" cx="240" cy="215" r="9"/>
    <text x="117" y="309">上腹部 · 前正中线与肚脐</text>`,
  sole: `
    <path class="body" d="M171 289 C128 270 111 231 122 190 C131 155 149 134 151 98 C154 52 183 29 222 37 C262 45 287 82 295 126 C305 182 282 248 239 284 C219 300 193 300 171 289 Z"/>
    <path class="landmark" d="M156 122 Q214 144 284 125 M149 170 Q211 190 279 170"/>
    <text x="143" y="310">足底前部 · 左右同取</text>`,
};

const points = [
  ["LI4", "合谷", "hand-dorsal", 211, 157, 322, 93],
  ["EX-HN5", "太阳", "side-head", 286, 142, 375, 95],
  ["GB20", "风池", "neck-shoulder", 188, 111, 81, 71],
  ["LI20", "迎香", "front-face", 275, 193, 373, 172],
  ["HT7", "神门", "forearm", 338, 239, 407, 270],
  ["EX-HN3", "印堂", "front-face", 240, 126, 367, 80],
  ["GB21", "肩井", "neck-shoulder", 328, 174, 406, 129],
  ["SI3", "后溪", "hand-ulnar", 244, 218, 355, 265],
  ["LI10", "手三里", "forearm", 212, 143, 325, 80],
  ["PC6", "内关", "forearm", 282, 207, 405, 181],
  ["ST36", "足三里", "lower-leg", 288, 177, 395, 148],
  ["CV12", "中脘", "abdomen", 240, 145, 374, 111],
  ["GB34", "阳陵泉", "lower-leg", 313, 143, 408, 91],
  ["KI1", "涌泉", "sole", 213, 157, 356, 111],
  ["BL40", "委中", "posterior-knee", 240, 160, 369, 117],
];

function render([id, name, template, x, y, labelX, labelY]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" role="img" aria-labelledby="title desc">
  <title id="title">${name}位置示意图</title>
  <desc id="desc">局部轮廓、定位标志和${name}定位点示意，正式使用前需专业审核。</desc>
  <style>
    .body{fill:#efe0c9;stroke:#4f463d;stroke-width:4;stroke-linejoin:round}
    .landmark{fill:none;stroke:#a9967e;stroke-width:3;stroke-linecap:round;stroke-dasharray:7 7}
    .landmark-fill{fill:#a9967e}
    .leader{fill:none;stroke:#a24432;stroke-width:3}
    .acupoint-marker{fill:#a24432;stroke:#f2c8b7;stroke-width:9}
    text{fill:#28443a;font:16px sans-serif}.label{font-weight:700}.tag{font-size:13px;fill:#75685d}
  </style>
  <rect width="480" height="320" rx="24" fill="#fbf8f0"/>
  <text class="tag" x="24" y="30">位置示意图 · 未完成专业审核</text>
  ${templates[template].trim()}
  <path class="leader" d="M${x} ${y} L${labelX} ${labelY}"/>
  <circle class="acupoint-marker" cx="${x}" cy="${y}" r="9"/>
  <rect x="${labelX - 38}" y="${labelY - 24}" width="76" height="34" rx="10" fill="#17382f"/>
  <text class="label" x="${labelX}" y="${labelY - 2}" text-anchor="middle" fill="#fffaf2">${name}</text>
</svg>\n`;
}

fs.mkdirSync(outputDir, { recursive: true });
for (const point of points) {
  fs.writeFileSync(path.join(outputDir, `${point[0]}.svg`), render(point), "utf8");
}
console.log(`Generated ${points.length} acupoint SVGs in ${outputDir}`);
