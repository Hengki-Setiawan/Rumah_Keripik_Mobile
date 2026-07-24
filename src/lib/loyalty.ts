import { apiFetch } from './api-client';

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  pointsBalance: number;
  tier: 'bronze' | 'silver' | 'gold';
  lifeTimePoints?: number;
}

export interface PointsHistoryEntry {
  id: string;
  delta: number;
  reason: string;
  relatedOrderId?: string;
  createdAt: string;
}

const TIER_THRESHOLDS: Record<string, number> = { bronze: 0, silver: 100000, gold: 500000 };

export function getTierProgress(balance: number, tier: string): { current: number; next: number; percent: number; nextTier: string } {
  const tiers = ['bronze', 'silver', 'gold'];
  const idx = tiers.indexOf(tier);
  if (idx >= tiers.length - 1) return { current: balance, next: balance, percent: 100, nextTier: tier };
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = TIER_THRESHOLDS[tiers[idx + 1]];
  const progress = balance - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current: progress, next: needed, percent: Math.min(100, Math.round((progress / needed) * 100)), nextTier: tiers[idx + 1] };
}

export async function getLoyaltyInfo(customerId: string) {
  return apiFetch<{ ok: boolean; account: LoyaltyAccount | null; pointsHistory: PointsHistoryEntry[] }>(
    `/api/loyalty/balance?customerId=${customerId}`
  );
}

export async function redeemPoints(customerId: string, points: number) {
  return apiFetch<{ ok: boolean; pointsUsed: number; reward: number }>('/api/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ customerId, points }),
  });
}

export async function useReferralCode(code: string) {
  return apiFetch<{ ok: boolean; bonus: number }>('/api/loyalty/referral/use', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
