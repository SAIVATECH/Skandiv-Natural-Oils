import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp?: number | null;
  stock: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingUrl: string | null;
  razorpayPaymentId: string | null;
  shippingAddress: string | null;
  createdAt: string;
  user: {
    name: string | null;
    whatsappNumber: string;
  };
  items: OrderItem[];
}

interface Customer {
  id: string;
  name: string;
  whatsappNumber: string;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  conversationStep: string;
  conversationUpdatedAt: string | null;
}

interface AnalyticsData {
  cards: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
    repeatCustomerRate: number;
  };
  salesTrend: Array<{ date: string; revenue: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

interface AdminState {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  analytics: AnalyticsData | null;
  
  loadingProducts: boolean;
  loadingOrders: boolean;
  loadingCustomers: boolean;
  loadingAnalytics: boolean;

  fetchProducts: (search?: string) => Promise<void>;
  fetchOrders: (search?: string) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<{ success: boolean; errors?: any }>;
  updateProduct: (id: string, product: Omit<Product, 'id' | 'createdAt'>) => Promise<{ success: boolean; errors?: any }>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  addCustomer: (customer: { name: string; whatsappNumber: string }) => Promise<{ success: boolean; errors?: any }>;
  updateCustomer: (id: string, customer: { name: string; whatsappNumber: string }) => Promise<{ success: boolean; errors?: any }>;

  updateOrderStatus: (id: string, data: { orderStatus: string; paymentStatus: string; trackingUrl?: string }) => Promise<boolean>;
  sendWhatsAppMessage: (to: string, message: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  customers: [],
  analytics: null,

  loadingProducts: false,
  loadingOrders: false,
  loadingCustomers: false,
  loadingAnalytics: false,

  fetchProducts: async (search) => {
    set({ loadingProducts: true });
    try {
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        set({ products: data });
      }
    } catch (err) {
      console.error('Zustand: Failed to fetch products', err);
    } finally {
      set({ loadingProducts: false });
    }
  },

  fetchOrders: async (search) => {
    set({ loadingOrders: true });
    try {
      const url = search ? `/api/orders?search=${encodeURIComponent(search)}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        set({ orders: data });
      }
    } catch (err) {
      console.error('Zustand: Failed to fetch orders', err);
    } finally {
      set({ loadingOrders: false });
    }
  },

  fetchCustomers: async () => {
    set({ loadingCustomers: true });
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        set({ customers: data });
      }
    } catch (err) {
      console.error('Zustand: Failed to fetch customers', err);
    } finally {
      set({ loadingCustomers: false });
    }
  },

  fetchAnalytics: async () => {
    set({ loadingAnalytics: true });
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        set({ analytics: data });
      }
    } catch (err) {
      console.error('Zustand: Failed to fetch analytics', err);
    } finally {
      set({ loadingAnalytics: false });
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { errors: { global: [text || 'Internal server error occurred'] } };
      }

      if (res.ok) {
        // Refetch products list
        get().fetchProducts();
        return { success: true };
      }
      return { success: false, errors: data.errors || data };
    } catch (err) {
      console.error('Zustand: Failed to add product', err);
      return { success: false, errors: { global: ['Something went wrong'] } };
    }
  },

  updateProduct: async (id, product) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { errors: { global: [text || 'Internal server error occurred'] } };
      }

      if (res.ok) {
        // Refetch products list
        get().fetchProducts();
        return { success: true };
      }
      return { success: false, errors: data.errors || data };
    } catch (err) {
      console.error('Zustand: Failed to update product', err);
      return { success: false, errors: { global: ['Something went wrong'] } };
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        get().fetchProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Zustand: Failed to delete product', err);
      return false;
    }
  },

  deleteOrder: async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        get().fetchOrders();
        get().fetchAnalytics();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Zustand: Failed to delete order', err);
      return false;
    }
  },

  updateOrderStatus: async (id, data) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        get().fetchOrders();
        // Also refresh analytics/customers because statuses changed
        get().fetchAnalytics();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Zustand: Failed to update order status', err);
      return false;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        get().fetchCustomers();
        get().fetchAnalytics();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Zustand: Failed to delete customer', err);
      return false;
    }
  },

  addCustomer: async (customer) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { errors: { global: [text || 'Internal server error occurred'] } };
      }

      if (res.ok) {
        get().fetchCustomers();
        return { success: true };
      }
      return { success: false, errors: data.errors || data };
    } catch (err) {
      console.error('Zustand: Failed to add customer', err);
      return { success: false, errors: { global: ['Something went wrong'] } };
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { errors: { global: [text || 'Internal server error occurred'] } };
      }

      if (res.ok) {
        get().fetchCustomers();
        return { success: true };
      }
      return { success: false, errors: data.errors || data };
    } catch (err) {
      console.error('Zustand: Failed to update customer', err);
      return { success: false, errors: { global: ['Something went wrong'] } };
    }
  },

  sendWhatsAppMessage: async (to, message) => {
    try {
      const res = await fetch('/api/send-whatsapp-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      return res.ok;
    } catch (err) {
      console.error('Zustand: Failed to send manual WhatsApp message', err);
      return false;
    }
  },
}));
