import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // Product ID
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  category: string;
  stock: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  campaignId: string | null;
  couponCode: string | null;
  discountAmount: number;

  // Actions
  addItem: (product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    mrp?: number | string | null;
    imageUrl: string;
    category: string;
    stock: number;
  }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  setCampaignId: (id: string | null) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Computed Helpers
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
  getTotalSavings: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      campaignId: null,
      couponCode: null,
      discountAmount: 0,

      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(item => item.id === product.id);
        const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
        const mrpNum = product.mrp ? (typeof product.mrp === 'string' ? parseFloat(product.mrp) : Number(product.mrp)) : undefined;

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = Math.min(updatedItems[existingIndex].quantity + quantity, product.stock);
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: newQty,
            stock: product.stock,
            price: priceNum,
            mrp: mrpNum,
          };
          set({ items: updatedItems, isCartOpen: true });
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: priceNum,
            mrp: mrpNum,
            imageUrl: product.imageUrl,
            category: product.category,
            stock: product.stock,
            quantity: Math.min(quantity, Math.max(product.stock, 1)),
          };
          set({ items: [...currentItems, newItem], isCartOpen: true });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = get().items.map(item => {
          if (item.id === productId) {
            const cappedQty = Math.min(quantity, item.stock);
            return { ...item, quantity: cappedQty };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountAmount: 0 });
      },

      setCartOpen: (open: boolean) => {
        set({ isCartOpen: open });
      },

      toggleCart: () => {
        set({ isCartOpen: !get().isCartOpen });
      },

      setCampaignId: (id: string | null) => {
        if (id) {
          set({ campaignId: id });
        }
      },

      applyCoupon: async (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        const subtotal = get().getSubtotal();

        try {
          const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: cleanCode, subtotal }),
          });

          const data = await res.json();
          if (res.ok && data.valid) {
            set({ couponCode: cleanCode, discountAmount: data.discount });
            return { success: true, message: data.message || `Coupon ${cleanCode} applied!` };
          } else {
            return { success: false, message: data.message || 'Invalid or expired coupon code' };
          }
        } catch (err) {
          // Fallback static rules
          if (cleanCode === 'SKANDIV10' || cleanCode === 'WELCOME10') {
            const discount = Math.round(subtotal * 0.1);
            set({ couponCode: cleanCode, discountAmount: discount });
            return { success: true, message: 'Coupon applied! 10% discount added.' };
          } else if (cleanCode === 'ORGANIC50' && subtotal >= 500) {
            set({ couponCode: cleanCode, discountAmount: 50 });
            return { success: true, message: 'Coupon applied! ₹50 off your order.' };
          }
          return { success: false, message: 'Invalid or expired coupon code' };
        }
      },

      removeCoupon: () => {
        set({ couponCode: null, discountAmount: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        return get().discountAmount;
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        // Standard delivery fee (free delivery option removed)
        return 49;
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },

      getTotalSavings: () => {
        const mrpSavings = get().items.reduce((sum, item) => {
          if (item.mrp && item.mrp > item.price) {
            return sum + (item.mrp - item.price) * item.quantity;
          }
          return sum;
        }, 0);
        return mrpSavings + get().getDiscount();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'skandiv_cart_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        items: state.items,
        campaignId: state.campaignId,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
      }),
    }
  )
);
