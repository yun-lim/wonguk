import { withBase } from "./base.js";

const DEFAULT_TITLE = "원국 — 만세력 사주팔자 명식 (절입 기준)";
const DEFAULT_DESC =
  "만세력으로 사주팔자 명식을 한 장에. 월주는 절입, 자시는 야자시 기본. 진태양시는 적용하지 않습니다. 생년월일은 브라우저에서만 계산합니다.";

const PAGES = {
  form: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    path: "/",
  },
  result: {
    title: "원국 명식 — 사주팔자 · 절입 만세력",
    description: DEFAULT_DESC,
    path: "/",
  },
  privacy: {
    title: "개인정보처리방침 — 원국",
    description: "원국은 생년월일을 서버로 보내지 않습니다. 브라우저에서만 계산하며, 공유 링크를 만든 경우에만 주소에 입력값이 남습니다.",
    path: "/privacy",
  },
  terms: {
    title: "이용약관 — 원국",
    description: "원국은 오락·참고용 만세력 명식입니다. 의학·법률·재정 자문이 아니며 결과를 보장하지 않습니다. 만 14세 이상에게 권합니다.",
    path: "/terms",
  },
  method: {
    title: "계산 기준 — 원국 (절입 · 야자시 · 진태양시)",
    description: "원국의 만세력 명식 계산 기준. 월주·연주는 절입, 자시는 야자시 기본, 진태양시는 적용하지 않습니다.",
    path: "/method",
  },
  notfound: {
    title: "페이지를 찾을 수 없습니다 — 원국",
    description: DEFAULT_DESC,
    path: "/",
  },
};

function absUrl(path) {
  return `${location.origin}${withBase(path)}`;
}

export function applySeo(view) {
  const meta = PAGES[view] || PAGES.form;
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
    ["og:site_name", "원국"],
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
