import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

import GlassCard from '../components/GlassCard';

const AIAdvisor = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I am **TaskFlow Finance AI**, your personal financial planning assistant. I have analyzed your UPI and bank transaction profiles.\n\nAsk me about setting up a custom student budget, analyzing food app expenses, or generating a plan to boost savings by 20%!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickRecs, setQuickRecs] = useState([
    "Create a 15% student savings plan",
    "How can I save money on hostel food?",
    "Explain my recent spending anomalies"
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/ai-advisor/chat', { message: textToSend });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
      if (res.data.recommendations && res.data.recommendations.length > 0) {
        setQuickRecs(res.data.recommendations);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting to my cognitive networks. Please verify your internet connection or check API keys." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          AI Financial Advisor
        </h2>
        <p className="text-gray-300 text-sm">
          Interactive natural dialogue powered by Google Gemini and tailored directly to your student or household expense records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat window panel */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="h-[550px] flex flex-col justify-between p-0 overflow-hidden relative" hoverEffect={false}>
            {/* Top Bar inside chat card */}
            <div className="px-6 py-4 bg-black/40 border-b border-glassBorder flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neonBlue to-neonPurple flex items-center justify-center shadow-neon-glow">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">TaskFlow Advisor Bot</h3>
                <span className="text-[10px] text-neonGreen font-semibold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neonGreen animate-ping"></span> Active Consultation
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-neonBlue/15 text-neonBlue flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      AI
                    </div>
                  )}
                  
                  <div className={`
                    max-w-md p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-r from-neonBlue to-neonPurple text-white rounded-tr-none' 
                      : 'bg-glassBorder/40 text-gray-200 border border-glassBorder rounded-tl-none'
                    }
                  `}>
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-neonPurple/15 text-neonPurple flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase">
                      ME
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-neonBlue/15 text-neonBlue flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    AI
                  </div>
                  <div className="bg-glassBorder/40 text-gray-300 border border-glassBorder p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box Footer */}
            <div className="p-4 border-t border-glassBorder bg-black/20">
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full glass-input pr-12 text-sm bg-black/40 border border-glassBorder/50 py-3.5"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:shadow-neon-glow hover:brightness-110 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Click Advice Cards */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Quick Topics" hoverEffect={false}>
            <div className="flex gap-2 text-xs items-start bg-glassBorder/20 p-3.5 rounded-xl text-gray-300 leading-normal mb-4">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-neonPurple" />
              <span>Click any of these AI suggested action prompts to instantly generate detailed financial planning recommendations.</span>
            </div>

            <div className="space-y-2.5">
              {quickRecs.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(rec)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-xl border border-glassBorder bg-white/5 text-xs text-gray-300 font-bold hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate pr-2">{rec}</span>
                  <ArrowRight size={14} className="shrink-0 group-hover:translate-x-1 transition-transform text-neonBlue" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Rule Book Guidelines" hoverEffect={false}>
            <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed">
              <div className="flex gap-2 items-start">
                <BookOpen size={16} className="shrink-0 mt-0.5 text-neonBlue" />
                <span>**50-30-20 Rule**: Keep essential student costs below 50% and allocate 20% into your savings wallet immediately.</span>
              </div>
              <div className="flex gap-2 items-start">
                <BookOpen size={16} className="shrink-0 mt-0.5 text-neonBlue" />
                <span>**Mess Hall Rule**: Prepay student dining coupons to prevent impulse delivery food app expenditure leaks.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
