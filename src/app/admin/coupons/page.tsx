'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  IndianRupee,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number | string;
  minOrderAmount: number | string;
  maxDiscount: number | string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(0);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (res.ok) {
        setCoupons(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data.error || 'Failed to fetch coupons');
      }
    } catch (err: any) {
      console.error('Error loading coupons:', err);
      setError(err.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim()) {
      setFormError('Please enter a valid coupon code.');
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      setFormError('Please enter a valid discount value greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          isActive,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      setIsModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      setFormError(err.message || 'Could not save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const updatedStatus = !coupon.isActive;
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });

      if (res.ok) {
        setCoupons(coupons.map(c => (c.id === coupon.id ? { ...c, isActive: updatedStatus } : c)));
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setMaxDiscount('');
    setExpiresAt('');
    setIsActive(true);
    setFormError(null);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <Tag className="w-6 h-6 text-amber-500" />
              <span>Coupon &amp; Discount Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create and manage promo discount codes for customer checkout on the website and WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Coupon</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Coupons</span>
            <p className="text-2xl font-black text-slate-100 font-mono">{coupons.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Coupons</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {coupons.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Standard Delivery Fee</span>
            <p className="text-2xl font-black text-amber-400 font-mono">₹49 (Fixed)</p>
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading coupons...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No coupons created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first promotional discount code (e.g. SKANDIV10 for 10% off) to increase store sales.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3.5 px-6">Coupon Code</th>
                    <th className="py-3.5 px-4">Discount</th>
                    <th className="py-3.5 px-4">Min. Cart Value</th>
                    <th className="py-3.5 px-4">Max Cap</th>
                    <th className="py-3.5 px-4">Expiry</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {coupons.map((coupon) => {
                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-850/40 transition-colors">
                        {/* Code & Description */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-mono font-black text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg inline-block">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{coupon.description}</p>
                            )}
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="py-4 px-4 font-bold text-slate-200">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <span className="flex items-center gap-1">
                              <span>{Number(coupon.discountValue)}% OFF</span>
                            </span>
                          ) : (
                            <span>₹{Number(coupon.discountValue)} OFF</span>
                          )}
                        </td>

                        {/* Min Cart Value */}
                        <td className="py-4 px-4 font-mono text-slate-300">
                          {Number(coupon.minOrderAmount) > 0 ? `₹${Number(coupon.minOrderAmount)}` : 'None (₹0)'}
                        </td>

                        {/* Max Cap */}
                        <td className="py-4 px-4 font-mono text-slate-400">
                          {coupon.maxDiscount ? `₹${Number(coupon.maxDiscount)}` : 'No Cap'}
                        </td>

                        {/* Expiry */}
                        <td className="py-4 px-4 text-[11px]">
                          {coupon.expiresAt ? (
                            <span className={isExpired ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {isExpired && ' (Expired)'}
                            </span>
                          ) : (
                            <span className="text-slate-500">Never Expires</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(coupon)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                              coupon.isActive && !isExpired
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.isActive && !isExpired ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            <span>{coupon.isActive && !isExpired ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Coupon */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Create New Coupon</h2>
                    <p className="text-[11px] text-slate-400">Configure discount rules for checkout</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-bold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                
                {/* Code & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. DIWALI20"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono font-bold uppercase focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Discount Type *
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                {/* Discount Value & Max Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === 'PERCENTAGE' ? 100 : 10000}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={discountType === 'PERCENTAGE' ? '15' : '100'}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Max Discount Cap (₹) <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 200"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Min Order Value & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Min. Cart Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0 for no minimum"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Expiry Date <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Description <span className="text-slate-500">(Optional customer-facing text)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Special festive 15% discount on pure Mara Chekku oils"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                {/* Status Toggle Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCoupon"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isActiveCoupon" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Enable and activate this coupon immediately
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Save Coupon</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
