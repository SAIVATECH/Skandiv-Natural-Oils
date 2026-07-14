'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import { 
  Search, 
  Send, 
  MessageSquare, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  User,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR';
  phone: string;
  text: string;
  timestamp: string;
}

export default function AdminLiveChatPage() {
  const { customers, loadingCustomers, fetchCustomers, sendWhatsAppMessage } = useAdminStore();
  
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch chat history for selected customer
  const fetchChatHistory = async (phone: string, showLoader = false) => {
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat logs:', err);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  // Select a customer and start logs retrieval
  const handleSelectCustomer = (customer: any) => {
    setSelectedCust(customer);
    setMessages([]);
    setReplyText('');
    setMobileShowChat(true);
    fetchChatHistory(customer.whatsappNumber, true);
  };

  // Setup/teardown message logs polling
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (selectedCust) {
      pollingRef.current = setInterval(() => {
        fetchChatHistory(selectedCust.whatsappNumber, false);
      }, 4000); // Poll every 4 seconds
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedCust]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Autoscroll chat history viewport to bottom when new messages arrive
  useEffect(() => {
    if (messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isNewMessage = lastMsg.id !== lastMessageIdRef.current;

    if (isNewMessage) {
      const container = chatContainerRef.current;
      const isFirstLoad = lastMessageIdRef.current === null;

      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isFirstLoad || isNearBottom) {
          // Delay slightly to let the new message render in DOM first
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }
      } else if (isFirstLoad) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      lastMessageIdRef.current = lastMsg.id;
    }
  }, [messages]);

  // Send reply handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !replyText.trim() || sendingReply) return;
    
    setSendingReply(true);
    const textToSend = replyText.trim();
    
    const success = await sendWhatsAppMessage(selectedCust.whatsappNumber, textToSend);
    
    if (success) {
      setReplyText('');
      // Optimistically append outgoing message locally
      const mockOutMsg: Message = {
        id: `temp_${Date.now()}`,
        sender: 'SYSTEM',
        phone: selectedCust.whatsappNumber,
        text: textToSend,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, mockOutMsg]);
      // Refetch full logs list to synchronize with database IDs
      fetchChatHistory(selectedCust.whatsappNumber, false);
    } else {
      alert('Failed to transmit reply message. Verify WABA simulator status.');
    }
    setSendingReply(false);
  };

  const getStepBadge = (step: string) => {
    switch (step) {
      case 'START': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SELECT_PRODUCT': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'SELECT_QUANTITY': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'CONFIRM_ORDER': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'AWAITING_PAYMENT': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.whatsappNumber.includes(search)
  );

  return (
    <DashboardShell>
      <div className="h-[calc(100vh-140px)] bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden flex relative">
        
        {/* Left Side Panel: Customers List */}
        <div className={`w-full md:w-80 h-full flex flex-col border-r border-slate-900 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-900 bg-slate-950/20 space-y-3">
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Active Chats ({customers.length})</span>
            </h3>
            <div className="relative">
              <Search className="absolute inset-y-0 left-3 w-4 h-4 text-slate-500 my-auto" />
              <input
                type="text"
                placeholder="Filter chats..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 text-xs text-slate-100 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60 p-2 space-y-1">
            {loadingCustomers ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No chats found.</p>
            ) : (
              filteredCustomers.map(cust => {
                const isSelected = selectedCust?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center space-x-3 transition-all ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-slate-950/25 text-slate-100' : 'bg-slate-950 border border-slate-850 text-emerald-400'}`}>
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-black truncate">{cust.name}</p>
                        {!isSelected && (
                          <span className="text-[8px] text-slate-500 font-semibold">{cust.conversationStep}</span>
                        )}
                      </div>
                      <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        +{cust.whatsappNumber}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Panel: Chat Viewport */}
        <div className={`flex-1 h-full flex flex-col bg-slate-950/20 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedCust ? (
            <>
              {/* Header details */}
              <div className="h-14 px-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden w-8 h-8 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-center text-slate-400 active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-100" />
                  </button>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100 leading-none">{selectedCust.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">+{selectedCust.whatsappNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStepBadge(selectedCust.conversationStep)}`}>
                    Step: {selectedCust.conversationStep}
                  </span>
                  <button 
                    onClick={() => fetchChatHistory(selectedCust.whatsappNumber, true)}
                    className="w-8 h-8 bg-slate-950 border border-slate-850 hover:border-emerald-500/20 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors active:scale-95"
                    title="Refresh logs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat messages stream */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                    <MessageSquare className="w-10 h-10 text-slate-650" />
                    <p className="text-xs text-slate-500">No conversation history found.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSystem = msg.sender === 'SYSTEM';
                    const isError = msg.sender === 'ERROR';
                    
                    if (isError) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 text-[10px] text-rose-400 font-bold flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{msg.text}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                          isSystem 
                            ? 'bg-emerald-500 text-slate-950 rounded-tr-none font-medium' 
                            : 'bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className={`text-[8px] block text-right font-mono ${isSystem ? 'text-slate-800' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Reply Area */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-900 bg-slate-950/20 flex gap-3 items-end">
                <textarea
                  rows={1}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                  placeholder="Type a manual WhatsApp message reply..."
                  className="flex-1 bg-slate-950 border border-slate-850 focus:border-emerald-500/40 rounded-xl p-3 text-xs text-slate-100 outline-none resize-none max-h-20 min-h-[42px]"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="h-10 w-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                >
                  {sendingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-extrabold text-slate-100 text-sm mb-1">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                Choose a customer from the left directory to view full message histories and transmit manual support responses.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
