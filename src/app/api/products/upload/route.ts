import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { createServiceClient, isValidJwt, sanitizeUrl } from '@/lib/supabase';

/**
 * POST /api/products/upload
 * Handles file upload for product images.
 * Primary: Uploads to Supabase Cloud Storage (Bucket: 'product-images') if service keys are configured.
 * Fallback: Stores locally in public/uploads directory (for offline local development).
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

    // Generate unique name to prevent collisions
    const ext = path.extname(file.name) || '.jpg';
    const uniqueName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;

    // Check if Supabase Service Role Key is available and valid to use cloud storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasValidSupabaseSecrets = !!sanitizeUrl(supabaseUrl) && isValidJwt(serviceRoleKey);

    if (hasValidSupabaseSecrets) {
      console.log('[Upload API] Valid Supabase secrets configured. Initiating Cloud Storage upload...');
      const supabase = createServiceClient();
      
      // Upload the file to Supabase Storage bucket 'product-images'
      let uploadResult = await supabase.storage
        .from('product-images')
        .upload(uniqueName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      // If upload fails due to missing bucket (e.g. first-time setup), try to create it programmatically
      if (uploadResult.error && (uploadResult.error.message.includes('Bucket not found') || (uploadResult.error as any).status === 404)) {
        console.log('[Upload API] Bucket "product-images" not found. Creating bucket programmatically...');
        const { error: createError } = await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: maxBytes,
          allowedMimeTypes: validMimeTypes
        });

        if (!createError) {
          console.log('[Upload API] Bucket "product-images" created successfully. Retrying upload...');
          uploadResult = await supabase.storage
            .from('product-images')
            .upload(uniqueName, buffer, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: false
            });
        } else {
          console.error('[Upload API] Failed to create Supabase storage bucket:', createError);
          throw new Error('Supabase Storage bucket "product-images" could not be created. Please create it manually in your Supabase Console.');
        }
      }

      if (uploadResult.error) {
        console.error('[Upload API] Supabase upload failed:', uploadResult.error);
        throw new Error(`Cloud storage upload failed: ${uploadResult.error.message}`);
      }

      // Retrieve the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(uniqueName);

      console.log(`[Upload API] Cloud upload success! Public URL: ${publicUrl}`);

      return NextResponse.json({
        success: true,
        url: publicUrl,
      });
    }

    // Serverless (Vercel) Environment Guard:
    // If we are on Vercel but do not have valid Supabase keys configured, we MUST throw an error
    // because local disk storage is read-only in serverless functions and will crash with EROFS.
    if (process.env.VERCEL === '1') {
      console.error('[Upload API] Supabase service role key is missing or invalid in serverless environment.');
      throw new Error(
        'Supabase Cloud Storage is not correctly configured. ' +
        'In production (Vercel), you must configure NEXT_PUBLIC_SUPABASE_URL and a valid, non-placeholder SUPABASE_SERVICE_ROLE_KEY (starts with "eyJ"). ' +
        'Local file storage fallback is not supported in serverless functions (Read-Only File System).'
      );
    }

    // Local Fallback (for offline local development only)
    console.log('[Upload API] Supabase credentials missing or invalid. Falling back to local disk storage for development...');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueName);
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

