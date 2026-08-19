import "./style.css";
import { HOUR_SLOTS } from "./tables.js";
import { computeChart, parseQuery, toQuery, formatSolar, formatLunar } from "./engine.js";
import { applySeo } from "./seo.js";
import { pagePrivacy, pageTerms, pageMethod, pageNotFound } from "./pages.js";
import { withBase, normalizePath } from "./base.js";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  loadBilling,
  applyMockPurchase,
  clearBilling,
} from "./storage.js";
import {
  PRODUCTS,
  PRODUCT_BY_ID,
  isEntitled,
  daysLeft,
  formatExpiry,
  startRealCheckout,
} from "./billing.js";
import { buildReport, REPORT_META, reportPreview } from "./reports.js";
import {
  esc,
  chipClass,
  renderTopbar,
  renderFooter,
  renderTabbar,
  pillarGrid,
  elementBars,
  luckList,
  lockBadge,
  homeTiles,
  renderServiceGrid,
  renderHScroll,
} from "./ui.js";

const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");

const DEFAULT_FORM = {
  name: "",
  gender: "m",
  isLunar: false,
  isLeapMonth: false,
  year: 1994,
  month: 9,
  day: 12,
  hourId: "x",
  dayBoundary: "jasi",
};

const REPORT_IDS = ["year", "love", "wealth"];

const state = {
  view: "home",
  reportId: "year",
  form: { ...DEFAULT_FORM },
  chart: null,
  savedChart: null,
  profile: null,
  billing: null,
  error: "",
  payPlan: "wonguk_once",
};

function refreshStore() {
  state.profile = loadProfile();
  state.billing = loadBilling();
  state.savedChart = null;
  if (state.profile) {
    try {
      state.savedChart = computeChart(state.profile);
    } catch {
      state.savedChart = null;
    }
  }
}

function unlocked() {
  return isEntitled(state.billing);
}

function syncFromLocation() {
  refreshStore();
  const path = normalizePath(location.pathname);
  const q = parseQuery(location.search);

  if (path === "/" && q) {
    navigate("/manse", { replace: true, search: location.search });
    return;
  }

  state.error = "";
  state.chart = null;
  state.reportId = "year";

  if (path === "/") {
    state.view = "home";
    if (state.profile) state.form = { ...DEFAULT_FORM, ...state.profile };
    return;
  }
  if (path === "/dashboard") {
    if (!state.savedChart) {
      navigate("/input", { replace: true });
      return;
    }
    state.view = "dashboard";
    return;
  }
  if (path === "/input") {
    state.view = "input";
    state.form = { ...DEFAULT_FORM, ...(state.profile || {}) };
    return;
  }
  if (path === "/manse") {
    if (q) {
      state.form = { ...DEFAULT_FORM, ...q };
      try {
        state.chart = computeChart(q);
        state.view = "manse-result";
        state.error = "";
      } catch (err) {
        state.error = err.message || "이 날짜는 계산할 수 없습니다.";
        state.view = "manse";
      }
    } else {
      state.view = "manse";
    }
    return;
  }
  if (path === "/reports") {
    state.view = "reports";
    return;
  }
  if (path.startsWith("/reports/")) {
    const id = path.slice("/reports/".length);
    if (REPORT_IDS.includes(id)) {
      state.reportId = id;
      state.view = "report";
      return;
    }
  }
  if (path === "/pay") {
    state.view = "pay";
    return;
  }
  if (path === "/settings") {
    state.view = "settings";
    return;
  }
  if (path === "/privacy") {
    state.view = "privacy";
    return;
  }
  if (path === "/terms") {
    state.view = "terms";
    return;
  }
  if (path === "/method") {
    state.view = "method";
    return;
  }
  state.view = "notfound";
}

function navigate(path, { replace = false, search = "" } = {}) {
  const url = `${withBase(path)}${search}`;
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  syncFromLocation();
  render();
  window.scrollTo(0, 0);
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function greetingName() {
  const n = String(state.profile?.name || "").trim();
  return n || "게스트";
}

function shell(tag, body, { tab = true } = {}) {
  return `
    ${renderTopbar(greetingName())}
    ${body}
    ${renderFooter()}
    ${tab ? renderTabbar(state.view) : ""}
  `;
}

function bindForm(onSubmit) {
  app.querySelectorAll("[data-gender]").forEach((el) => {
    el.onclick = () => {
      state.form.gender = el.dataset.gender;
      render();
    };
  });
  app.querySelectorAll("[data-cal]").forEach((el) => {
    el.onclick = () => {
      state.form.isLunar = el.dataset.cal === "l";
      if (!state.form.isLunar) state.form.isLeapMonth = false;
      render();
    };
  });
  app.querySelectorAll("[data-hour]").forEach((el) => {
    el.onclick = () => {
      state.form.hourId = el.dataset.hour;
      render();
    };
  });
  app.querySelectorAll("[data-bound]").forEach((el) => {
    el.onclick = () => {
      state.form.dayBoundary = el.dataset.bound;
      render();
    };
  });
  const leap = app.querySelector("#leap");
  if (leap) {
    leap.onchange = () => {
      state.form.isLeapMonth = leap.checked;
    };
  }
  ["year", "month", "day"].forEach((k) => {
    const el = app.querySelector(`#${k}`);
    if (el) el.onchange = () => { state.form[k] = Number(el.value); };
  });
  const name = app.querySelector("#name");
  if (name) name.oninput = () => { state.form.name = name.value; };
  const form = app.querySelector("#form");
  if (form) form.onsubmit = onSubmit;
}

function formFields() {
  const f = state.form;
  const hours = HOUR_SLOTS.map((s) => {
    const wide = s.id === "x" ? " wide" : "";
    return `<button type="button" class="pick${f.hourId === s.id ? " on" : ""}${wide}" data-hour="${s.id}">
      ${s.label}<small>${s.sub}</small>
    </button>`;
  }).join("");
  return `
    <div class="field">
      <label class="lbl" for="name">이름 · 선택</label>
      <input class="name-input" id="name" maxlength="20" placeholder="비워도 됩니다" value="${esc(f.name)}" autocomplete="name">
    </div>
    <div class="field">
      <div class="lbl">성별</div>
      <div class="seg">
        <button type="button" class="${chipClass(f.gender === "m")}" data-gender="m">남성</button>
        <button type="button" class="${chipClass(f.gender === "f")}" data-gender="f">여성</button>
      </div>
    </div>
    <div class="field">
      <div class="lbl">달력</div>
      <div class="seg">
        <button type="button" class="${chipClass(!f.isLunar)}" data-cal="s">양력</button>
        <button type="button" class="${chipClass(f.isLunar)}" data-cal="l">음력</button>
      </div>
      <div class="leap-row ${f.isLunar ? "" : "hidden"}">
        <label><input type="checkbox" id="leap" ${f.isLeapMonth ? "checked" : ""}> 윤달</label>
      </div>
    </div>
    <div class="field">
      <div class="lbl">생년월일</div>
      <div class="dates">
        <input id="year" type="number" inputmode="numeric" min="1800" max="2100" value="${f.year}" required>
        <input id="month" type="number" inputmode="numeric" min="1" max="12" value="${f.month}" required>
        <input id="day" type="number" inputmode="numeric" min="1" max="31" value="${f.day}" required>
      </div>
      <div class="hint">연 · 월 · 일 · 한국 기준 1800–2100</div>
    </div>
    <div class="field">
      <div class="lbl">태어난 시</div>
      <div class="hours">${hours}</div>
    </div>
    <div class="field">
      <div class="lbl">자시 관법</div>
      <div class="seg">
        <button type="button" class="${chipClass(f.dayBoundary === "jasi")}" data-bound="jasi">
          야자시<small>23시부터 다음날 일주</small>
        </button>
        <button type="button" class="${chipClass(f.dayBoundary === "midnight")}" data-bound="midnight">
          자정 경계<small>23시도 당일 일주</small>
        </button>
      </div>
    </div>
  `;
}

function chartMeta(c) {
  const hourLine = c.hourUnknown ? "시간 모름" : `${c.hourLabel} ${c.hourSub}`;
  const bound = c.dayBoundary === "jasi" ? "야자시" : "자정 경계";
  return `${c.genderLabel} · ${formatSolar(c.solar)} · ${formatLunar(c.lunar)}<br>${esc(hourLine)} · ${bound} · 만나이 ${c.age}세`;
}

function readingsBlock(c) {
  return `<section class="reads">
    <h2>풀이</h2>
    <article class="card"><h3>${esc(c.readings.dayMaster.title)}</h3><p>${esc(c.readings.dayMaster.body)}</p></article>
    <article class="card"><h3>${esc(c.readings.elements.title)}</h3><p>${esc(c.readings.elements.body)}</p></article>
    <article class="card"><h3>${esc(c.readings.luck.title)}</h3><p>${esc(c.readings.luck.body)}</p></article>
  </section>`;
}

function renderHome() {
  const saved = Boolean(state.savedChart);
  const tiles = homeTiles({ hasProfile: saved, unlocked: unlocked() });
  const heroHref = saved ? withBase("/dashboard") : withBase("/input");
  const heroTitle = saved ? "저장된 명식을<br>한 장으로" : "한 장으로 보는<br>내 사주";
  const heroCta = saved ? "내 사주 보기" : "시작하기";
  const scroll = renderHScroll([
    { kicker: "新年", title: "신년 리포트", sub: "올해의 흐름과 대운", href: "/reports/year" },
    { kicker: "戀愛", title: "연애 리포트", sub: "관계의 결과 십성", href: "/reports/love" },
    { kicker: "財物", title: "재물 리포트", sub: "재성과 오행의 쓰임", href: "/reports/wealth" },
    { kicker: "무료", title: "만세력", sub: "저장 없이 한 장", href: "/manse" },
    { kicker: "해제", title: "요금 990", sub: "한 번 ₩990 · 30일 ₩9,900", href: "/pay" },
  ]);
  app.innerHTML = shell("운세", `
    <a class="hero-banner" href="${heroHref}">
      <img class="hero-art" src="${withBase("hero.png")}" alt="" width="1200" height="630">
      <div class="hero-copy">
        <p class="hero-kicker">절입 기준 명식</p>
        <h1>${heroTitle}</h1>
        <span class="hero-cta">${heroCta}</span>
      </div>
    </a>
    <section class="svc-card" aria-label="서비스">
      <div class="svc-grid">${renderServiceGrid(tiles)}</div>
    </section>
    <h2 class="sec-title">리포트</h2>
    <div class="h-scroll">${scroll}</div>
  `);
}

function renderDashboard() {
  const c = state.savedChart;
  const name = c.name || "내 사주";
  app.innerHTML = shell("저장됨", `
    <div class="toolbar">
      <a class="ghost" href="${withBase("/input")}">다시 계산</a>
      <a class="ghost primary" href="${withBase("/reports")}">리포트</a>
    </div>
    <div class="who"><span class="name">${esc(name)}</span></div>
    <div class="meta">${chartMeta(c)}</div>
    ${pillarGrid(c.pillars)}
    ${elementBars(c.elements, c.hourUnknown)}
    ${luckList(c.luck)}
    ${readingsBlock(c)}
    <p class="legal">월주·연주는 절입, 자시는 야자시 기본, 진태양시 없음. 오행은 겉글자만 셉니다. <a href="${withBase("/method")}">계산 기준</a></p>
  `);
}

function renderInput() {
  const editing = Boolean(state.profile);
  app.innerHTML = shell("입력", `
    <h1 class="page-title">${editing ? "사주를 다시 계산" : "내 사주 만들기"}</h1>
    <p class="lede">월주는 절입, 자시는 야자시 기본. 저장하면 이 브라우저에만 남습니다.</p>
    <form id="form">
      ${formFields()}
      <button class="submit" type="submit">저장하고 보기</button>
      <div class="err">${esc(state.error)}</div>
    </form>
    <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않습니다.</p>
  `);
  bindForm((e) => {
    e.preventDefault();
    try {
      const chart = computeChart(state.form);
      saveProfile(state.form);
      state.savedChart = chart;
      state.error = "";
      navigate("/dashboard");
      toast("이 브라우저에 저장했습니다");
    } catch (err) {
      state.error = err.message || "이 날짜는 계산할 수 없습니다.";
      render();
    }
  });
}

function renderManse() {
  app.innerHTML = shell("만세력", `
    <h1 class="page-title">한 장으로 보는 명식</h1>
    <p class="lede">월주는 음력이 아니라 절입입니다. 자시는 야자시를 기본으로 두고, <a href="${withBase("/method")}">계산 기준</a>에서 절입·야자시·진태양시 규칙을 확인할 수 있습니다.</p>
    <form id="form">
      ${formFields()}
      <button class="submit" type="submit">명식 보기</button>
      <div class="err">${esc(state.error)}</div>
    </form>
    <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않으며, 결과를 보장하지 않습니다. 진태양시·출생 도시는 아직 적용하지 않습니다.</p>
    <a class="quiet-link" href="${withBase("/")}">앱 처음으로</a>
  `);
  bindForm((e) => {
    e.preventDefault();
    try {
      computeChart(state.form);
      state.error = "";
      navigate("/manse", { search: `?${toQuery(state.form)}` });
    } catch (err) {
      state.error = err.message || "이 날짜는 계산할 수 없습니다.";
      render();
    }
  });
}

function renderManseResult() {
  const c = state.chart;
  const name = c.name || "명식";
  app.innerHTML = shell("만세력", `
    <div class="toolbar">
      <button class="ghost" id="edit" type="button">수정</button>
      <button class="ghost primary" id="share" type="button">링크 복사</button>
    </div>
    <div class="who"><span class="name">${esc(name)}</span></div>
    <div class="meta">${chartMeta(c)}</div>
    ${pillarGrid(c.pillars)}
    ${elementBars(c.elements, c.hourUnknown)}
    ${luckList(c.luck)}
    ${readingsBlock(c)}
    <footer class="rules">
      <h2>계산 규칙</h2>
      <dl>
        <dt>월주 · 연주</dt>
        <dd>24절기 절입 시각. 입춘=寅월·새해. 음력 달이 아닙니다. 절입표는 manseryeok(KASI 분 단위 검증, 1800–2300).</dd>
        <dt>자시</dt>
        <dd>23:00–01:00을 子시로 둡니다. 기본은 야자시: 23:00–24:00을 다음날 일주·시주로 묶습니다. 자정 경계는 23시도 당일 일주입니다. 조자시(00–01)는 항상 그 날 일주입니다.</dd>
        <dt>진태양시</dt>
        <dd>v1은 적용하지 않습니다. 입력 시각을 한국 표준시 그대로 씁니다. 경도·균시차·서머타임 없음.</dd>
        <dt>음력</dt>
        <dd>manseryeok의 KASI 정본 변환(1391–2100, 윤달 포함). 결과에는 양력과 음력을 함께 적습니다.</dd>
        <dt>대운</dt>
        <dd>양간 남·음간 여 = 순행, 그 외 역행. 대운수는 출생~인접 절(節) 일수 ÷ 3을 반올림(최소 1). 나이는 서울 기준 만나이.</dd>
        <dt>시간 모름</dt>
        <dd>시주를 「모름」으로 두고 시 십성을 생략합니다. 연월일 계산에는 정오를 넣습니다.</dd>
      </dl>
      <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않으며, 결과를 보장하지 않습니다. 신살 전체·용신 논쟁·출생 도시는 다루지 않습니다. <a href="${withBase("/method")}">계산 기준 자세히</a></p>
    </footer>
    <a class="quiet-link" href="${withBase("/input")}">이 명식을 앱에 저장</a>
  `);
  const edit = app.querySelector("#edit");
  if (edit) edit.onclick = () => navigate("/manse");
  const share = app.querySelector("#share");
  if (share) {
    share.onclick = async () => {
      const url = `${location.origin}${withBase("/manse")}?${toQuery(state.form)}`;
      try {
        await navigator.clipboard.writeText(url);
        toast("링크를 복사했습니다");
      } catch {
        prompt("이 주소를 복사하세요", url);
      }
    };
  }
}

function renderReports() {
  const on = unlocked();
  const list = REPORT_IDS.map((id) => {
    const m = REPORT_META[id];
    const href = on ? withBase(`/reports/${id}`) : withBase("/pay");
    return `<a class="tile wide" href="${href}">
      <div class="tile-row">
        <div>
          <span class="tile-kicker">${m.hanja}</span>
          <strong>${m.title}</strong>
          <span class="tile-sub">${m.subtitle}</span>
        </div>
        ${lockBadge(on)}
      </div>
      <p class="tile-preview">${esc(reportPreview(id))}</p>
    </a>`;
  }).join("");
  const cta = on
    ? `<p class="done">세 편이 이 브라우저에서 열려 있습니다.</p>`
    : `<a class="submit cta" href="${withBase("/pay")}">₩990 · 전체 해제</a>`;
  const need = state.savedChart
    ? ""
    : `<p class="lede">리포트를 열려면 먼저 <a href="${withBase("/input")}">내 사주</a>를 저장하세요.</p>`;
  app.innerHTML = shell("리포트", `
    <h1 class="page-title">리포트</h1>
    <p class="lede">신년 · 연애 · 재물. 일간·오행·현재 대운으로 쓴 긴 글입니다. 한 줄 운세가 아닙니다.</p>
    ${need}
    <div class="tiles">${list}</div>
    ${cta}
    <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않습니다.</p>
  `);
}

function renderReport() {
  const id = state.reportId;
  const meta = REPORT_META[id];
  if (!state.savedChart) {
    app.innerHTML = shell("리포트", `
      <h1 class="page-title">먼저 명식을 저장하세요</h1>
      <p class="lede">리포트는 저장된 사주를 바탕으로 씁니다.</p>
      <a class="submit cta" href="${withBase("/input")}">입력하기</a>
    `);
    return;
  }
  if (!unlocked()) {
    app.innerHTML = shell("잠김", `
      <p class="kicker">${meta.hanja}</p>
      <h1 class="page-title">${meta.title}은 잠겨 있습니다</h1>
      <p class="lede">본문은 ₩990 한 번 또는 ₩9,900/30일 해제 후에만 열립니다. 지금은 가상 결제입니다.</p>
      <a class="submit cta" href="${withBase("/pay")}">요금 보기</a>
    `);
    return;
  }
  const report = buildReport(id, state.savedChart);
  const sections = report.sections
    .map((s) => `<article class="card"><h3>${esc(s.heading)}</h3><p>${esc(s.body)}</p></article>`)
    .join("");
  app.innerHTML = shell(meta.title, `
    <p class="kicker">${meta.hanja}</p>
    <h1 class="page-title">${esc(report.title)}</h1>
    <p class="lede">${esc(report.lede)}</p>
    ${sections}
    <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않습니다.</p>
  `);
}

function renderPay() {
  const on = unlocked();
  const billing = state.billing;
  const left = daysLeft(billing);
  let status = "아직 해제되지 않았습니다.";
  if (on && billing?.plan === "wonguk_once") status = "한 번 결제 · 이 브라우저 영구 해제.";
  if (on && billing?.plan === "wonguk_monthly") status = `한 달 · ${formatExpiry(billing)} · 남은 날 ${left}일.`;
  if (!on && billing?.plan === "wonguk_monthly") status = `만료됨 · ${formatExpiry(billing)}. 아래에서 다시 해제하세요.`;

  const skus = PRODUCTS.map((p) => {
    const sel = state.payPlan === p.id ? " sku on" : " sku";
    return `<button type="button" class="card${sel}" data-plan="${p.id}">
      <div class="sku-row">
        <div>
          <strong>${p.title}</strong>
          <span class="tile-sub">${p.subtitle}</span>
        </div>
        <span class="price">${p.price}</span>
      </div>
    </button>`;
  }).join("");

  const product = PRODUCT_BY_ID[state.payPlan];
  app.innerHTML = shell("요금", `
    <p class="kicker">잠금 해제</p>
    <h1 class="page-title">리포트 전체</h1>
    <p class="lede">신년 · 연애 · 재물 세 편. 해제는 이 브라우저에만 남습니다. 지금은 실결제가 없습니다.</p>
    <div class="card note-card">
      <h3>지금 상태</h3>
      <p>${esc(status)}</p>
    </div>
    <div class="sku-list">${skus}</div>
    <div class="card note-card">
      <h3>결제 안내</h3>
      <p>개발용 가상 결제입니다. 아래 버튼을 누르면 출금 없이 바로 해제됩니다. 토스·Stripe 실결제는 아직 연결하지 않았습니다.</p>
    </div>
    <button class="submit" type="button" id="mock-pay">${product.price} · 개발용으로 해제</button>
    <button class="ghost full" type="button" id="real-pay">실결제 (아직 없음)</button>
    ${billing ? `<button class="ghost full" type="button" id="clear-pay">이 브라우저 해제 지우기</button>` : ""}
    <p class="err" id="pay-err"></p>
    <p class="legal">₩990 한 번 · ₩9,900 30일. 가상 결제이며 실제 출금이 없습니다. 광고는 넣지 않습니다.</p>
  `);

  app.querySelectorAll("[data-plan]").forEach((el) => {
    el.onclick = () => {
      state.payPlan = el.dataset.plan;
      render();
    };
  });
  const mock = app.querySelector("#mock-pay");
  if (mock) {
    mock.onclick = () => {
      state.billing = applyMockPurchase(state.payPlan);
      toast(state.payPlan === "wonguk_once" ? "영구 해제했습니다" : "30일 해제했습니다");
      render();
    };
  }
  const real = app.querySelector("#real-pay");
  if (real) {
    real.onclick = async () => {
      const err = app.querySelector("#pay-err");
      try {
        await startRealCheckout(state.payPlan);
      } catch (e) {
        if (err) err.textContent = e.message || "실결제는 아직 없습니다.";
      }
    };
  }
  const clear = app.querySelector("#clear-pay");
  if (clear) {
    clear.onclick = () => {
      clearBilling();
      state.billing = null;
      toast("해제를 지웠습니다");
      render();
    };
  }
}

function renderSettings() {
  const p = state.profile;
  const hint = p ? `${p.year}. ${p.month}. ${p.day}.` : "없음";
  const on = unlocked();
  const bill = on
    ? formatExpiry(state.billing)
    : "없음";
  app.innerHTML = shell("설정", `
    <h1 class="page-title">설정</h1>
    <p class="lede">계산 기준과 약관, 이 브라우저의 저장.</p>

    <p class="lbl">계산</p>
    <a class="card row-card" href="${withBase("/method")}">
      <strong>계산 기준</strong>
      <span class="tile-sub">절입 · 야자시 · 진태양시 없음</span>
    </a>
    <a class="card row-card" href="${withBase("/manse")}">
      <strong>만세력 계산기</strong>
      <span class="tile-sub">저장 없이 한 장으로 보기 · 공유 링크</span>
    </a>

    <p class="lbl">약관</p>
    <a class="card row-card" href="${withBase("/terms")}"><strong>이용약관</strong></a>
    <a class="card row-card" href="${withBase("/privacy")}"><strong>개인정보처리방침</strong></a>

    <p class="lbl">이 브라우저</p>
    <div class="card row-card">
      <strong>해제 상태</strong>
      <span class="tile-sub">${esc(bill)}</span>
    </div>
    <button class="card row-card danger" type="button" id="clear-profile">
      <strong>저장된 명식 삭제</strong>
      <span class="tile-sub">${esc(hint)}</span>
    </button>

    <div class="card note-card">
      <h3>개발 모드</h3>
      <p>실결제(토스·Stripe)는 자리만 있습니다. API 키와 AdSense는 넣지 않습니다. 상품: wonguk_once ₩990 · wonguk_monthly ₩9,900/30일.</p>
    </div>
    <p class="legal">오락·참고용입니다. 운영자 임대균 · limdg01@gmail.com · 사업자정보 준비중</p>
  `);
  const del = app.querySelector("#clear-profile");
  if (del) {
    del.onclick = () => {
      if (!state.profile) {
        toast("저장된 명식이 없습니다");
        return;
      }
      if (!confirm("저장된 명식을 지울까요? 해제 기록은 남습니다.")) return;
      clearProfile();
      state.profile = null;
      state.savedChart = null;
      toast("명식을 지웠습니다");
      navigate("/");
    };
  }
}

function renderStatic(tag, body) {
  app.innerHTML = shell(tag, body);
}

function render() {
  if (state.view === "home") renderHome();
  else if (state.view === "dashboard") renderDashboard();
  else if (state.view === "input") renderInput();
  else if (state.view === "manse") renderManse();
  else if (state.view === "manse-result") renderManseResult();
  else if (state.view === "reports") renderReports();
  else if (state.view === "report") renderReport();
  else if (state.view === "pay") renderPay();
  else if (state.view === "settings") renderSettings();
  else if (state.view === "privacy") renderStatic("개인정보", pagePrivacy());
  else if (state.view === "terms") renderStatic("이용약관", pageTerms());
  else if (state.view === "method") renderStatic("계산 기준", pageMethod());
  else if (state.view === "notfound") renderStatic("없음", pageNotFound());
  else renderHome();
  applySeo(state.view);
}

function isInternalHref(href) {
  if (!href) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) return false;
  if (href.startsWith("//")) return false;
  return true;
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
  const href = a.getAttribute("href");
  if (!isInternalHref(href)) return;
  const url = new URL(a.href, location.origin);
  if (url.origin !== location.origin) return;
  e.preventDefault();
  navigate(normalizePath(url.pathname), { search: url.search });
});

window.addEventListener("popstate", () => {
  syncFromLocation();
  render();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(withBase("sw.js")).catch(() => {});
}

syncFromLocation();
render();
