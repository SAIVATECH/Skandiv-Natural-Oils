import { NextResponse } from 'next/server';
import { getSimulatorLogs } from '@/lib/simulator-store';

/**
 * GET Customer message logs (conversation history)
 * Path: GET /api/chat?phone=[phone_number]
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return new NextResponse('Phone number is required', { status: 400 });
    }

    const logs = await getSimulatorLogs(phone);
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('[API Chat GET Error]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
