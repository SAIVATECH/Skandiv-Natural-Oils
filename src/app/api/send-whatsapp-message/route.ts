import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { sendWhatsAppSchema } from '@/validations/schemas';

/**
 * POST Send a manual WhatsApp message to a customer
 * Path: POST /api/send-whatsapp-message
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const validatedData = sendWhatsAppSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { to, message } = validatedData.data;

    // Send WhatsApp Message via Meta Graph API
    const response = await sendWhatsAppMessage(to, message);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('[API Send WhatsApp POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
