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

function svgIcon(inner) {
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}

const GLYPH = {
  saju: svgIcon('<rect x="3.4" y="3.4" width="7.6" height="7.6" rx="1.8"/><rect x="13" y="3.4" width="7.6" height="7.6" rx="1.8"/><rect x="3.4" y="13" width="7.6" height="7.6" rx="1.8"/><rect x="13" y="13" width="7.6" height="7.6" rx="1.8"/>'),
  year: svgIcon('<path d="M11.1 2.2h1.8v3.1h-1.8zM11.1 18.7h1.8v3.1h-1.8zM2.2 11.1h3.1v1.8H2.2zM18.7 11.1h3.1v1.8h-3.1zM5.05 4.05l1.27-1.27 2.2 2.2-1.28 1.27zM15.48 14.48l1.27-1.27 2.2 2.2-1.28 1.27zM18.95 5.05l1.27 1.27-2.2 2.2-1.27-1.28zM4.05 18.95l1.27 1.27 2.2-2.2-1.28-1.27z"/><circle cx="12" cy="12" r="5"/>'),
  love: svgIcon('<path d="M12 20.4S4.4 15.5 4.4 10.1A4.4 4.4 0 0112 7.8a4.4 4.4 0 017.6 2.3c0 5.4-7.6 10.3-7.6 10.3z"/>'),
  wealth: svgIcon('<path fill-rule="evenodd" d="M9.8 4.4a7 7 0 100 14 7 7 0 000-14zm0 3.1a3.9 3.9 0 110 7.8 3.9 3.9 0 010-7.8z"/><path d="M15.6 8.6a6.2 6.2 0 11-3.2 11.1 8.2 8.2 0 004.4-8.4 6.1 6.1 0 01-1.2-2.7z"/>'),
  manse: svgIcon('<path fill-rule="evenodd" d="M8 2.6h2v2.2h4V2.6h2v2.2h3.2A1.8 1.8 0 0121 6.6v12.6A1.8 1.8 0 0119.2 21H4.8A1.8 1.8 0 013 19.2V6.6a1.8 1.8 0 011.8-1.8H8V2.6zm-4 6.2h16v10.4H4V8.8zm2.4 2.2h3.1v3.1H6.4v-3.1zm5.1 0h3.1v3.1h-3.1v-3.1zm5.1 0H19.7v3.1h-3.1v-3.1z"/>'),
  pay: svgIcon('<path fill-rule="evenodd" d="M3.2 6.6h17.6A1.8 1.8 0 0122.6 8.4v9.2a1.8 1.8 0 01-1.8 1.8H3.2A1.8 1.8 0 011.4 17.6V8.4A1.8 1.8 0 013.2 6.6zm8.8 2.4a3.3 3.3 0 100 6.6 3.3 3.3 0 000-6.6z"/>'),
  method: svgIcon('<path d="M4.2 4.2h6.4c2.6 0 4 1.5 4 3.6v12.2c-1.5-1-3.1-1.5-4-1.5H4.2V4.2z"/><path d="M19.8 4.2h-6.4c-2.6 0-4 1.5-4 3.6v12.2c1.5-1 3.1-1.5 4-1.5h6.4V4.2z"/>'),
  settings: svgIcon('<path fill-rule="evenodd" d="M10.2 2.4h3.6l.5 2.1c.7.2 1.3.6 1.9 1l2.1-.6 1.8 3.1-1.6 1.5c.1.5.2 1 .2 1.5s-.1 1-.2 1.5l1.6 1.5-1.8 3.1-2.1-.6a6.7 6.7 0 01-1.9 1l-.5 2.1h-3.6l-.5-2.1a6.7 6.7 0 01-1.9-1l-2.1.6-1.8-3.1 1.6-1.5A6.8 6.8 0 014.6 12c0-.5.1-1 .2-1.5L3.2 9l1.8-3.1 2.1.6c.6-.4 1.2-.8 1.9-1l.5-2.1zM12 9a3 3 0 100 6 3 3 0 000-6z"/>'),
  terms: svgIcon('<path fill-rule="evenodd" d="M6.6 2.8h7.2L19.6 8.6V20a1.6 1.6 0 01-1.6 1.6H6.6A1.6 1.6 0 015 20V4.4A1.6 1.6 0 016.6 2.8zm6.8.6v4.8h4.8L13.4 3.4zM8 12.2h8v1.6H8v-1.6zm0 3.4h6.2v1.6H8v-1.6z"/>'),
  home: svgIcon('<path d="M3.4 11L12 3.8 20.6 11v8.2A1.6 1.6 0 0119 20.8h-4.4v-5.6H9.4v5.6H5A1.6 1.6 0 013.4 19.2V11z"/>'),
  reports: svgIcon('<path fill-rule="evenodd" d="M6 3.6h8.2L18.8 8.2V19.6A1.6 1.6 0 0117.2 21.2H6A1.6 1.6 0 014.4 19.6V5.2A1.6 1.6 0 016 3.6zm7.8.8v4.4h4.4L13.8 4.4zM7.6 12.2h8.4v1.6H7.6v-1.6zm0 3.4h6v1.6h-6v-1.6z"/>'),
};

export const HOME_TILES = [
  { id: "saju", line1: "내 사주", line2: "명식", icon: "saju", color: "#ff7a59" },
  { id: "year", line1: "신년", line2: "리포트", icon: "year", color: "#f0b429", href: "/reports/year", lockable: true },
  { id: "love", line1: "연애", line2: "리포트", icon: "love", color: "#f06292", href: "/reports/love", lockable: true },
  { id: "wealth", line1: "재물", line2: "리포트", icon: "wealth", color: "#43c59e", href: "/reports/wealth", lockable: true },
  { id: "manse", line1: "만세력", line2: "계산기", icon: "manse", color: "#5b8def", href: "/manse" },
  { id: "pay", line1: "요금", line2: "990원", icon: "pay", color: "#ff9f43", href: "/pay" },
  { id: "method", line1: "계산", line2: "기준", icon: "method", color: "#8b7cf6", href: "/method" },
  { id: "settings", line1: "설정", line2: "앱 설정", icon: "settings", color: "#7d8896", href: "/settings" },
  { id: "terms", line1: "약관", line2: "이용안내", icon: "terms", color: "#5d6b7a", href: "/terms" },
];

export function homeTiles({ hasProfile = false, unlocked = false } = {}) {
  return HOME_TILES.map((t) => {
    if (t.id === "saju") {
      return {
        ...t,
        href: hasProfile ? "/dashboard" : "/input",
        line2: hasProfile ? "보기" : "만들기",
        lock: false,
      };
    }
    return { ...t, lock: Boolean(t.lockable && !unlocked) };
  });
}

export function renderServiceGrid(tiles) {
  return tiles
    .map((t) => {
      const lock = t.lock ? `<span class="svc-lock">잠김</span>` : "";
      return `<a class="svc-item" href="${withBase(t.href)}">
        <span class="svc-icon" style="background:${t.color}">${GLYPH[t.icon]}</span>
        ${lock}
        <span class="svc-text"><strong>${esc(t.line1)}</strong><em>${esc(t.line2)}</em></span>
      </a>`;
    })
    .join("");
}

export function renderHScroll(items) {
  return items
    .map(
      (c) => `<a class="h-card" href="${withBase(c.href)}">
        <span class="h-kicker">${esc(c.kicker)}</span>
        <strong>${esc(c.title)}</strong>
        <span class="h-sub">${esc(c.sub)}</span>
      </a>`,
    )
    .join("");
}

export function renderTopbar(name = "게스트") {
  const who = String(name || "").trim() || "게스트";
  return `
    <header class="topbar">
      <span class="cat">운세</span>
      <a class="greet" href="${withBase("/settings")}">${esc(who)}</a>
    </header>
  `;
}

/** @deprecated use renderTopbar */
export function renderMasthead(tag = "운세") {
  return renderTopbar(tag === "오늘" ? "게스트" : "게스트");
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
  { id: "home", path: "/", label: "홈", icon: "home" },
  { id: "reports", path: "/reports", label: "리포트", icon: "reports" },
  { id: "manse", path: "/manse", label: "만세력", icon: "manse" },
  { id: "pay", path: "/pay", label: "요금", icon: "pay" },
  { id: "settings", path: "/settings", label: "설정", icon: "settings" },
];

export function activeTab(view) {
  if (view === "reports" || view === "report") return "reports";
  if (view === "pay") return "pay";
  if (view === "settings" || view === "privacy" || view === "terms" || view === "method") return "settings";
  if (view === "manse" || view === "manse-result") return "manse";
  return "home";
}

export function renderTabbar(view) {
  const on = activeTab(view);
  const items = TABS.map((t) => {
    const cls = t.id === on ? "tab on" : "tab";
    return `<a class="${cls}" href="${withBase(t.path)}">${GLYPH[t.icon]}<span>${t.label}</span></a>`;
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
