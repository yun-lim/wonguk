import { ELEMENTS, ELEMENT_COLOR, PILLAR_ORDER } from "./tables.js";
import { withBase } from "./base.js";

export function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function chipClass(on) {
  return on ? "chip on" : "chip";
}

export function renderMasthead(tag = "v1 · 절기 명식") {
  return `
    <header class="masthead">
      <a class="brand" href="${withBase("/")}"><span class="seal">봄</span><span class="wordmark">사주봄</span></a>
      <span class="tag">${tag}</span>
    </header>
  `;
}

export function renderFooter() {
  return `
    <footer class="site-foot">
      <p>
        <a href="${withBase("/")}">사주봄</a> · 임대균 ·
        <a href="mailto:limdg01@gmail.com">limdg01@gmail.com</a> ·
        <a href="${withBase("/terms")}">이용약관</a> ·
        <a href="${withBase("/privacy")}">개인정보처리방침</a> ·
        사업자정보 준비중
      </p>
    </footer>
  `;
}

const TABS = [
  { id: "home", path: "/", label: "사주봄" },
  { id: "reports", path: "/reports", label: "리포트" },
  { id: "pay", path: "/pay", label: "요금" },
  { id: "settings", path: "/settings", label: "설정" },
];

export function activeTab(view) {
  if (view === "reports" || view === "report") return "reports";
  if (view === "pay") return "pay";
  if (view === "settings" || view === "privacy" || view === "terms" || view === "method") return "settings";
  if (view === "manse" || view === "manse-result") return "";
  return "home";
}

export function renderTabbar(view) {
  const on = activeTab(view);
  const items = TABS.map((t) => {
    const cls = t.id === on ? "tab on" : "tab";
    return `<a class="${cls}" href="${withBase(t.path)}">${t.label}</a>`;
  }).join("");
  return `<nav class="tabbar" aria-label="주요 메뉴">${items}</nav>`;
}

export function pillarCell(key, p) {
  const meta = PILLAR_ORDER.find((x) => x.key === key);
  if (key === "hour" && !p) {
    return `<div class="col unknown">
      <div class="head">${meta.hanja} ${meta.ko}</div>
      <div class="hanja">모름</div>
      <div class="hangul">시주 생략</div>
    </div>`;
  }
  const day = key === "day" ? " day" : "";
  return `<div class="col${day}">
    <div class="head">${meta.hanja} ${meta.ko}</div>
    <div class="god">${esc(p.stem.god || "")}</div>
    <div class="hanja">${p.stem.hanja}</div>
    <div class="hangul">${p.stem.ko} · ${p.stem.element}</div>
    <div class="hanja">${p.branch.hanja}</div>
    <div class="hangul">${p.branch.ko} · ${p.branch.element}</div>
    <div class="god">${esc(p.branch.god || "")}</div>
  </div>`;
}

export function pillarGrid(pillars) {
  return `<section class="myeong" aria-label="사주팔자">
    <div class="cols">
      ${pillarCell("hour", pillars.hour)}
      ${pillarCell("day", pillars.day)}
      ${pillarCell("month", pillars.month)}
      ${pillarCell("year", pillars.year)}
    </div>
  </section>`;
}

export function elementBars(elements, hourUnknown) {
  const max = Math.max(1, ...ELEMENTS.map((e) => elements[e]));
  const bars = ELEMENTS.map((e) => {
    const n = elements[e];
    const w = Math.round((n / max) * 100);
    return `<div class="bar-row">
      <span>${e}</span>
      <div class="track"><i style="width:${w}%;background:${ELEMENT_COLOR[e]}"></i></div>
      <span>${n}</span>
    </div>`;
  }).join("");
  return `<section class="bars">
    <h2>오행</h2>
    ${bars}
    <p class="hint">${hourUnknown ? "연월일 6글자" : "연월일시 8글자"} · 지장간 미포함</p>
  </section>`;
}

export function luckList(luck) {
  const items = (luck?.pillars || [])
    .map(
      (lp) => `<div class="luck-item${lp.current ? " now" : ""}">
        <span class="age">${lp.start}–${lp.end}세</span>
        <span class="gz">${lp.hanja} ${lp.korean}</span>
        <span class="god">${esc(lp.stem.god || "")}</span>
      </div>`,
    )
    .join("");
  return `<section class="luck">
    <h2>대운</h2>
    <div class="luck-list">${items}</div>
    <p class="dir-note">${luck?.forward ? "순행" : "역행"} · 대운수 약 ${luck?.startAge ?? "?"}세 (절입까지 일수 ÷ 3, 반올림)</p>
  </section>`;
}

export function lockBadge(on) {
  return on
    ? `<span class="lock off">열림</span>`
    : `<span class="lock on">잠김</span>`;
}
