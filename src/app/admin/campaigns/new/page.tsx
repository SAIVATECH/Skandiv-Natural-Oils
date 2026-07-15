'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  Megaphone,
  Layers,
  Users,
  Eye,
  Send,
  AlertTriangle,
  Info,
  Search,
  CheckSquare,
  Square
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  whatsappNumber: string;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: any[];
}

interface VariableMapping {
  type: 'customer_name' | 'customer_phone' | 'custom_text';
  value?: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [bodyVars, setBodyVars] = useState<VariableMapping[]>([]);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [scheduled, setScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // API data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [limits, setLimits] = useState({ dailyCap: 1000, monthlyCap: 30000, sentToday: 0, sentThisMonth: 0 });

  // UI status
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/campaigns/templates').then(r => r.ok ? r.json() : []),
      fetch('/api/customers').then(r => r.ok ? r.json() : []),
      fetch('/api/campaigns/analytics').then(r => r.ok ? r.json() : null)
    ]).then(([tmplData, custData, analyticsData]) => {
      setTemplates(tmplData);
      setCustomers(custData);
      if (analyticsData) {
        setLimits({
          dailyCap: analyticsData.cards.dailyCap,
          monthlyCap: analyticsData.cards.monthlyCap,
          sentToday: analyticsData.cards.sentToday,
          sentThisMonth: analyticsData.cards.sentThisMonth
        });
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Parse template variables whenever selected template changes
  useEffect(() => {
    if (!selectedTemplate) {
      setBodyVars([]);
      return;
    }

    const bodyComp = selectedTemplate.components.find((c: any) => c.type === 'BODY');
    if (!bodyComp || !bodyComp.text) {
      setBodyVars([]);
      return;
    }

    // Match all occurrences of {{X}}
    const matches = bodyComp.text.match(/\{\{(\d+)\}\}/g) || [];
    const count = matches.length;

    // Initialize mapping
    const mappings: VariableMapping[] = Array.from({ length: count }, () => ({
      type: 'customer_name'
    }));

    setBodyVars(mappings);
  }, [selectedTemplate]);

  const handleTemplateChange = (templateName: string) => {
    const tmpl = templates.find(t => t.name === templateName) || null;
    setSelectedTemplate(tmpl);
  };

  const handleVariableTypeChange = (index: number, type: 'customer_name' | 'customer_phone' | 'custom_text') => {
    const updated = [...bodyVars];
    updated[index] = { type, value: type === 'custom_text' ? '' : undefined };
    setBodyVars(updated);
  };

  const handleVariableValueChange = (index: number, value: string) => {
    const updated = [...bodyVars];
    updated[index] = { ...updated[index], value };
    setBodyVars(updated);
  };

  const toggleRecipient = (id: string) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter(rid => rid !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  const toggleAllRecipients = () => {
    const filtered = filteredCustomers.map(c => c.id);
    const allSelected = filtered.every(id => selectedRecipientIds.includes(id));

    if (allSelected) {
      setSelectedRecipientIds(selectedRecipientIds.filter(id => !filtered.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedRecipientIds, ...filtered]));
      setSelectedRecipientIds(merged);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.whatsappNumber.includes(searchQuery)
  );

  const getPreviewBodyText = () => {
    if (!selectedTemplate) return '';
    const bodyComp = selectedTemplate.components.find((c: any) => c.type === 'BODY');
    if (!bodyComp || !bodyComp.text) return '';

    let text = bodyComp.text;
    bodyVars.forEach((v, index) => {
      let replacement = `{{${index + 1}}}`;
      if (v.type === 'customer_name') {
        replacement = '*[Customer Name]*';
      } else if (v.type === 'customer_phone') {
        replacement = '*[Customer Phone]*';
      } else if (v.type === 'custom_text' && v.value) {
        replacement = `*${v.value}*`;
      }
      text = text.replace(`{{${index + 1}}}`, replacement);
    });

    return text;
  };

  // Submit and create the campaign
  const handleCreateCampaign = async (startSending = false) => {
    if (!name.trim()) {
      setError('Please provide a campaign name.');
      return;
    }
    if (!selectedTemplate) {
      setError('Please select a message template.');
      return;
    }
    if (selectedRecipientIds.length === 0) {
      setError('Please select at least one recipient customer.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      description,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language,
      templateVariables: {
        body: bodyVars,
        header: headerImageUrl ? [{ type: 'custom_text', value: headerImageUrl }] : []
      },
      recipientIds: selectedRecipientIds,
      scheduledAt: scheduled && scheduleTime ? new Date(scheduleTime).toISOString() : null
    };

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create campaign');
      }

      const campaign = await res.json();

      if (startSending && !scheduled) {
        // Trigger send immediately
        const sendRes = await fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' });
        if (!sendRes.ok) {
          throw new Error('Campaign created, but failed to start background sending.');
        }
      }

      router.push('/admin/campaigns');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <Info className="w-8 h-8 animate-pulse text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Configuring builder sandbox...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Cap indicators
  const dailyRemaining = limits.dailyCap - limits.sentToday;
  const isOverDaily = selectedRecipientIds.length > dailyRemaining;

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header toolbar */}
        <div className="flex items-center space-x-3 pb-2">
          <Link 
            href="/admin/campaigns" 
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-100" />
          </Link>
          <div>
            <p className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">Step {step} of 4</p>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Create Broadcast Campaign</h1>
          </div>
        </div>

        {/* Builder Steps indicator */}
        <div className="flex items-center justify-between bg-slate-900/20 border border-slate-900/60 rounded-2xl p-4 text-xs font-bold text-slate-500">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-emerald-400' : step > 1 ? 'text-slate-100' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-500 text-slate-950 font-black' : step > 1 ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 border border-slate-800'}`}>1</span>
            <span>Details</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
          
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-emerald-400' : step > 2 ? 'text-slate-100' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-500 text-slate-950 font-black' : step > 2 ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 border border-slate-800'}`}>2</span>
            <span>Template Setup</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
          
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-400' : step > 3 ? 'text-slate-100' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-500 text-slate-950 font-black' : step > 3 ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 border border-slate-800'}`}>3</span>
            <span>Recipients</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-800" />
          
          <div className={`flex items-center gap-2 ${step === 4 ? 'text-emerald-400' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 border border-slate-800'}`}>4</span>
            <span>Review & Send</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Dynamic step body screens */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-xl">
          
          {/* STEP 1: CAMPAIGN DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-100 uppercase tracking-wider border-b border-slate-900 pb-3 mb-2">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>Campaign Description Info</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold block">Campaign Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Summer Wellness Launch 10% Off"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-xs font-bold block">Campaign Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summarize internal campaign target goals..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TEMPLATE SELECTION & MAPPING */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black text-slate-100 uppercase tracking-wider border-b border-slate-900 pb-3 mb-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Select & Map Approved Templates</span>
              </div>

              {templates.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-900">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-slate-300 text-xs font-bold">No message templates available</p>
                  <p className="text-slate-500 text-[10px] mt-1">Please sync templates from Meta in the campaign tab first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select dropdown & variable mappings */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-xs font-bold block">Approved Template *</label>
                      <select
                        value={selectedTemplate?.name || ''}
                        onChange={e => handleTemplateChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors"
                      >
                        <option value="">-- Choose Template --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                        ))}
                      </select>
                    </div>

                    {selectedTemplate && selectedTemplate.components?.some((c: any) => (c.type === 'HEADER' || c.type === 'header') && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format?.toUpperCase())) && (
                      <div className="space-y-2 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
                        <label className="text-slate-300 text-xs font-bold block flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Header Media URL (Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/your-image.jpg"
                          value={headerImageUrl}
                          onChange={e => setHeaderImageUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 block italic leading-normal">
                          Provide a direct public image/video link (ending in .jpg, .png, or .mp4) to replace the template header. Leave blank to use the default fallback.
                        </span>
                      </div>
                    )}

                    {selectedTemplate && bodyVars.length > 0 && (
                      <div className="space-y-4 pt-2 border-t border-slate-900">
                        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Variables Config (Body placeholders)</span>
                        </h4>

                        {bodyVars.map((v, idx) => (
                          <div key={idx} className="space-y-2 bg-slate-950/40 border border-slate-900 p-3.5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-bold">Placeholder: <strong className="text-slate-100 font-mono">{"{{"}{idx + 1}{"}}"}</strong></span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => handleVariableTypeChange(idx, 'customer_name')}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${v.type === 'customer_name' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 border-slate-900 text-slate-500'}`}
                              >
                                Client Name
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVariableTypeChange(idx, 'customer_phone')}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${v.type === 'customer_phone' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 border-slate-900 text-slate-500'}`}
                              >
                                Phone Num
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVariableTypeChange(idx, 'custom_text')}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${v.type === 'custom_text' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 border-slate-900 text-slate-500'}`}
                              >
                                Custom Text
                              </button>
                            </div>

                            {v.type === 'custom_text' && (
                              <input 
                                type="text"
                                value={v.value || ''}
                                onChange={e => handleVariableValueChange(idx, e.target.value)}
                                placeholder="Static text parameter..."
                                className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Template preview card panel */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>Mock Message Preview</span>
                      </h4>

                      {selectedTemplate ? (
                        <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-3">
                          {/* Header section preview */}
                          {selectedTemplate.components.find(c => c.type === 'HEADER') && (
                            <div className="font-bold text-slate-100 text-[11px] pb-1.5 border-b border-slate-900">
                              {selectedTemplate.components.find(c => c.type === 'HEADER').text}
                            </div>
                          )}
                          
                          {/* Replaced variable body preview */}
                          <p className="text-slate-300 italic text-xs leading-relaxed whitespace-pre-wrap">
                            {getPreviewBodyText()}
                          </p>

                          {/* Footer preview */}
                          {selectedTemplate.components.find(c => c.type === 'FOOTER') && (
                            <div className="text-[10px] text-slate-600 font-bold border-t border-slate-900/60 pt-1.5">
                              {selectedTemplate.components.find(c => c.type === 'FOOTER').text}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-600 text-xs border border-dashed border-slate-900 rounded-2xl">
                          Select a template to generate preview
                        </div>
                      )}
                    </div>

                    {selectedTemplate && (
                      <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-[10px] text-slate-400 space-y-1">
                        <p>Category: <strong>{selectedTemplate.category}</strong></p>
                        <p>Language: <strong>{selectedTemplate.language}</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: RECIPIENT SELECTOR */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black text-slate-100 uppercase tracking-wider border-b border-slate-900 pb-3 mb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Assign Recipient Customers</span>
              </div>

              {/* Threshold warning */}
              {isOverDaily && (
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-2xl flex items-start gap-2.5 text-amber-400 text-[11px] font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Selected count exceeds remaining daily sending capacity!</span>
                    Remaining capacity is {dailyRemaining} (Cap: {limits.dailyCap}). Campaign processor will pause transmission automatically when the cap is reached.
                  </div>
                </div>
              )}

              {/* Filters toolbar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name or phone number..."
                    className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-slate-100 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Recipient check table */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3 w-10">
                        <button 
                          type="button" 
                          onClick={toggleAllRecipients}
                          className="text-slate-400 hover:text-slate-100"
                        >
                          {filteredCustomers.length > 0 && filteredCustomers.every(c => selectedRecipientIds.includes(c.id)) ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">WhatsApp Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-600">
                          No matching customers found
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(c => {
                        const isChecked = selectedRecipientIds.includes(c.id);
                        return (
                          <tr 
                            key={c.id} 
                            onClick={() => toggleRecipient(c.id)}
                            className={`hover:bg-slate-900/30 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-500/5' : ''}`}
                          >
                            <td className="p-3">
                              {isChecked ? (
                                <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-slate-700" />
                              )}
                            </td>
                            <td className="p-3 font-bold text-slate-300">{c.name}</td>
                            <td className="p-3 font-mono text-slate-500">+{c.whatsappNumber}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selection Summary footer */}
              <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-900 pt-3">
                <span>Selected: <strong className="text-slate-100">{selectedRecipientIds.length}</strong> / {customers.length} total customers</span>
                <button
                  type="button"
                  onClick={() => setSelectedRecipientIds(customers.map(c => c.id))}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Select All Directory Customers
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SEND */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black text-slate-100 uppercase tracking-wider border-b border-slate-900 pb-3 mb-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Review & Scheduling Setup</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Details list summary */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-slate-100 uppercase tracking-wider">Campaign Overview</h4>
                  
                  <div className="space-y-2.5 divide-y divide-slate-900">
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500">Campaign Name:</span>
                      <span className="font-bold text-slate-200">{name}</span>
                    </div>
                    <div className="pt-2.5 flex justify-between">
                      <span className="text-slate-500">Template Sync Name:</span>
                      <span className="font-bold text-slate-200">{selectedTemplate?.name}</span>
                    </div>
                    <div className="pt-2.5 flex justify-between">
                      <span className="text-slate-500">Recipients Count:</span>
                      <span className="font-bold text-emerald-400">{selectedRecipientIds.length} users</span>
                    </div>
                    <div className="pt-2.5 flex justify-between">
                      <span className="text-slate-500">Estimated Cost:</span>
                      <span className="font-bold text-slate-200 font-mono">${(selectedRecipientIds.length * 0.015).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Scheduling controls */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Scheduling Configuration</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-400">
                      <input 
                        type="checkbox"
                        checked={scheduled}
                        onChange={e => setScheduled(e.target.checked)}
                        className="rounded border-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-950"
                      />
                      <span>Schedule campaign send time</span>
                    </label>

                    {scheduled && (
                      <div className="space-y-2 pt-2 animate-slide-in">
                        <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Target Send Time *</label>
                        <input 
                          type="datetime-local"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Billing limits estimate warning */}
              <div className="bg-slate-900/60 border border-slate-900/80 p-4 rounded-2xl text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  Campaign dispatches will comply with active speed limits of {limits.dailyCap} messages/day. Status updates (Sent &rarr; Delivered &rarr; Read) will synchronize automatically upon Meta webhook delivery status updates.
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Steps Navigation buttons */}
        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  setError('Please fill in the campaign name.');
                  return;
                }
                if (step === 2 && !selectedTemplate) {
                  setError('Please select a verified template.');
                  return;
                }
                if (step === 3 && selectedRecipientIds.length === 0) {
                  setError('Please select at least one customer.');
                  return;
                }
                setError(null);
                setStep((step + 1) as any);
              }}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleCreateCampaign(false)}
                disabled={submitting}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Save as Draft
              </button>
              
              <button
                onClick={() => handleCreateCampaign(true)}
                disabled={submitting}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600"
              >
                <Send className="w-4 h-4 fill-slate-950/20" />
                <span>{submitting ? 'Creating...' : scheduled ? 'Schedule Campaign' : 'Send Campaign'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
