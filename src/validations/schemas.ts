import { z } from 'zod';

// Product Creation/Editing Validation Schema
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive('Price must be a positive number')
  ),
  mrp: z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? null : parsed;
    },
    z.number().positive('MRP must be a positive number').nullable().optional()
  ),
  stock: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().nonnegative('Stock must be a non-negative integer')
  ),
  imageUrl: z.string().url('Image must be a valid URL').or(z.literal('')).default(''),
  category: z.string().min(2, 'Category must be at least 2 characters long'),
  isActive: z.boolean().default(true),
});

// Order Status Modification Schema
export const orderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  trackingUrl: z.string().url('Tracking URL must be valid').optional().or(z.literal('')),
});

// WhatsApp Send API Validation Schema
export const sendWhatsAppSchema = z.object({
  to: z.string().min(10, 'Recipient number must be valid'),
  message: z.string().min(1, 'Message cannot be empty'),
});
