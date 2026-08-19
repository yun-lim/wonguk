import "./style.css";
import { HOUR_SLOTS, ELEMENTS, ELEMENT_COLOR, PILLAR_ORDER } from "./tables.js";
import { computeChart, parseQuery, toQuery, formatSolar, formatLunar } from "./engine.js";
import { applySeo } from "./seo.js";
import { pagePrivacy, pageTerms, pageMethod, pageNotFound } from "./pages.js";
import { withBase, normalizePath } from "./base.js";

const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");

const state = {
  view: "form",
  form: {
    name: "",
    gender: "m",
    isLunar: false,
    isLeapMonth: false,
    year: 1994,
    month: 9,
    day: 12,
    hourId: "x",
    dayBoundary: "jasi",
  },
  chart: null,
  error: "",
};

function syncFromLocation() {
  const path = normalizePath(location.pathname);
  if (path === "/") {
    const parsed = parseQuery(location.search);
    if (parsed) {
      state.form = { ...state.form, ...parsed };
      try {
        state.chart = computeChart(parsed);
        state.view = "result";
        state.error = "";
      } catch (err) {
        state.error = err.message || "이 날짜는 계산할 수 없습니다.";
        state.view = "form";
        state.chart = null;
      }
    } else {
      state.view = "form";
      state.chart = null;
    }
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

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderMasthead(tag = "v1 · 절기 명식") {
  return `
    <header class="masthead">
      <a class="brand" href="${withBase("/")}"><span class="seal">원</span><span class="wordmark">원국</span></a>
      <span class="tag">${tag}</span>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-foot">
      <p>
        <a href="${withBase("/")}">원국</a> · 임대균 ·
        <a href="mailto:limdg01@gmail.com">limdg01@gmail.com</a> ·
        <a href="${withBase("/terms")}">이용약관</a> ·
        <a href="${withBase("/privacy")}">개인정보처리방침</a> ·
        사업자정보 준비중
      </p>
    </footer>
  `;
}

function bindForm() {
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
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const chart = computeChart(state.form);
        state.chart = chart;
        state.error = "";
        state.view = "result";
        navigate("/", { search: `?${toQuery(state.form)}` });
      } catch (err) {
        state.error = err.message || "이 날짜는 계산할 수 없습니다.";
        render();
      }
    };
  }
}

function bindResult() {
  const edit = app.querySelector("#edit");
  if (edit) {
    edit.onclick = () => {
      navigate("/");
    };
  }
  const share = app.querySelector("#share");
  if (share) {
    share.onclick = async () => {
      const url = `${location.origin}${withBase("/")}?${toQuery(state.form)}`;
      try {
        await navigator.clipboard.writeText(url);
        toast("링크를 복사했습니다");
      } catch {
        prompt("이 주소를 복사하세요", url);
      }
    };
  }
}

function chipClass(on) {
  return on ? "chip on" : "chip";
}

function renderForm() {
  const f = state.form;
  const hours = HOUR_SLOTS.map((s) => {
    const wide = s.id === "x" ? " wide" : "";
    return `<button type="button" class="pick${f.hourId === s.id ? " on" : ""}${wide}" data-hour="${s.id}">
      ${s.label}<small>${s.sub}</small>
    </button>`;
  }).join("");

  app.innerHTML = `
    ${renderMasthead()}
    <h1 class="page-title">한 장으로 보는 원국</h1>
    <p class="lede">월주는 음력이 아니라 절입입니다. 자시는 야자시를 기본으로 두고, <a href="${withBase("/method")}">계산 기준</a>에서 절입·야자시·진태양시 규칙을 확인할 수 있습니다.</p>
    <form id="form">
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
      <button class="submit" type="submit">명식 보기</button>
      <div class="err">${esc(state.error)}</div>
    </form>
    <p class="legal">오락·참고용입니다. 의학·법률·재정 자문을 대체하지 않으며, 결과를 보장하지 않습니다. 진태양시·출생 도시는 아직 적용하지 않습니다.</p>
    ${renderFooter()}
  `;
  bindForm();
}

function pillarCell(key, p) {
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

function renderResult() {
  const c = state.chart;
  const max = Math.max(1, ...ELEMENTS.map((e) => c.elements[e]));
  const bars = ELEMENTS.map((e) => {
    const n = c.elements[e];
    const w = Math.round((n / max) * 100);
    return `<div class="bar-row">
      <span>${e}</span>
      <div class="track"><i style="width:${w}%;background:${ELEMENT_COLOR[e]}"></i></div>
      <span>${n}</span>
    </div>`;
  }).join("");

  const luckItems = (c.luck?.pillars || [])
    .map(
      (lp) => `<div class="luck-item${lp.current ? " now" : ""}">
        <span class="age">${lp.start}–${lp.end}세</span>
        <span class="gz">${lp.hanja} ${lp.korean}</span>
        <span class="god">${esc(lp.stem.god || "")}</span>
      </div>`,
    )
    .join("");

  const name = c.name || "원국";
  const hourLine = c.hourUnknown ? "시간 모름" : `${c.hourLabel} ${c.hourSub}`;
  const bound = c.dayBoundary === "jasi" ? "야자시" : "자정 경계";

  app.innerHTML = `
    ${renderMasthead()}
    <div class="toolbar">
      <button class="ghost" id="edit" type="button">수정</button>
      <button class="ghost primary" id="share" type="button">링크 복사</button>
    </div>
    <div class="who"><span class="name">${esc(name)}</span></div>
    <div class="meta">
      ${c.genderLabel} · ${formatSolar(c.solar)} · ${formatLunar(c.lunar)}<br>
      ${esc(hourLine)} · ${bound} · 만나이 ${c.age}세
    </div>
    <section class="myeong" aria-label="사주팔자">
      <div class="cols">
        ${pillarCell("hour", c.pillars.hour)}
        ${pillarCell("day", c.pillars.day)}
        ${pillarCell("month", c.pillars.month)}
        ${pillarCell("year", c.pillars.year)}
      </div>
    </section>
    <section class="bars">
      <h2>오행</h2>
      ${bars}
      <p class="hint">${c.hourUnknown ? "연월일 6글자" : "연월일시 8글자"} · 지장간 미포함</p>
    </section>
    <section class="luck">
      <h2>대운</h2>
      <div class="luck-list">${luckItems}</div>
      <p class="dir-note">${c.luck?.forward ? "순행" : "역행"} · 대운수 약 ${c.luck?.startAge ?? "?"}세 (절입까지 일수 ÷ 3, 반올림)</p>
    </section>
    <section class="reads">
      <h2>풀이</h2>
      <article class="card"><h3>${esc(c.readings.dayMaster.title)}</h3><p>${esc(c.readings.dayMaster.body)}</p></article>
      <article class="card"><h3>${esc(c.readings.elements.title)}</h3><p>${esc(c.readings.elements.body)}</p></article>
      <article class="card"><h3>${esc(c.readings.luck.title)}</h3><p>${esc(c.readings.luck.body)}</p></article>
    </section>
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
    ${renderFooter()}
  `;
  bindResult();
}

function renderStatic(tag, body) {
  app.innerHTML = `
    ${renderMasthead(tag)}
    ${body}
    ${renderFooter()}
  `;
}

function render() {
  if (state.view === "result" && state.chart) renderResult();
  else if (state.view === "privacy") renderStatic("개인정보", pagePrivacy());
  else if (state.view === "terms") renderStatic("이용약관", pageTerms());
  else if (state.view === "method") renderStatic("계산 기준", pageMethod());
  else if (state.view === "notfound") renderStatic("없음", pageNotFound());
  else renderForm();
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

syncFromLocation();
render();
