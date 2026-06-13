'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import {
  Users,
  Search,
  MessageSquare,
  DollarSign,
  Receipt,
  Calendar,
  X,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Edit2
} from 'lucide-react';

export default function AdminCustomersPage() {
  const {
    customers,
    loadingCustomers,
    fetchCustomers,
    sendWhatsAppMessage,
    deleteCustomer,
    addCustomer,
    updateCustomer
  } = useAdminStore();

  const [search, setSearch] = useState('');
  
  // Custom Message Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Customer Profile CRUD Form State
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    whatsappNumber: '',
  });
  const [customerFormErrors, setCustomerFormErrors] = useState<any>({});
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Message Center Handlers
  const handleOpenMsg = (customer: any) => {
    setSelectedCustomer(customer);
    setMessageText('');
    setSendSuccess(false);
    setModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !messageText.trim()) return;
    setSendingMsg(true);

    const success = await sendWhatsAppMessage(selectedCustomer.whatsappNumber, messageText.trim());

    if (success) {
      setSendSuccess(true);
      setMessageText('');
      setTimeout(() => setSendSuccess(false), 3000);
    } else {
      alert('Failed to transmit message. Please verify Meta settings.');
    }
    setSendingMsg(false);
  };

  // Profile CRUD Handlers
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', whatsappNumber: '' });
    setCustomerFormErrors({});
    setCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      whatsappNumber: customer.whatsappNumber,
    });
    setCustomerFormErrors({});
    setCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCustomer(true);
    setCustomerFormErrors({});

    let result;
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, customerForm);
    } else {
      result = await addCustomer(customerForm);
    }

    if (result.success) {
      setCustomerModalOpen(false);
      setCustomerForm({ name: '', whatsappNumber: '' });
    } else {
      setCustomerFormErrors(result.errors || {});
    }
    setSubmittingCustomer(false);
  };

  const handleDeleteCustomer = async (customer: any) => {
    if (confirm(`Are you sure you want to permanently delete customer "${customer.name || 'WhatsApp Buyer'}"?\nThis will delete all their orders, items, payments, and reset their conversation state.`)) {
      const success = await deleteCustomer(customer.id);
      if (!success) {
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'INACTIVE': return 'bg-slate-500/10 text-slate-500 border border-slate-500/10';
      case 'START': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SELECT_PRODUCT': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'SELECT_QUANTITY': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'CONFIRM_ORDER': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'AWAITING_PAYMENT': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsappNumber.includes(search)
    );
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Search bar & Add Customer Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-900">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search customers directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-10 pr-4 text-slate-100 text-xs outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleOpenAddCustomer}
            className="w-full sm:w-auto h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Customer</span>
          </button>
        </div>

        {/* 2. DIRECTORY VIEW */}
        {loadingCustomers ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-500 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">No Customers Logged</h4>
              <p className="text-xs text-slate-400">Store clients will appear here automatically on sending their first WhatsApp message.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="bg-slate-900/60 border border-slate-850 rounded-3xl p-5 shadow-xl flex flex-col justify-between group transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* Profile detail */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-slate-100 text-sm truncate group-hover:text-emerald-400 transition-colors">
                        {cust.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono font-bold block">
                        WhatsApp: {cust.whatsappNumber}
                      </span>
                    </div>
                    {/* Chat state indicator */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStepColor(cust.conversationStep)}`}>
                      Step: {cust.conversationStep}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 border-t border-slate-850 pt-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Since {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </span>
                  </div>

                  {/* Aggregated ledger statistics */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Orders placed</span>
                      <div className="flex items-baseline space-x-1">
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-100">{cust.totalOrders} total</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Completed spent</span>
                      <div className="flex items-baseline justify-end space-x-0.5">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-black text-emerald-400">₹{cust.totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action trigger */}
                <div className="pt-4 mt-4 border-t border-slate-850 flex items-center gap-3">
                  <button
                    onClick={() => handleOpenMsg(cust)}
                    className="flex-1 h-10 bg-slate-950 border border-slate-850 hover:border-emerald-500/30 text-slate-400 hover:text-slate-100 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Open Message Center</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditCustomer(cust)}
                    className="w-10 h-10 bg-slate-950 border border-slate-850 hover:border-emerald-500/30 text-slate-400 hover:text-slate-100 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(cust)}
                    className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* 3. DIRECT WHATSAPP MESSAGE CENTER OVERLAY */}
        {modalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Glass Overlay */}
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => { setModalOpen(false); setSelectedCustomer(null); }}
            />

            {/* Modal Body Card */}
            <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 z-10 animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm leading-none">WhatsApp Message Center</h3>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{selectedCustomer.whatsappNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setModalOpen(false); setSelectedCustomer(null); }}
                  className="w-8 h-8 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Aggregated Quick Info */}
              <div className="bg-slate-950/65 border border-slate-850 rounded-2xl p-4 flex justify-between text-xs text-slate-400">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Purchaser profile</p>
                  <p className="font-bold text-slate-100">{selectedCustomer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Lifetime spend</p>
                  <p className="font-black text-emerald-400">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Outgoing Custom Message</label>
                  <textarea
                    required
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl p-4 text-slate-100 text-xs outline-none"
                    placeholder="Type custom message or manual notification template here (e.g. Hey, we've updated your shipment details...)"
                  />
                  <span className="text-[9px] text-slate-500 font-medium italic block">
                    Bypasses conversation state machine and delivers text directly to the customer&apos;s WhatsApp screen.
                  </span>
                </div>

                {sendSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-2 rounded-xl flex items-center justify-center space-x-2 font-bold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Message Sent Success!</span>
                  </div>
                )}

                {/* Submit Row */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setModalOpen(false); setSelectedCustomer(null); }}
                    className="h-11 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100 font-bold px-4 rounded-xl text-xs active:scale-95"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMsg || !messageText.trim()}
                    className="h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                  >
                    {sendingMsg ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* 4. CUSTOMER PROFILE CRUD MODAL */}
        {customerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setCustomerModalOpen(false)}
            />

            <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 z-10 animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-slate-100 text-sm">
                  {editingCustomer ? 'Edit Customer Details' : 'Register New Customer'}
                </h3>
                <button
                  onClick={() => setCustomerModalOpen(false)}
                  className="w-8 h-8 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 text-xs outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                  {customerFormErrors.name && <p className="text-[10px] text-rose-400 font-bold">{customerFormErrors.name[0]}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={customerForm.whatsappNumber}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 text-xs outline-none"
                    placeholder="e.g. 919876543210 (with country code)"
                  />
                  {customerFormErrors.whatsappNumber && <p className="text-[10px] text-rose-400 font-bold">{customerFormErrors.whatsappNumber[0]}</p>}
                </div>

                {customerFormErrors.global && (
                  <p className="text-[10px] text-rose-400 font-bold">{customerFormErrors.global[0]}</p>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCustomerModalOpen(false)}
                    className="h-11 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-100 font-bold px-4 rounded-xl text-xs active:scale-95"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCustomer}
                    className="h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                  >
                    {submittingCustomer ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Customer</span>
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
