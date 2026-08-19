import { withBase } from "./base.js";

const DEFAULT_TITLE = "사주봄 — 만세력 사주팔자 명식 (절입 기준)";
const DEFAULT_DESC =
  "만세력으로 사주팔자 명식을 한 장에. 월주는 절입, 자시는 야자시 기본. 진태양시는 적용하지 않습니다. 생년월일은 브라우저에서만 계산합니다.";

const PAGES = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    path: "/",
  },
  input: {
    title: "내 사주 입력 — 만세력 명식",
    description: DEFAULT_DESC,
    path: "/input",
  },
  dashboard: {
    title: "내 사주 — 만세력 명식",
    description: DEFAULT_DESC,
    path: "/dashboard",
  },
  manse: {
    title: "만세력 계산기 — 사주팔자 명식 (절입 · 야자시)",
    description: DEFAULT_DESC,
    path: "/manse",
  },
  "manse-result": {
    title: "명식 — 사주팔자 · 절입 만세력",
    description: DEFAULT_DESC,
    path: "/manse",
  },
  reports: {
    title: "리포트 — 신년 · 연애 · 재물",
    description: "일간·오행·대운으로 쓴 신년·연애·재물 리포트. 한 줄 운세가 아닙니다.",
    path: "/reports",
  },
  report: {
    title: "리포트 — 신년 · 연애 · 재물",
    description: "일간·오행·대운으로 쓴 긴 글. 잠금 해제 후 본문이 열립니다.",
    path: "/reports",
  },
  pay: {
    title: "요금 — ₩990 한 번 · ₩9,900 한 달",
    description: "리포트 전체 해제. ₩990 한 번(이 브라우저 영구) 또는 ₩9,900 30일. 지금은 가상 결제입니다.",
    path: "/pay",
  },
  settings: {
    title: "설정 — 계산 기준 · 약관",
    description: "계산 기준, 이용약관, 이 브라우저의 저장.",
    path: "/settings",
  },
  privacy: {
    title: "개인정보처리방침 — 사주봄",
    description: "생년월일을 서버로 보내지 않습니다. 브라우저에서만 계산하며, 명식과 해제는 이 기기에만 남습니다.",
    path: "/privacy",
  },
  terms: {
    title: "이용약관 — 사주봄",
    description: "오락·참고용 만세력 명식입니다. 의학·법률·재정 자문이 아니며 결과를 보장하지 않습니다. 만 14세 이상에게 권합니다.",
    path: "/terms",
  },
  method: {
    title: "계산 기준 — 절입 · 야자시 · 진태양시",
    description: "만세력 명식 계산 기준. 월주·연주는 절입, 자시는 야자시 기본, 진태양시는 적용하지 않습니다.",
    path: "/method",
  },
  notfound: {
    title: "페이지를 찾을 수 없습니다",
    description: DEFAULT_DESC,
    path: "/",
  },
};

function absUrl(path) {
  return `${location.origin}${withBase(path)}`;
}

export function applySeo(view, extra) {
  const meta = { ...(PAGES[view] || PAGES.home), ...(extra || {}) };
  document.title = meta.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", meta.description);
  const url = absUrl(meta.path);
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute("href", url);
  const pairs = [
    ["og:title", meta.title],
    ["og:description", meta.description],
    ["og:url", url],
    ["og:image", absUrl("/og.png")],
    ["og:locale", "ko_KR"],
    ["og:site_name", "사주봄"],
    ["og:type", "website"],
  ];
  for (const [prop, value] of pairs) {
    const el = document.querySelector(`meta[property="${prop}"]`);
    if (el) el.setAttribute("content", value);
  }
  const tw = [
    ["twitter:title", meta.title],
    ["twitter:description", meta.description],
    ["twitter:image", absUrl("/og.png")],
  ];
  for (const [name, value] of tw) {
    const el = document.querySelector(`meta[name="${name}"]`);
    if (el) el.setAttribute("content", value);
  }
}
