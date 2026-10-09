'use client';

import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  whatsappPhone?: string;
}

export function WhatsAppFloatingButton({ whatsappPhone = '919342365917' }: WhatsAppFloatingButtonProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    'Hi Skandiv Natural Oils! 🌿 I am browsing your website and have a question about your products.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2">
      
      {/* Interactive Tooltip Pop-up */}
      {showTooltip && (
        <div className="bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-2xl p-3.5 shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-start space-x-2.5 pr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-100">Order & Chat on WhatsApp</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Ask about pure Mara Chekku oils or order instantly with 1-click WhatsApp checkout!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl shadow-emerald-950/60 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-full" />
        
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
        </svg>
      </a>

    </div>
  );
}
