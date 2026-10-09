import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, whatsappNumber, email, password, address, city, pincode } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!whatsappNumber || !whatsappNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp phone number is required.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Clean and normalize phone number
    const cleanDigits = whatsappNumber.replace(/\D/g, '');
    let normalizedPhone = cleanDigits;
    if (cleanDigits.length === 10) {
      normalizedPhone = `91${cleanDigits}`;
    }

    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // Check if a user with this WhatsApp number already exists
    const existingByPhone = await prisma.user.findFirst({
      where: {
        OR: [
          { whatsappNumber: normalizedPhone },
          { whatsappNumber: cleanDigits },
          ...(cleanDigits.length === 10 ? [{ whatsappNumber: `+91${cleanDigits}` }] : [])
        ]
      }
    });

    // Check if a user with this email already exists
    let existingByEmail = null;
    if (normalizedEmail) {
      existingByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    }

    if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already belongs to a different phone number.' },
        { status: 409 }
      );
    }

    let user;

    if (existingByPhone) {
      // If user exists and already has a password set
      if (existingByPhone.password) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this WhatsApp number already exists. Please log in instead.'
          },
          { status: 409 }
        );
      }

      // If user was created by previous guest order/WhatsApp webhook, update profile & activate password
      user = await prisma.user.update({
        where: { id: existingByPhone.id },
        data: {
          name: name.trim(),
          email: normalizedEmail || existingByPhone.email,
          password: password,
          role: existingByPhone.role || 'CUSTOMER',
        }
      });
    } else if (existingByEmail) {
      if (existingByEmail.password) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email address already exists. Please log in instead.'
          },
          { status: 409 }
        );
      }

      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          name: name.trim(),
          whatsappNumber: normalizedPhone,
          password: password,
          role: existingByEmail.role || 'CUSTOMER',
        }
      });
    } else {
      // Create new customer
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          whatsappNumber: normalizedPhone,
          email: normalizedEmail,
          password: password,
          role: 'CUSTOMER',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user.id,
        name: user.name || name.trim(),
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        role: user.role,
        createdAt: user.createdAt,
      }
    });

  } catch (error: any) {
    console.error('[Signup API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
