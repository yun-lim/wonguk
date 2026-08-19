/** Web-only SKUs. Real Toss/Stripe is a stub — no keys, no network. */

export const PRODUCT_IDS = {
  once: "wonguk_once",
  monthly: "wonguk_monthly",
};

export const PRODUCTS = [
  {
    id: "wonguk_once",
    title: "한 번",
    subtitle: "리포트 전체 · 이 브라우저에 영구 해제",
    price: "₩990",
    priceNum: 990,
    period: "한 번",
  },
  {
    id: "wonguk_monthly",
    title: "한 달",
    subtitle: "리포트 전체 · 30일 (만료일 후 다시 해제)",
    price: "₩9,900",
    priceNum: 9900,
    period: "/월",
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export function isKnownPlan(id) {
  return id === "wonguk_once" || id === "wonguk_monthly";
}

/**
 * Grant entitlement for a plan.
 * once → no expiry. monthly → +30 days from `now`.
 */
export function grantPurchase(plan, now = new Date()) {
  if (!isKnownPlan(plan)) throw new Error("알 수 없는 상품입니다.");
  const purchasedAt = now.getTime();
  if (plan === "wonguk_once") {
    return { plan, purchasedAt, expiresAt: null, mock: true };
  }
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 30);
  return { plan, purchasedAt, expiresAt: expires.getTime(), mock: true };
}

export function isEntitled(billing, now = new Date()) {
  if (!billing || !billing.plan) return false;
  if (billing.plan === "wonguk_once") return true;
  if (billing.plan === "wonguk_monthly") {
    return typeof billing.expiresAt === "number" && now.getTime() < billing.expiresAt;
  }
  return false;
}

export function daysLeft(billing, now = new Date()) {
  if (!billing || billing.plan !== "wonguk_monthly" || !billing.expiresAt) return null;
  const ms = billing.expiresAt - now.getTime();
  return Math.ceil(ms / 86400000);
}

export function formatExpiry(billing) {
  if (!billing) return "";
  if (billing.plan === "wonguk_once") return "이 브라우저 · 영구";
  if (billing.plan === "wonguk_monthly" && billing.expiresAt) {
    const d = new Date(billing.expiresAt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `만료 ${y}. ${m}. ${day}.`;
  }
  return "";
}

/**
 * 실결제 자리. 토스페이먼츠 / Stripe Checkout 을 붙일 때 여기만 채운다.
 * API 키를 코드에 넣지 말 것. AdSense 넣지 말 것.
 *
 * // toss: await tossPayments.requestPayment({ amount: product.priceNum, orderId })
 * // stripe: await stripe.redirectToCheckout({ lineItems, mode })
 */
export async function startRealCheckout(_planId) {
  throw new Error("실결제는 아직 연결되지 않았습니다. 개발용 해제를 쓰세요.");
}

export class MockStore {
  async purchase(planId, now = new Date()) {
    return { ok: true, mock: true, billing: grantPurchase(planId, now) };
  }
}

export class RealStore {
  async purchase(planId) {
    return startRealCheckout(planId);
  }
}
