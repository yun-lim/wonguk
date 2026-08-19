import { describe, it, expect } from "vitest";
import { calculateFourPillars, getSolarTerm, solarToLunar } from "manseryeok";
import { computeChart } from "../src/engine.js";

function pillarKo(p) {
  return `${p.heavenlyStem}${p.earthlyBranch}`;
}

describe("2024 입춘 전후 월주·연주", () => {
  it("입춘 절입은 2월 4일 17시 근처 (국제뉴스 17:27 KST)", () => {
    const lichun = getSolarTerm(2024, 2);
    const kst = lichun.date.toLocaleString("en-CA", {
      timeZone: "Asia/Seoul",
      hour12: false,
    });
    // 2024-02-04, 17시 부근. 분 단위는 라이브러리 절입표.
    expect(kst.startsWith("2024-02-04")).toBe(true);
    const hour = Number(
      lichun.date.toLocaleString("en-GB", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        hour12: false,
      }),
    );
    expect(hour).toBe(17);
  });

  it("입춘 전 16:00 — 아직 계묘년 을축월", () => {
    const r = calculateFourPillars({
      year: 2024,
      month: 2,
      day: 4,
      hour: 16,
      minute: 0,
    });
    expect(pillarKo(r.year)).toBe("계묘");
    expect(pillarKo(r.month)).toBe("을축");
  });

  it("입춘 후 18:00 — 갑진년 병인월", () => {
    const r = calculateFourPillars({
      year: 2024,
      month: 2,
      day: 4,
      hour: 18,
      minute: 0,
    });
    expect(pillarKo(r.year)).toBe("갑진");
    expect(pillarKo(r.month)).toBe("병인");
  });
});

describe("자시 경계", () => {
  const base = { year: 2024, month: 3, day: 10, hour: 23, minute: 30 };

  it("야자시(jasi): 23:30은 다음날 일주·시주", () => {
    const r = calculateFourPillars({ ...base, dayBoundary: "jasi" });
    expect(pillarKo(r.day)).toBe("갑술");
    expect(pillarKo(r.hour)).toBe("갑자");
  });

  it("자정 경계(midnight): 23:30은 당일 일주", () => {
    const r = calculateFourPillars({ ...base, dayBoundary: "midnight" });
    expect(pillarKo(r.day)).toBe("계유");
    expect(pillarKo(r.hour)).toBe("임자");
  });
});

describe("공개 유명인 — RM(김남준) 1994-09-12", () => {
  it("청월당 명식: 연 갑술 · 월 계유 · 일 신축 (시간 없음)", () => {
    // 출처: https://cheongwoldang.com/p/c/RM  (시주 공란, 양력 1994.9.12)
    const chart = computeChart({
      year: 1994,
      month: 9,
      day: 12,
      isLunar: false,
      gender: "m",
      hourId: "x",
      dayBoundary: "jasi",
    });
    expect(chart.pillars.year.korean).toBe("갑술");
    expect(chart.pillars.month.korean).toBe("계유");
    expect(chart.pillars.day.korean).toBe("신축");
    expect(chart.pillars.hour).toBe(null);
    expect(chart.dayMaster.stem).toBe("신");
    expect(chart.lunar.year).toBe(1994);
    expect(chart.lunar.month).toBe(8);
    expect(chart.lunar.day).toBe(7);
    expect(chart.pillars.year.stem.god).toBe("정재");
    expect(chart.pillars.year.branch.god).toBe("정인");
    expect(chart.pillars.month.stem.god).toBe("식신");
    expect(chart.pillars.month.branch.god).toBe("비견");
    expect(chart.pillars.day.branch.god).toBe("편인");
    expect(chart.elements).toMatchObject({ 목: 1, 화: 0, 토: 2, 금: 2, 수: 1 });
  });
});

describe("대운 순역", () => {
  it("양간 해 + 남성 = 순행 (1990 경오)", () => {
    const chart = computeChart({
      year: 1990,
      month: 5,
      day: 15,
      isLunar: false,
      gender: "m",
      hourId: "mi",
      dayBoundary: "jasi",
    });
    expect(chart.luck.forward).toBe(true);
    expect(chart.luck.pillars.length).toBeGreaterThanOrEqual(8);
    expect(chart.luck.pillars.length).toBeLessThanOrEqual(10);
  });

  it("양간 해 + 여성 = 역행", () => {
    const chart = computeChart({
      year: 1990,
      month: 5,
      day: 15,
      isLunar: false,
      gender: "f",
      hourId: "mi",
      dayBoundary: "jasi",
    });
    expect(chart.luck.forward).toBe(false);
  });
});

describe("음력 변환", () => {
  it("양력 1994-09-12 = 음력 1994-08-07 (BirthDB·청월당과 동일)", () => {
    const lunar = solarToLunar(1994, 9, 12);
    expect(lunar).toMatchObject({
      year: 1994,
      month: 8,
      day: 7,
      isLeapMonth: false,
    });
  });
});
