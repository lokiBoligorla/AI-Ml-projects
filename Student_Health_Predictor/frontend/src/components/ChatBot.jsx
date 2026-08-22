import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { chatbotAPI } from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your WellnessAI counselor. How are you feeling today? Ask me about sleep improvement, study routines, digital detoxes, or relationship stress!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await chatbotAPI.sendMessage(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm sorry, I'm having a little trouble connecting right now. Please remember that taking small breaks, staying hydrated, and box-breathing are great instant tools to ground yourself!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 border border-primary-400/20 shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          {/* Pulsing Outer Rings */}
          <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping opacity-75"></div>
          <MessageSquare className="h-6 w-6 text-white group-hover:rotate-6 transition-transform" />
          
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-purple-500 rounded-full border-2 border-dark-bg flex items-center justify-center">
            <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-dark-bg/95 border border-white/10 shadow-2xl shadow-primary-500/10 backdrop-blur-xl flex flex-col overflow-hidden animate-slide-up">
          {/* Chat Window Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-900/60 to-purple-900/40 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Wellness Assistant</h3>
                  <Sparkles className="h-3 w-3 text-purple-400" />
                </div>
                <p className="text-[10px] text-primary-400">Contextual Clinical Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Chat Message Logs Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex-shrink-0 flex items-center justify-center">
                    <Bot className="h-4.5 w-4.5 text-primary-400" />
                  </div>
                )}
                <div className={`
                  px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md
                  ${msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Thinking / Loading bubble */}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex-shrink-0 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-primary-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 rounded-tl-none flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Form Input */}
          <form 
            onSubmit={handleSend}
            className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a stress question..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-900/50 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
