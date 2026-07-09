'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Smartphone,
  Send,
  RefreshCw,
  Trash2,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  ExternalLink,
  Wifi,
  Megaphone
} from 'lucide-react';

interface SimulatedMsg {
  id: string;
  sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR';
  phone: string;
  text: string;
  timestamp: string;
}

interface UserState {
  id: string;
  userId: string;
  currentStep: string;
  selectedProductId: string | null;
  quantity: number | null;
  pendingOrderId: string | null;
  updatedAt: string;
}

export default function SimulatorPage() {
  const [phone, setPhone] = useState('919999988888');
  const [inputMsg, setInputMsg] = useState('');
  const [logs, setLogs] = useState<SimulatedMsg[]>([]);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [polling, setPolling] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [campaignRecipients, setCampaignRecipients] = useState<any[]>([]);

  const fetchCampaignRecipients = useCallback(async () => {
    try {
      const res = await fetch('/api/test/campaign-recipients');
      if (res.ok) {
        const data = await res.json();
        setCampaignRecipients(data);
      }
    } catch (err) {
      console.error('Failed to fetch campaign recipients:', err);
    }
  }, []);

  const handleSimulateWebhook = async (wamid: string, status: string, phone: string, errorCode?: number) => {
    try {
      const res = await fetch('/api/test/campaign-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wamid, status, phone, errorCode })
      });
      if (res.ok) {
        fetchCampaignRecipients();
      }
    } catch (err) {
      console.error('Failed to simulate webhook:', err);
    }
  };

  // Scroll to bottom of chat when new logs arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Fetch logs and current state
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/test/simulate-message?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        // Filter logs matching current phone number
        const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');
        const filteredLogs = data.logs.filter((log: SimulatedMsg) => log.phone === cleanPhone);
        setLogs(filteredLogs);
        setUserState(data.state);
      }
    } catch (err) {
      console.error('Failed to fetch simulator data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [phone]);

  // Poll for logs every 4 seconds to pick up webhook alerts automatically (optimized for tab focus)
  useEffect(() => {
    fetchData(true);
    fetchCampaignRecipients();
    let interval: NodeJS.Timeout;

    const handlePoll = () => {
      if (document.hidden) return; // Pause polling when tab is inactive to conserve connection pool slots
      fetchData(false);
      fetchCampaignRecipients();
    };

    if (polling) {
      interval = setInterval(handlePoll, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, fetchCampaignRecipients, polling]);

  // Submit simulated message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    setLoading(true);
    if (!customText) setInputMsg('');

    try {
      const res = await fetch('/api/test/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, text: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');
        const filteredLogs = data.logs.filter((log: SimulatedMsg) => log.phone === cleanPhone);
        setLogs(filteredLogs);
        setUserState(data.state);
      }
    } catch (err) {
      console.error('Failed to simulate message:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset conversational session
  const handleResetSession = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/api/test/simulate-message?phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setLogs([]);
        setUserState({
          id: 'temp',
          userId: 'temp',
          currentStep: 'START',
          selectedProductId: null,
          quantity: null,
          pendingOrderId: null,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to reset session:', err);
    } finally {
      setResetting(false);
    }
  };

  // Render message text with interactive parser for simulator console
  const renderMessageText = (text: string, isCustomer: boolean) => {
    if (isCustomer) {
      return <div className="font-medium">{text}</div>;
    }

    // RegEx patterns for interactive simulation
    const buttonRegex = /\[BUTTONS:\s*(.+?)\]/g;
    const listRegex = /\[LIST_BUTTON:\s*(.+?)\]\n([\s\S]+?)$/g;
    const ctaRegex = /\[CTA_BUTTON:\s*(.+?)\s*-\s*(.+?)\]/g;
 
    let cleanText = text;
    let buttons: Array<{ id: string; title: string }> = [];
    let listRows: Array<{ id: string; title: string; description?: string }> = [];
    let listBtnText = "";
    let ctaBtnText = "";
    let ctaBtnUrl = "";
    let imageUrl = "";

    // Parse image prefix if present
    if (text.startsWith('[IMAGE:')) {
      const imgMatch = text.match(/^\[IMAGE:\s*(.+?)\]/);
      if (imgMatch) {
        imageUrl = imgMatch[1].trim();
        cleanText = text.replace(imgMatch[0], '').trim();
      }
    }

    const hasButtons = cleanText.includes('[BUTTONS:');
    if (hasButtons) {
      buttonRegex.lastIndex = 0;
      const match = buttonRegex.exec(cleanText);
      if (match) {
        cleanText = cleanText.replace(match[0], '').trim();
        const parts = match[1].split('|');
        parts.forEach(p => {
          const itemMatch = p.trim().match(/(.+?)\s*\(id:\s*(.+?)\)/);
          if (itemMatch) {
            buttons.push({ title: itemMatch[1].trim(), id: itemMatch[2].trim() });
          } else {
            buttons.push({ title: p.trim(), id: p.trim() });
          }
        });
      }
    }

    const hasList = cleanText.includes('[LIST_BUTTON:');
    if (hasList) {
      listRegex.lastIndex = 0;
      const match = listRegex.exec(cleanText);
      if (match) {
        cleanText = cleanText.replace(match[0], '').trim();
        listBtnText = match[1].trim();
        const lines = match[2].split('\n');
        let currentRow: any = null;
        lines.forEach(line => {
          const rowMatch = line.trim().match(/^-\s*(.+?)\s*\(id:\s*(.+?)\)/);
          if (rowMatch) {
            if (currentRow) listRows.push(currentRow);
            currentRow = { title: rowMatch[1].trim(), id: rowMatch[2].trim() };
          } else if (line.trim().startsWith('description:') && currentRow) {
            currentRow.description = line.trim().replace('description:', '').trim();
          }
        });
        if (currentRow) listRows.push(currentRow);
      }
    }

    const hasCta = cleanText.includes('[CTA_BUTTON:');
    if (hasCta) {
      ctaRegex.lastIndex = 0;
      const match = ctaRegex.exec(cleanText);
      if (match) {
        cleanText = cleanText.replace(match[0], '').trim();
        ctaBtnText = match[1].trim();
        ctaBtnUrl = match[2].trim();
      }
    }

    return (
      <div className="space-y-3">
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Product View"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="whitespace-pre-wrap font-medium">{cleanText}</div>
        
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2.5 border-t border-slate-800 mt-2">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(btn.id)}
                className="bg-emerald-500 hover:bg-emerald-450 border border-emerald-600 text-slate-950 font-black px-3.5 py-2 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] text-[10px]"
              >
                🔘 {btn.title}
              </button>
            ))}
          </div>
        )}

        {listRows.length > 0 && (
          <div className="pt-2.5 border-t border-slate-800 mt-2 space-y-2">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">📋 {listBtnText || 'Menu Options'}</span>
            <div className="grid grid-cols-1 gap-1.5">
              {listRows.map((row, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(row.id)}
                  className="w-full text-left bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/20 text-slate-200 px-4 py-3 rounded-2xl transition-all flex flex-col hover:scale-[1.01]"
                >
                  <span className="font-extrabold text-[11px] text-emerald-400">🛍️ {row.title}</span>
                  {row.description && <span className="text-[9px] text-slate-400 mt-0.5 leading-normal">{row.description}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {ctaBtnText && ctaBtnUrl && (
          <div className="pt-2.5 border-t border-slate-800 mt-2 text-left">
            <a
              href={ctaBtnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-450 border border-emerald-600 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] text-[10px] space-x-1.5"
            >
              <span>💳 {ctaBtnText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const quickShortcuts = [
    { label: '👋 Say HI', value: 'Hi' },
    { label: '🥥 Coconut Oil', value: 'coconut-oil' },
    { label: '🌱 Sesame Oil', value: 'sesame-oil' },
    { label: '🔢 Quantity 2', value: '2' },
    { label: '🚚 Send Address', value: '123 Tech Park, Bangalore, KA, 560001' },
    { label: '✅ Confirm Order', value: 'confirm' },
    { label: '❌ Cancel Order', value: 'cancel' },
    { label: '❓ Unwanted Chat', value: 'Hello! I have a question about shipping' }
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-slate-100 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>Manual WABA Automation Simulator</span>
            </h1>
            <p className="text-xs text-slate-400">
              Test and trace conversational states, checkout simulations, and database changes interactively in the browser.
            </p>
          </div>

          <div className="flex items-center space-x-3.5 bg-slate-900 border border-slate-850 p-2.5 rounded-2xl">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Test Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-100 font-mono outline-none focus:border-emerald-500/50 w-36"
            />
            <button
              onClick={() => fetchData(true)}
              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
              title="Refresh logs manually"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Simulation Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Chat Simulator Console (2 columns wide) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-850 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[650px]">
            
            {/* WABA Header */}
            <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/25">
                  <Smartphone className="w-5.5 h-5.5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-100 tracking-wide">+{phone}</h3>
                  <span className="text-[9px] text-emerald-400 font-bold tracking-widest flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-1" />
                    <span>SIMULATOR CONSOLE ACTIVE</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetSession}
                  disabled={resetting}
                  className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 transition-all text-[10px] font-extrabold disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{resetting ? 'RESETTING...' : 'RESET SESSION'}</span>
                </button>
              </div>
            </div>

            {/* Chat Dialogues Panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <Clock className="w-8 h-8 text-slate-650 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold text-xs">No active conversation logged</p>
                    <p className="text-slate-500 text-[10px] max-w-xs leading-normal">
                      Click the shortcut <strong className="text-slate-300">👋 Say HI</strong> below or type a message to start browsing the catalog!
                    </p>
                  </div>
                </div>
              ) : (
                logs.map((log) => {
                  const isCustomer = log.sender === 'CUSTOMER';
                  const isError = log.sender === 'ERROR';
                  
                  return (
                    <div
                      key={log.id}
                      className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg border text-xs whitespace-pre-wrap leading-relaxed relative group transition-all duration-200 ${
                          isCustomer
                            ? 'bg-emerald-500 border-emerald-600 text-slate-950 font-semibold'
                            : isError
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-mono text-[10px]'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        {/* Meta Sender Tag */}
                        <div className="flex justify-between items-center text-[8px] font-bold tracking-wider opacity-60 mb-1">
                          <span>{log.sender}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        {/* Message content */}
                        {renderMessageText(log.text, isCustomer)}

                        {/* Visual verification checklist checkmarks */}
                        {!isCustomer && !isError && (
                          <div className="flex justify-end mt-1 text-[8px] font-bold text-slate-500 space-x-0.5">
                            <span>Delivered</span>
                            <CheckCheck className="w-3 h-3 text-emerald-400 ml-0.5 inline-block" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick shortcuts and presets panel */}
            <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-850 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Preset Steps:</span>
              {quickShortcuts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all text-[10px] font-bold hover:scale-[1.03] active:scale-[0.97]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="p-4 bg-slate-900 border-t border-slate-850 flex items-center space-x-3">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type simulated customer response..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-2xl px-5 h-11 text-xs text-slate-100 outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                className="w-11 h-11 bg-emerald-500 text-slate-950 hover:bg-emerald-450 border border-emerald-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Send className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>

          </div>

          {/* Conversational Engine DB Monitor (1 column wide) */}
          <div className="space-y-6">
            
            {/* Live State Machine Metrics */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Engine State Machine Monitor</h4>
              </div>

              {userState ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-850/50 pb-2">
                    <span className="text-slate-400 font-medium">Current Step:</span>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black rounded-full uppercase tracking-wider text-[9px]">
                      {userState.currentStep}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1 border-b border-slate-850/50 pb-2">
                    <span className="text-slate-400 font-medium">Selected Product ID:</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate">
                      {userState.selectedProductId || <span className="italic text-slate-600">null (None)</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-850/50 pb-2">
                    <span className="text-slate-400 font-medium">Purchasing Quantity:</span>
                    <span className="font-mono text-slate-100 font-extrabold">
                      {userState.quantity !== null ? userState.quantity : <span className="italic text-slate-600 font-normal">null (None)</span>}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1 border-b border-slate-850/50 pb-2">
                    <span className="text-slate-400 font-medium">Pending Order ID:</span>
                    <span className="font-mono text-[10px] text-indigo-400 truncate font-bold">
                      {userState.pendingOrderId || <span className="italic text-slate-600 font-normal">null (None)</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Last Updated:</span>
                    <span>{new Date(userState.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs italic">
                  State machine inactive. Send a message to seed conversational state.
                </div>
              )}
            </div>

            {/* Campaign Webhook Status Simulator */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 justify-between">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Campaign Webhook Simulator</h4>
                </div>
                <button 
                  onClick={fetchCampaignRecipients}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-3.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {campaignRecipients.length === 0 ? (
                  <p className="text-slate-600 text-center py-6 italic">No campaign template dispatches logged.</p>
                ) : (
                  campaignRecipients.map((cr: any) => (
                    <div key={cr.id} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 space-y-2.5">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="font-extrabold text-slate-200 block truncate max-w-[150px]">{cr.campaign.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">To: {cr.customer.name || 'WhatsApp Buyer'} (+{cr.customer.whatsappNumber})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          cr.status === 'READ' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/10' :
                          cr.status === 'DELIVERED' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/10' :
                          cr.status === 'FAILED' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {cr.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleSimulateWebhook(cr.wamid, 'delivered', cr.customer.whatsappNumber)}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 py-1.5 rounded-xl text-[9px] font-bold border border-slate-850 active:scale-95 transition-all"
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => handleSimulateWebhook(cr.wamid, 'read', cr.customer.whatsappNumber)}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 py-1.5 rounded-xl text-[9px] font-bold border border-slate-850 active:scale-95 transition-all"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => handleSimulateWebhook(cr.wamid, 'failed', cr.customer.whatsappNumber, 131047)}
                          className="bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 py-1.5 rounded-xl text-[9px] font-bold border border-slate-850 hover:border-rose-900/20 active:scale-95 transition-all"
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real WhatsApp Simulation & API Guide */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Simulate Real WhatsApp</h4>
              </div>

              <div className="text-[11px] text-slate-400 space-y-3.5 leading-relaxed text-left">
                <p>
                  You can hook up a real mobile phone to receive actual, live WhatsApp messages sent from this simulator console!
                </p>

                <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850/80 font-medium">
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">🚀 Setup Real WhatsApp Mode:</span>
                  <ul className="space-y-1.5 list-disc pl-3 text-slate-350">
                    <li>Add your Meta credentials to <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono text-[9px]">.env</code>:
                      <div className="text-[8px] text-slate-500 font-mono mt-1 space-y-0.5">
                        <div>WHATSAPP_PHONE_NUMBER_ID</div>
                        <div>WHATSAPP_ACCESS_TOKEN</div>
                      </div>
                    </li>
                    <li>Verify your phone number as a **Test Recipient** in your Meta App Dashboard.</li>
                    <li>Change the **Test Phone** input field above to your **real phone number** (e.g. <code className="text-slate-100 bg-slate-900 px-1 rounded">919442101823</code>).</li>
                  </ul>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850/80 font-medium">
                  <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider block">🔗 Webhook Bidirectional Sync:</span>
                  <p className="text-[10px] text-slate-355">
                    To receive replies sent from your real phone back into this panel:
                  </p>
                  <ul className="space-y-1 list-disc pl-3 text-slate-450 text-[10px]">
                    <li>Configure Meta Webhook URL: <code className="text-indigo-400 font-mono text-[9px]">https://yourdomain.com/api/webhooks/whatsapp</code></li>
                    <li>Verify Token: <code className="text-indigo-400 font-mono text-[9px]">mock_verify_token_secure123</code></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Testing Tips / Visual walkthrough card */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">How to test manually:</h4>
              </div>

              <div className="text-[11px] text-slate-400 space-y-3 leading-relaxed">
                <p className="flex items-start space-x-2">
                  <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">1</span>
                  <span>Click <strong className="text-slate-100">👋 Say HI</strong> presets shortcut to view active products and get shortcodes from PostgreSQL database.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">2</span>
                  <span>Type and send an active product code like <strong className="text-slate-100">headphones</strong> (slug) or click the shortcut.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">3</span>
                  <span>Specify unit quantity (e.g. <strong className="text-slate-100">2</strong>) to get a full calculated order aggregate invoice.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">4</span>
                  <span>Submit <strong className="text-slate-100">CONFIRM</strong>. Open the generated secure Checkout Link in your browser to mock payment.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-4 h-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">5</span>
                  <span>Once paid in sandbox, our webhook is processed, and the paid confirmation message + package tracking URL instantly pop up inside the chat window!</span>
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
