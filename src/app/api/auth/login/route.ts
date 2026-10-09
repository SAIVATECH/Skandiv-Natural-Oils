import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, identifier, phone, password } = body;

    const rawLoginId = (identifier || email || phone || '').trim();

    if (!rawLoginId || !password) {
      return NextResponse.json(
        { success: false, error: 'Email or WhatsApp phone number and password are required.' },
        { status: 400 }
      );
    }

    const cleanDigits = rawLoginId.replace(/\D/g, '');
    const isEmail = rawLoginId.includes('@');
    const normalizedEmail = isEmail ? rawLoginId.toLowerCase() : null;

    let normalizedPhone = cleanDigits;
    if (cleanDigits.length === 10) {
      normalizedPhone = `91${cleanDigits}`;
    }

    // Query the database for the matching user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ...(cleanDigits.length >= 10
            ? [
                { whatsappNumber: normalizedPhone },
                { whatsappNumber: cleanDigits },
                { whatsappNumber: `+91${cleanDigits.slice(-10)}` },
              ]
            : []),
          { whatsappNumber: rawLoginId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with these credentials. Please check or sign up.' },
        { status: 401 }
      );
    }

    if (!user.password || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please try again.' },
        { status: 401 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || (user.role === 'ADMIN' ? 'Store Administrator' : 'Customer'),
        role: user.role,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        createdAt: user.createdAt,
      },
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/account',
    });

  } catch (error: any) {
    console.error('[Auth Login API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An internal server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
