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
  ArrowLeft,
  CheckCheck,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video
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
      <div className="h-[calc(100vh-140px)] bg-[#0b141a] border border-[#222e35] rounded-3xl overflow-hidden flex relative shadow-2xl">
        
        {/* Left Side Panel: Customers List (WhatsApp style sidebar) */}
        <div className={`w-full md:w-80 h-full flex flex-col border-r border-[#222e35] bg-[#111b21] ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Sidebar Header */}
          <div className="p-3 bg-[#202c33] flex justify-between items-center text-[#d1d7db] h-15 border-b border-[#222e35]/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#00a884]/10 border border-[#00a884]/20 flex items-center justify-center">
                <MessageSquare className="w-5.5 h-5.5 text-[#00a884]" />
              </div>
              <span className="font-extrabold text-sm text-[#e9edef]">Active Chats</span>
            </div>
            <div className="flex space-x-1">
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#374248] text-[#aebac1] transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#374248] text-[#aebac1] transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search container */}
          <div className="p-2 border-b border-[#222e35] bg-[#111b21]">
            <div className="relative flex items-center bg-[#202c33] rounded-xl px-3 py-1">
              <Search className="w-4 h-4 text-[#677983] mr-2" />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 bg-transparent text-xs text-[#d1d7db] outline-none placeholder-[#677983]"
              />
            </div>
          </div>

          {/* Contact directory list */}
          <div className="flex-1 overflow-y-auto bg-[#111b21] divide-y divide-[#222e35]/40">
            {loadingCustomers ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#00a884]" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <p className="text-center text-xs text-[#8696a0] py-8">No chats found.</p>
            ) : (
              filteredCustomers.map(cust => {
                const isSelected = selectedCust?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`w-full text-left px-4 py-3.5 flex items-center space-x-3.5 transition-all ${
                      isSelected 
                        ? 'bg-[#2a3942]' 
                        : 'hover:bg-[#202c33]/40 text-[#d1d7db]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#202c33] border border-[#2f3b43] text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <User className="w-5.5 h-5.5 text-[#aebac1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-xs font-black text-[#e9edef] truncate">{cust.name}</p>
                        {!isSelected && (
                          <span className="text-[8px] text-[#8696a0] bg-[#202c33] border border-[#2f3b43]/30 px-1.5 py-0.5 rounded font-semibold">{cust.conversationStep}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8696a0] font-mono truncate">
                        +{cust.whatsappNumber}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Panel: Chat Viewport (WhatsApp Web layout) */}
        <div className={`flex-1 h-full flex flex-col bg-[#0b141a] relative ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedCust ? (
            <>
              {/* Header details */}
              <div className="h-15 px-4 border-b border-[#222e35] flex items-center justify-between bg-[#202c33] text-[#d1d7db]">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#374248] text-[#aebac1] active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#e9edef]" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[#111b21] border border-[#2f3b43] flex items-center justify-center flex-shrink-0">
                    <User className="w-5.5 h-5.5 text-[#aebac1]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#e9edef] leading-tight">{selectedCust.name}</h4>
                    <span className="text-[10px] text-[#8696a0] font-mono">+{selectedCust.whatsappNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-[#aebac1]">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStepBadge(selectedCust.conversationStep)}`}>
                    Step: {selectedCust.conversationStep}
                  </span>
                  <button className="hover:text-[#e9edef] transition-colors"><Video className="w-5 h-5" /></button>
                  <button className="hover:text-[#e9edef] transition-colors"><Phone className="w-4 h-4" /></button>
                  <button 
                    onClick={() => fetchChatHistory(selectedCust.whatsappNumber, true)}
                    className="hover:text-[#e9edef] transition-colors active:scale-95"
                    title="Refresh logs"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#e9edef] transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Chat messages viewport with custom background pattern */}
              <div 
                ref={chatContainerRef} 
                className="flex-1 overflow-y-auto p-6 space-y-4"
                style={{
                  backgroundColor: '#0b141a',
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}
              >
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00a884]" />
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
                        <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-sm border ${
                          isSystem 
                            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none border-[#005c4b]' 
                            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border-[#2f3b43]/30'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className="flex items-center justify-end space-x-1.5 mt-1">
                            <span className="text-[8px] font-mono text-[#8696a0]">
                              {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSystem && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Reply Area */}
              <form onSubmit={handleSendReply} className="p-3 bg-[#202c33] border-t border-[#222e35] flex gap-3 items-center">
                <button type="button" className="text-[#aebac1] hover:text-[#e9edef] transition-colors"><Smile className="w-5.5 h-5.5" /></button>
                <button type="button" className="text-[#aebac1] hover:text-[#e9edef] transition-colors"><Paperclip className="w-5 h-5" /></button>

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
                  placeholder="Type a message"
                  className="flex-1 bg-[#2a3942] border-none text-[#d1d7db] placeholder-[#8696a0] rounded-xl px-4 py-2.5 text-xs outline-none resize-none max-h-20 min-h-[38px] leading-relaxed"
                />
                
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="h-10 w-10 bg-[#00a884] hover:bg-[#00c298] text-[#e9edef] rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 shadow-sm"
                >
                  {sendingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4.5 h-4.5 stroke-[2.5]" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#222e35]/10">
              <div className="w-16 h-16 bg-[#202c33] border border-[#2f3b43] rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#00a884]" />
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
