import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SHIPPING_RATES } from '../route';

/**
 * Helper to match state names flexibly
 */
function isStateMatch(rateStateStr: string, inputState: string): boolean {
  if (!rateStateStr || !inputState) return false;
  const cleanInput = inputState.trim().toLowerCase();
  
  // Quick aliases
  if (cleanInput === 'tn' && rateStateStr.toLowerCase().includes('tamil nadu')) return true;
  if (cleanInput === 'kl' && rateStateStr.toLowerCase().includes('kerala')) return true;
  if (cleanInput === 'ka' && rateStateStr.toLowerCase().includes('karnataka')) return true;
  if (cleanInput === 'ap' && rateStateStr.toLowerCase().includes('andhra')) return true;
  if (cleanInput === 'ts' && rateStateStr.toLowerCase().includes('telangana')) return true;
  if (cleanInput === 'mh' && rateStateStr.toLowerCase().includes('maharashtra')) return true;

  const statesList = rateStateStr.split(',').map(s => s.trim().toLowerCase());
  return statesList.some(s => s.includes(cleanInput) || cleanInput.includes(s));
}

/**
 * POST Calculate Shipping Rate for a given location (State, Pincode)
 * Path: POST /api/shipping-rates/calculate
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { state = '', pincode = '' } = body;

    const cleanState = typeof state === 'string' ? state.trim() : '';
    const cleanPincode = typeof pincode === 'string' ? pincode.replace(/\D/g, '') : '';
    const pinPrefix3 = cleanPincode.slice(0, 3);

    let rates: any[] = [];
    try {
      rates = await (prisma as any).shippingRate.findMany({
        where: { isActive: true },
      });
      if (!rates || rates.length === 0) {
        rates = DEFAULT_SHIPPING_RATES.filter(r => r.isActive);
      }
    } catch (dbErr) {
      console.warn('[Shipping Calculate DB Warning] Fallback default rates:', dbErr);
      rates = DEFAULT_SHIPPING_RATES.filter(r => r.isActive);
    }

    let matchedRate: any = null;

    // 1. Check Pincode Prefix Match (Highest Specificity)
    if (pinPrefix3 && pinPrefix3.length === 3) {
      matchedRate = rates.find(r => {
        if (!r.pincodePrefixes) return false;
        const prefixes = r.pincodePrefixes.split(',').map((p: string) => p.trim());
        return prefixes.includes(pinPrefix3);
      });
    }

    // 2. Check State Match
    if (!matchedRate && cleanState) {
      matchedRate = rates.find(r => isStateMatch(r.state, cleanState));
    }

    // 3. Fallback to default configured rate
    if (!matchedRate) {
      matchedRate = rates.find(r => r.isDefault);
    }

    // 4. Final safety fallback
    const deliveryFee = matchedRate ? Number(matchedRate.deliveryFee) : 49;
    const zoneName = matchedRate ? matchedRate.zoneName : 'Standard Pan-India Delivery';
    const estimatedDays = matchedRate?.estimatedDays || '2-4 Business Days';

    return NextResponse.json({
      success: true,
      deliveryFee,
      zoneName,
      estimatedDays,
      rateId: matchedRate?.id || null,
      location: {
        state: cleanState,
        pincode: cleanPincode,
      },
    });
  } catch (error: any) {
    console.error('[API Shipping Calculate Error]:', error);
    return NextResponse.json(
      {
        success: false,
        deliveryFee: 49,
        zoneName: 'Standard Pan-India Delivery',
        estimatedDays: '2-4 Business Days',
      },
      { status: 200 } // Graceful fallback
    );
  }
}
