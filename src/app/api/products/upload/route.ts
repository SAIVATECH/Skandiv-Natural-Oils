import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/products/upload
 * Handles local file upload for product images.
 * Validates file type and size, then stores it in the local public/uploads directory.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Secure Image Validation: Allow JPEG, PNG, WEBP, and GIF only
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Size limit: 5MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: 'File size too large. Upload limit is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Secure target directory configuration inside public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique name to prevent collisions
    const ext = path.extname(file.name) || '.jpg';
    const uniqueName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Save file locally
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
    });
  } catch (error: any) {
    console.error('[API Products Upload Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload product image.' },
      { status: 500 }
    );
  }
}
