'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import {
  Search,
  Receipt,
  Eye,
  Edit,
  Loader2,
  Calendar,
  ExternalLink,
  ChevronDown,
  X,
  ShieldCheck,
  Package,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface OrderEditForm {
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  trackingUrl: string;
}

export default function AdminOrdersPage() {
  const {
    orders,
    loadingOrders,
    fetchOrders,
    updateOrderStatus,
    deleteOrder
  } = useAdminStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Edit Form State
  const [form, setForm] = useState<OrderEditForm>({
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    trackingUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders(search);
  }, [fetchOrders, search]);

  const handleOpenEdit = (order: any) => {
    setSelectedOrder(order);
    setForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingUrl: order.trackingUrl || '',
    });
    setModalOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this order? All payment history and order items will be deleted.')) {
      setSubmitting(true);
      const success = await deleteOrder(id);
      if (success) {
        setModalOpen(false);
        setSelectedOrder(null);
      } else {
        alert('Failed to delete order. Please try again.');
      }
      setSubmitting(false);
    }
  };

  const handleDownloadExcel = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer WhatsApp',
      'Items Purchased',
      'Payment Status',
      'Shipment Status',
      'Shipping Address',
      'Total Amount (INR)'
    ];

    const rows = filteredOrders.map(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN');
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.product.name}`).join(' | ');
      const addressStr = o.shippingAddress || '';
      return [
        `#${o.id.substring(0, 8).toUpperCase()}`,
        dateStr,
        o.user.name || 'WhatsApp Buyer',
        o.user.whatsappNumber,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.paymentStatus,
        o.orderStatus,
        `"${addressStr.replace(/"/g, '""')}"`,
        o.totalAmount
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);

    const success = await updateOrderStatus(selectedOrder.id, {
      orderStatus: form.orderStatus,
      paymentStatus: form.paymentStatus,
      trackingUrl: form.trackingUrl,
    });

    if (success) {
      setModalOpen(false);
      setSelectedOrder(null);
    } else {
      alert('Failed to update order. Please check your details.');
    }
    setSubmitting(false);
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'REFUNDED':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  // Filter orders on client side to match category/filters
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* 1. FILTER CONTROLS BAR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-900">
          
          {/* Left: Search input */}
          <div className="relative w-full xl:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search order ID, buyer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-10 pr-4 text-slate-100 text-xs outline-none transition-colors"
            />
          </div>

          {/* Right: Quick filter drops */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Order status dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-400">
              <span>Order:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-100 font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Payment status dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-400">
              <span>Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent text-slate-100 font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            {/* Export Report to Excel */}
            <button
              onClick={handleDownloadExcel}
              className="h-8.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-extrabold px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] text-xs hover:scale-[1.01]"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export to Excel</span>
            </button>

          </div>
        </div>

        {/* 2. TRANSACTIONS TABLE */}
        {loadingOrders ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-500 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">No Orders Found</h4>
              <p className="text-xs text-slate-400">No transactions match your current query or filters.</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-850 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-850 bg-slate-900/40">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">WhatsApp Customer</th>
                    <th className="p-4">Items / Details</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/10 transition-colors">
                      {/* ID */}
                      <td className="p-4 font-mono font-bold text-slate-300">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 text-slate-400 font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-bold text-slate-100 leading-tight">{order.user.name || 'WhatsApp Buyer'}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{order.user.whatsappNumber}</span>
                      </td>

                      {/* Item Details */}
                      <td className="p-4 max-w-[200px]">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-1.5 truncate">
                            <span className="text-[10px] bg-slate-850 text-slate-400 font-extrabold px-1.5 py-0.5 rounded border border-slate-800">
                              {item.quantity}x
                            </span>
                            <span className="text-slate-300 truncate font-semibold">{item.product.name}</span>
                          </div>
                        ))}
                      </td>

                      {/* Payment tag */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Order status tag */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 text-right font-black text-slate-100 text-sm">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </td>

                      {/* Modify Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-slate-950 border border-slate-850 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-xl transition-all active:scale-90"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DYNAMIC STATUS EDIT DIALOG */}
        {modalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Glass Overlay */}
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => { setModalOpen(false); setSelectedOrder(null); }}
            />

            {/* Modal Body Card */}
            <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 z-10 animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm leading-none">Modify Order Status</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">#{selectedOrder.id.substring(0, 16).toUpperCase()}...</span>
                  </div>
                </div>
                <button
                  onClick={() => { setModalOpen(false); setSelectedOrder(null); }}
                  className="w-8 h-8 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Info Card */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">👤 Customer Details</span>
                  <div className="space-y-1">
                    <p><span className="text-slate-500">Name:</span> <strong className="text-slate-200">{selectedOrder.user?.name || 'WhatsApp Buyer'}</strong></p>
                    <p><span className="text-slate-500">WhatsApp:</span> <strong className="text-slate-200 font-mono">+{selectedOrder.user?.whatsappNumber}</strong></p>
                    {selectedOrder.user?.email && (
                      <p><span className="text-slate-500">Email:</span> <strong className="text-slate-200">{selectedOrder.user.email}</strong></p>
                    )}
                  </div>
                  
                  {selectedOrder.shippingAddress ? (
                    <div className="pt-2 border-t border-slate-850 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">🚚 Shipping Address</span>
                      <p className="text-slate-200 leading-relaxed font-semibold whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-850 mt-1 text-slate-550 italic">
                      No shipping address provided.
                    </div>
                  )}
                </div>

                {/* 1. Order Status Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Shipment / Order Status</label>
                  <select
                    value={form.orderStatus}
                    onChange={(e: any) => setForm((prev) => ({ ...prev, orderStatus: e.target.value }))}
                    className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING (Awaiting Checkout)</option>
                    <option value="PROCESSING">PROCESSING (Preparing in warehouse)</option>
                    <option value="SHIPPED">SHIPPED (Enroute to customer)</option>
                    <option value="DELIVERED">DELIVERED (Handed over)</option>
                    <option value="CANCELLED">CANCELLED (Void / Rejected)</option>
                  </select>
                  <span className="text-[9px] text-slate-500 font-medium italic block">
                    Note: Changing this automatically triggers Meta WhatsApp to send status alerts.
                  </span>
                </div>

                {/* 2. Payment Status Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e: any) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 text-xs outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                {/* 3. Tracking Link URL Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Shipment Tracking URL</label>
                  <input
                    type="url"
                    value={form.trackingUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
                    className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 text-xs outline-none"
                    placeholder="e.g. https://shipment.com/track/1234"
                  />
                  <span className="text-[9px] text-slate-500 font-medium italic block">
                    Binds to customer checkout confirmation notifications when order status is marked as SHIPPED.
                  </span>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  {/* Destructive Action (Left) */}
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="h-11 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold px-4 rounded-xl text-xs flex items-center space-x-2 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Order</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => { setModalOpen(false); setSelectedOrder(null); }}
                      className="h-11 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100 font-bold px-4 rounded-xl text-xs active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-11 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black px-6 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Save Updates</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
