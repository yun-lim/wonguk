import { describe, it, expect } from "vitest";
import { computeChart } from "../src/engine.js";
import { buildReport, REPORT_META } from "../src/reports.js";
import {
  PRODUCTS,
  MockStore,
  RealStore,
  grantPurchase,
  isEntitled,
  daysLeft,
  startRealCheckout,
} from "../src/billing.js";
import { parseProfile, parseBilling } from "../src/storage.js";

const rm = {
  year: 1994,
  month: 9,
  day: 12,
  isLunar: false,
  gender: "m",
  hourId: "x",
  dayBoundary: "jasi",
};

describe("paid reports", () => {
  const chart = computeChart(rm);

  it("builds several paragraphs for each theme", () => {
    for (const id of ["year", "love", "wealth"]) {
      const report = buildReport(id, chart, new Date("2026-08-19T00:00:00+09:00"));
      expect(report.sections.length).toBeGreaterThanOrEqual(3);
      for (const s of report.sections) {
        expect(s.body.length).toBeGreaterThan(80);
      }
    }
    expect(REPORT_META.year.title).toBe("신년");
  });

  it("mentions the day master in the new-year report", () => {
    const year = buildReport("year", chart, new Date("2026-08-19T00:00:00+09:00"));
    expect(year.lede).toContain("신");
  });
});

describe("billing", () => {
  it("has exactly two web plans", () => {
    expect(PRODUCTS.map((p) => p.id)).toEqual(["wonguk_once", "wonguk_monthly"]);
    expect(PRODUCTS.map((p) => p.priceNum)).toEqual([990, 9900]);
  });

  it("once never expires", () => {
    const now = new Date("2026-08-19T00:00:00+09:00");
    const b = grantPurchase("wonguk_once", now);
    expect(b.expiresAt).toBe(null);
    expect(isEntitled(b, now)).toBe(true);
    expect(isEntitled(b, new Date("2030-01-01"))).toBe(true);
  });

  it("monthly lasts 30 days", () => {
    const now = new Date("2026-08-19T00:00:00+09:00");
    const b = grantPurchase("wonguk_monthly", now);
    expect(isEntitled(b, now)).toBe(true);
    expect(daysLeft(b, now)).toBe(30);
    expect(isEntitled(b, new Date("2026-09-17T00:00:00+09:00"))).toBe(true);
    expect(isEntitled(b, new Date("2026-09-19T00:00:00+09:00"))).toBe(false);
  });

  it("mock store unlocks immediately", async () => {
    const store = new MockStore();
    const r = await store.purchase("wonguk_once");
    expect(r.ok).toBe(true);
    expect(r.mock).toBe(true);
    expect(r.billing.plan).toBe("wonguk_once");
  });

  it("real checkout is a stub", async () => {
    await expect(startRealCheckout("wonguk_once")).rejects.toThrow("실결제");
    const store = new RealStore();
    await expect(store.purchase("wonguk_monthly")).rejects.toThrow("실결제");
  });
});

describe("storage parse", () => {
  it("accepts a profile", () => {
    const p = parseProfile({ year: 1994, month: 9, day: 12, gender: "f", hourId: "mi" });
    expect(p.gender).toBe("f");
    expect(p.hourId).toBe("mi");
    expect(parseProfile({})).toBe(null);
  });

  it("rejects unknown plans", () => {
    expect(parseBilling({ plan: "wonguk_once", purchasedAt: 1, expiresAt: null })).toMatchObject({
      plan: "wonguk_once",
    });
    expect(parseBilling({ plan: "wonguk_reports_all" })).toBe(null);
  });
});

import { homeTiles, HOME_TILES, renderWings, LIVE_URL } from "../src/ui.js";

describe("home tiles", () => {
  it("exposes nine services", () => {
    expect(HOME_TILES).toHaveLength(9);
  });

  it("wires empty-state tiles to real routes", () => {
    const tiles = homeTiles({ hasProfile: false, unlocked: false });
    expect(tiles.map((x) => x.href)).toEqual([
      "/input",
      "/reports/year",
      "/reports/love",
      "/reports/wealth",
      "/manse",
      "/pay",
      "/method",
      "/settings",
      "/terms",
    ]);
    expect(tiles[1].lock).toBe(true);
    expect(tiles[2].lock).toBe(true);
    expect(tiles[3].lock).toBe(true);
  });

  it("sends saved 내 사주 to the dashboard and unlocks paid tiles", () => {
    const tiles = homeTiles({ hasProfile: true, unlocked: true });
    expect(tiles[0].href).toBe("/dashboard");
    expect(tiles[1].lock).toBe(false);
  });
});


describe("desktop wings", () => {
  const html = renderWings();

  it("brands as 사주봄 with honest selling points", () => {
    expect(LIVE_URL).toBe("https://yun-lim.github.io/wonguk/");
    expect(html).toContain("사주봄");
    expect(html).toContain("매일 열어보는 사주");
    expect(html).toContain("내 사주를 쉽게.");
    expect(html).toContain("절입 기준 명식");
    expect(html).toContain("가입 없이 이 기기에 저장");
    expect(html).toContain("₩990");
    expect(html).toContain("₩9,900");
    expect(html).toContain("/method");
    expect(html).toContain("mailto:limdg01@gmail.com");
    expect(html).toContain("qr.svg");
    expect(html).toContain("폰으로 편하게 보세요");
    expect(html).toContain("홈 화면에 추가");
    expect(html).toContain("앱 스토어 출시 준비중");
    expect(html).toContain("주소 복사");
  });

  it("does not copy 점신 phrases or store badges", () => {
    expect(html).not.toContain("큐레이터");
    expect(html).not.toContain("맞춤 운세");
    expect(html).not.toContain("상담사");
    expect(html).not.toContain("제휴");
    expect(html).not.toMatch(/App Store|Google Play|Play 스토어/);
  });
});
