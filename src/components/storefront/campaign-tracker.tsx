'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export function CampaignTracker() {
  const searchParams = useSearchParams();
  const { setCampaignId } = useCartStore();

  useEffect(() => {
    if (!searchParams) return;

    const campaign = searchParams.get('campaign') || searchParams.get('campaignId') || searchParams.get('utm_campaign') || searchParams.get('ref');
    if (campaign) {
      console.log(`[Attribution] Capturing Campaign ID from URL: "${campaign}"`);
      setCampaignId(campaign);
    }
  }, [searchParams, setCampaignId]);

  return null;
}
