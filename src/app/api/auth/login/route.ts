import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query the database for the active admin user matching email and password
    const admin = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        role: 'ADMIN',
      },
    });

    if (!admin || admin.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials. Please try again.' },
        { status: 401 }
      );
    }

    // Success response: return success status and admin profile details
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name || 'Store Administrator',
        role: admin.role,
        email: admin.email,
      },
    });

  } catch (error: any) {
    console.error('[Auth API Error] Failed during login authentication:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
