export const PLANS = {
  free: {
    name: 'Free',
    limits: { firearms: 3, rangeSessions: false, documents: false, reports: false },
  },
  basic: {
    name: 'Basic',
    monthlyPriceId: 'price_1TlyIuIsj1k0hZpb7QfIpbI7',
    annualPriceId: 'price_1TlyJtIsj1k0hZpbBKmzqCd4',
    monthlyPrice: 4.99,
    annualPrice: 49.99,
    limits: { firearms: -1, rangeSessions: true, documents: true, reports: false },
  },
  pro: {
    name: 'Pro',
    monthlyPriceId: 'price_1TlyMPIsj1k0hZpbu6S6invn',
    annualPriceId: 'price_1TlyMfIsj1k0hZpbZ3UtkRps',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    limits: { firearms: -1, rangeSessions: true, documents: true, reports: true },
  },
}

export type PlanName = keyof typeof PLANS

export function getPlanFromPriceId(priceId: string): PlanName {
  if (priceId === PLANS.basic.monthlyPriceId || priceId === PLANS.basic.annualPriceId) return 'basic'
  if (priceId === PLANS.pro.monthlyPriceId || priceId === PLANS.pro.annualPriceId) return 'pro'
  return 'free'
}
