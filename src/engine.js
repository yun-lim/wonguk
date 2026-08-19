import {
  calculateFourPillars,
  solarToLunar,
  lunarToSolar,
  getSolarTerm,
  getTenGod,
  getBranchTenGod,
} from "manseryeok";
import {
  STEM_HANJA,
  BRANCH_HANJA,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  STEM_YINYANG,
  ELEMENTS,
  HOUR_BY_ID,
} from "./tables.js";
import { readingDayMaster, readingElements, readingLuck } from "./copy.js";

export { getSolarTerm };

export function manAge(year, month, day, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const ny = Number(parts.find((p) => p.type === "year").value);
  const nm = Number(parts.find((p) => p.type === "month").value);
  const nd = Number(parts.find((p) => p.type === "day").value);
  let age = ny - year;
  if (nm < month || (nm === month && nd < day)) age -= 1;
  return age;
}

function packChar(kind, ko, god) {
  if (!ko) return null;
  const hanja = kind === "stem" ? STEM_HANJA[ko] : BRANCH_HANJA[ko];
  const element = kind === "stem" ? STEM_ELEMENT[ko] : BRANCH_ELEMENT[ko];
  const yinyang = kind === "stem" ? STEM_YINYANG[ko] : null;
  return { ko, hanja, element, yinyang, god: god || null };
}

function packPillar(pillar, gods) {
  if (!pillar) return null;
  return {
    stem: packChar("stem", pillar.heavenlyStem, gods?.stem),
    branch: packChar("branch", pillar.earthlyBranch, gods?.branch),
    korean: `${pillar.heavenlyStem}${pillar.earthlyBranch}`,
    hanja: `${STEM_HANJA[pillar.heavenlyStem]}${BRANCH_HANJA[pillar.earthlyBranch]}`,
  };
}

function countElements(pillars, includeHour) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const keys = includeHour ? ["year", "month", "day", "hour"] : ["year", "month", "day"];
  for (const key of keys) {
    const p = pillars[key];
    if (!p) continue;
    counts[p.stem.element] += 1;
    counts[p.branch.element] += 1;
  }
  counts.total = ELEMENTS.reduce((s, e) => s + counts[e], 0);
  return counts;
}

function buildLuck(raw, dayStem, age, elements) {
  if (!raw || !Array.isArray(raw.pillars) || raw.pillars.length === 0) return null;
  const steps = raw.pillars.slice(0, 10).map((lp, i, arr) => {
    const next = arr[i + 1];
    const start = lp.age;
    const end = next ? next.age - 1 : lp.age + 9;
    const packed = packPillar(lp.pillar, {
      stem: getTenGod(dayStem, lp.pillar.heavenlyStem),
      branch: getBranchTenGod(dayStem, lp.pillar.earthlyBranch),
    });
    return {
      start,
      end,
      ...packed,
      current: age >= start && age <= end,
    };
  });
  let currentIndex = steps.findIndex((s) => s.current);
  if (currentIndex < 0 && age < steps[0].start) currentIndex = -1;
  if (currentIndex < 0 && age > steps[steps.length - 1].end) currentIndex = steps.length - 1;
  return {
    forward: Boolean(raw.forward),
    startAge: raw.startAge,
    startYears: raw.startYears,
    startMonths: raw.startMonths,
    startDays: raw.startDays,
    pillars: steps,
    currentIndex,
    current: currentIndex >= 0 ? steps[currentIndex] : null,
    beforeFirst: age < steps[0].start,
  };
}

/**
 * @param {object} input
 * @param {number} input.year
 * @param {number} input.month
 * @param {number} input.day
 * @param {boolean} input.isLunar
 * @param {boolean} [input.isLeapMonth]
 * @param {'m'|'f'} input.gender
 * @param {string} [input.hourId]  HOUR_SLOTS id, 'x' = 모름
 * @param {'jasi'|'midnight'} [input.dayBoundary]
 * @param {string} [input.name]
 * @param {Date} [input.now]
 */
export function computeChart(input) {
  const hourId = input.hourId || "x";
  const slot = HOUR_BY_ID[hourId] || HOUR_BY_ID.x;
  const hourUnknown = slot.hour === null;
  const dayBoundary = input.dayBoundary === "midnight" ? "midnight" : "jasi";
  const gender = input.gender === "f" ? "female" : "male";
  const isLunar = Boolean(input.isLunar);
  const isLeapMonth = Boolean(input.isLeapMonth) && isLunar;

  const hour = hourUnknown ? 12 : slot.hour;
  const minute = hourUnknown ? 0 : slot.minute;

  const raw = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour,
    minute,
    isLunar,
    isLeapMonth,
    dayBoundary,
    gender,
  });

  let solar;
  let lunar;
  if (isLunar) {
    solar = lunarToSolar(input.year, input.month, input.day, isLeapMonth);
    lunar = {
      year: input.year,
      month: input.month,
      day: input.day,
      isLeapMonth,
    };
  } else {
    solar = { year: input.year, month: input.month, day: input.day };
    lunar = solarToLunar(input.year, input.month, input.day);
  }

  const gods = raw.tenGods || {};
  const pillars = {
    year: packPillar(raw.year, gods.year),
    month: packPillar(raw.month, gods.month),
    day: packPillar(raw.day, { stem: "일간", branch: gods.day?.branch }),
    hour: hourUnknown ? null : packPillar(raw.hour, gods.hour),
  };

  const dayStem = raw.day.heavenlyStem;
  const elements = countElements(pillars, !hourUnknown);
  const age = manAge(solar.year, solar.month, solar.day, input.now);
  const luck = buildLuck(raw.luckPillars, dayStem, age, elements);

  const dayMaster = {
    stem: dayStem,
    hanja: STEM_HANJA[dayStem],
    element: STEM_ELEMENT[dayStem],
    yinyang: STEM_YINYANG[dayStem],
  };

  return {
    name: (input.name || "").trim(),
    gender: input.gender === "f" ? "f" : "m",
    genderLabel: input.gender === "f" ? "여" : "남",
    hourId,
    hourUnknown,
    hourLabel: slot.label,
    hourSub: slot.sub,
    dayBoundary,
    isLunar,
    isLeapMonth,
    solar,
    lunar,
    age,
    dayMaster,
    pillars,
    elements,
    luck,
    voidBranches: raw.voidBranches || [],
    rawKorean: raw.toObject(),
    rawHanja: typeof raw.toHanjaObject === "function" ? raw.toHanjaObject() : null,
    readings: {
      dayMaster: readingDayMaster(dayMaster),
      elements: readingElements(elements, dayMaster, hourUnknown),
      luck: readingLuck(luck, dayMaster, elements, age),
    },
  };
}

export function parseQuery(search) {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (!q.get("y") || !q.get("mo") || !q.get("d") || !q.get("g")) return null;
  const year = Number(q.get("y"));
  const month = Number(q.get("mo"));
  const day = Number(q.get("d"));
  if (!year || !month || !day) return null;
  return {
    year,
    month,
    day,
    isLunar: q.get("c") === "l",
    isLeapMonth: q.get("leap") === "1",
    gender: q.get("g") === "f" ? "f" : "m",
    hourId: q.get("hh") || "x",
    dayBoundary: q.get("b") === "midnight" ? "midnight" : "jasi",
    name: q.get("n") || "",
  };
}

export function toQuery(input) {
  const q = new URLSearchParams();
  q.set("g", input.gender === "f" ? "f" : "m");
  q.set("c", input.isLunar ? "l" : "s");
  q.set("leap", input.isLunar && input.isLeapMonth ? "1" : "0");
  q.set("y", String(input.year));
  q.set("mo", String(input.month));
  q.set("d", String(input.day));
  q.set("hh", input.hourId || "x");
  q.set("b", input.dayBoundary === "midnight" ? "midnight" : "jasi");
  if (input.name) q.set("n", input.name);
  return q.toString();
}

export function formatSolar(s) {
  return `양력 ${s.year}. ${s.month}. ${s.day}.`;
}

export function formatLunar(l) {
  const leap = l.isLeapMonth ? "윤" : "";
  return `음력 ${l.year}. ${leap}${l.month}. ${l.day}.`;
}
