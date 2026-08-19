import { grantPurchase, isEntitled, isKnownPlan } from "./billing.js";

export const PROFILE_KEY = "wonguk.profile.v1";
export const BILLING_KEY = "wonguk.billing.v1";

function ls() {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* private mode */
  }
  return null;
}

export function parseProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = Number(raw.day);
  if (!year || !month || !day) return null;
  return {
    name: String(raw.name || ""),
    gender: raw.gender === "f" ? "f" : "m",
    isLunar: Boolean(raw.isLunar),
    isLeapMonth: Boolean(raw.isLeapMonth),
    year,
    month,
    day,
    hourId: raw.hourId || "x",
    dayBoundary: raw.dayBoundary === "midnight" ? "midnight" : "jasi",
  };
}

export function parseBilling(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!isKnownPlan(raw.plan)) return null;
  return {
    plan: raw.plan,
    purchasedAt: Number(raw.purchasedAt) || 0,
    expiresAt: raw.expiresAt == null ? null : Number(raw.expiresAt),
    mock: Boolean(raw.mock),
  };
}

export function loadProfile() {
  const store = ls();
  if (!store) return null;
  try {
    return parseProfile(JSON.parse(store.getItem(PROFILE_KEY) || "null"));
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  const store = ls();
  if (!store) return;
  store.setItem(PROFILE_KEY, JSON.stringify(parseProfile(profile)));
}

export function clearProfile() {
  const store = ls();
  if (store) store.removeItem(PROFILE_KEY);
}

export function loadBilling() {
  const store = ls();
  if (!store) return null;
  try {
    return parseBilling(JSON.parse(store.getItem(BILLING_KEY) || "null"));
  } catch {
    return null;
  }
}

export function saveBilling(billing) {
  const store = ls();
  if (!store) return;
  store.setItem(BILLING_KEY, JSON.stringify(billing));
}

export function clearBilling() {
  const store = ls();
  if (store) store.removeItem(BILLING_KEY);
}

export function applyMockPurchase(plan, now = new Date()) {
  const billing = grantPurchase(plan, now);
  saveBilling(billing);
  return billing;
}

export function reportsUnlocked(now = new Date()) {
  return isEntitled(loadBilling(), now);
}
