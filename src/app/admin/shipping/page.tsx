'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  MapPin,
  IndianRupee,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';

interface ShippingRate {
  id: string;
  zoneName: string;
  state: string;
  pincodePrefixes: string | null;
  deliveryFee: number | string;
  estimatedDays: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [zoneName, setZoneName] = useState('');
  const [state, setState] = useState('');
  const [pincodePrefixes, setPincodePrefixes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(49);
  const [estimatedDays, setEstimatedDays] = useState('2-4 Business Days');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Live Test Calculator
  const [testState, setTestState] = useState('Tamil Nadu');
  const [testPincode, setTestPincode] = useState('600001');
  const [testResult, setTestResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shipping-rates');
      const data = await res.json();
      if (res.ok) {
        setRates(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data.error || 'Failed to fetch shipping rates');
      }
    } catch (err: any) {
      console.error('Error loading shipping rates:', err);
      setError(err.message || 'Failed to load shipping rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const openCreateModal = () => {
    setEditingRate(null);
    setZoneName('');
    setState('');
    setPincodePrefixes('');
    setDeliveryFee(49);
    setEstimatedDays('2-4 Business Days');
    setIsDefault(false);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rate: ShippingRate) => {
    setEditingRate(rate);
    setZoneName(rate.zoneName);
    setState(rate.state);
    setPincodePrefixes(rate.pincodePrefixes || '');
    setDeliveryFee(Number(rate.deliveryFee));
    setEstimatedDays(rate.estimatedDays);
    setIsDefault(rate.isDefault);
    setIsActive(rate.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!zoneName.trim()) {
      setFormError('Please enter a location zone name.');
      return;
    }

    if (!state.trim()) {
      setFormError('Please specify target state(s) or regions.');
      return;
    }

    if (deliveryFee === '' || Number(deliveryFee) < 0) {
      setFormError('Please enter a valid delivery fee (₹).');
      return;
    }

    setSaving(true);
    try {
      const url = editingRate ? `/api/shipping-rates/${editingRate.id}` : '/api/shipping-rates';
      const method = editingRate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: zoneName.trim(),
          state: state.trim(),
          pincodePrefixes: pincodePrefixes.trim() || undefined,
          deliveryFee: Number(deliveryFee),
          estimatedDays: estimatedDays.trim(),
          isDefault,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save shipping rate');
      }

      setIsModalOpen(false);
      fetchRates();
    } catch (err: any) {
      setFormError(err.message || 'Could not save shipping rate.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rate: ShippingRate) => {
    try {
      const updatedStatus = !rate.isActive;
      const res = await fetch(`/api/shipping-rates/${rate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });

      if (res.ok) {
        setRates(rates.map(r => (r.id === rate.id ? { ...r, isActive: updatedStatus } : r)));
      }
    } catch (err) {
      console.error('Failed to toggle shipping rate status:', err);
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location shipping rate?')) return;

    try {
      const res = await fetch(`/api/shipping-rates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRates(rates.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete shipping rate:', err);
    }
  };

  const handleTestCalculation = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/shipping-rates/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: testState,
          pincode: testPincode,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error('Failed to calculate shipping:', err);
    } finally {
      setCalculating(false);
    }
  };

  const defaultRate = rates.find(r => r.isDefault) || rates[0];

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
              <Link href="/admin/coupons" className="text-amber-400 hover:underline">Coupons</Link>
              <span>/</span>
              <span>Location Delivery Rules</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-amber-500" />
              <span>Location-Based Delivery Fee Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure custom delivery charges by State, Region, or Pincode for website and WhatsApp checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Location Rate</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Default Delivery Fee</span>
            <p className="text-2xl font-black text-amber-400 font-mono">
              ₹{defaultRate ? Number(defaultRate.deliveryFee) : 49}
            </p>
            <p className="text-[10px] text-slate-500">Applied when no specific region matches</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Configured Zones</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">{rates.length}</p>
            <p className="text-[10px] text-slate-500">{rates.filter(r => r.isActive).length} currently active</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local State Rate</span>
            <p className="text-2xl font-black text-slate-100 font-mono">
              ₹{rates.find(r => r.state.toLowerCase().includes('tamil')) ? Number(rates.find(r => r.state.toLowerCase().includes('tamil'))?.deliveryFee) : 30}
            </p>
            <p className="text-[10px] text-slate-500">Tamil Nadu / Home Delivery</p>
          </div>
        </div>

        {/* Live Simulator / Rate Matcher */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Live Location Rate Calculator (Simulator)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Test how customer addresses will be charged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Customer State</label>
              <input
                type="text"
                value={testState}
                onChange={(e) => setTestState(e.target.value)}
                placeholder="e.g. Tamil Nadu, Kerala, Maharashtra"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={testPincode}
                onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 600001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleTestCalculation}
              disabled={calculating}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {calculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Calculate Rate</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-100">
                    Matched Zone: <span className="text-amber-400">{testResult.zoneName}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Estimated Timeline: {testResult.estimatedDays}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Delivery Charge</span>
                <span className="text-lg font-black text-emerald-400 font-mono">₹{testResult.deliveryFee}</span>
              </div>
            </div>
          )}
        </div>

        {/* Location Rates Table */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading delivery zones...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3.5 px-6">Location Zone</th>
                    <th className="py-3.5 px-4">Covered States / Regions</th>
                    <th className="py-3.5 px-4">Pincode Prefixes</th>
                    <th className="py-3.5 px-4">Delivery Fee</th>
                    <th className="py-3.5 px-4">Estimated Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-slate-850/40 transition-colors">
                      {/* Zone Name */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{rate.zoneName}</span>
                            {rate.isDefault && (
                              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                Default Base
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Covered States */}
                      <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                        {rate.state}
                      </td>

                      {/* Pincode Prefixes */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400 max-w-[140px] truncate">
                        {rate.pincodePrefixes || 'All Pin Codes'}
                      </td>

                      {/* Delivery Fee */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-black text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          ₹{Number(rate.deliveryFee)}
                        </span>
                      </td>

                      {/* Estimated Days */}
                      <td className="py-4 px-4 text-slate-400 text-[11px] flex items-center gap-1 mt-3">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{rate.estimatedDays}</span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(rate)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            rate.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${rate.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          <span>{rate.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(rate)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                          title="Edit Rate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!rate.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRate(rate.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete Rate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create/Edit Shipping Rate */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      {editingRate ? 'Edit Delivery Rate' : 'Add Location Delivery Rate'}
                    </h2>
                    <p className="text-[11px] text-slate-400">Set delivery charge for specific states or regions</p>
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

              <form onSubmit={handleSaveRate} className="space-y-4 text-xs">
                
                {/* Zone Name */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Location Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="e.g. Tamil Nadu (Home Delivery) or South India"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                {/* States / Regions */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Target State(s) * (Comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu, Puducherry or Maharashtra, Gujarat"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Enter state names matching customer checkout addresses</p>
                </div>

                {/* Delivery Fee & Estimated Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Delivery Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 30 or 49"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      Estimated Delivery Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      placeholder="e.g. 1-2 Business Days"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pincode Prefixes (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Specific Pincode Prefixes <span className="text-slate-500">(Optional comma-separated 3-digit prefixes)</span>
                  </label>
                  <input
                    type="text"
                    value={pincodePrefixes}
                    onChange={(e) => setPincodePrefixes(e.target.value)}
                    placeholder="e.g. 600,601,602,603"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Leave blank to match all pincodes in the specified states</p>
                </div>

                {/* Checkbox Options */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefaultRate"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isDefaultRate" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Set as Default Pan-India Base Rate
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveRate"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isActiveRate" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Rate is Active and Live
                    </label>
                  </div>
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
                        <span>{editingRate ? 'Update Rate' : 'Save Rate'}</span>
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
