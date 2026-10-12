import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Send, Bot, Sparkles, Maximize2, Minimize2, 
  Trash2, Settings, Calendar, MapPin, 
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getChatbotResponse } from '../../services/eventChatbotService';

const SUGGESTED_QUESTIONS = [
  { label: '🗓️ Planning Checklist', query: 'Can you provide a step-by-step event planning checklist and timeline?' },
  { label: '💰 Budget Breakdown', query: 'What is the recommended budget allocation and break-even formula for an event?' },
  { label: '📢 Marketing Strategy', query: 'How do I promote my event and sell out tickets through email and social media?' },
  { label: '🤝 Sponsorship Decks', query: 'How do I pitch sponsors and structure sponsorship tiers?' },
  { label: '🏢 Venue Checklist', query: 'What are the key things to inspect and negotiate when choosing a venue?' },
  { label: '🎬 AV & Sound Setup', query: 'What audio-visual, lighting, and technical equipment is required for a conference?' },
  { label: '🔍 Tech Events on RSR', query: 'Show me upcoming technology and AI events on the RSR platform' },
  { label: '📝 How to List Event', query: 'How can an organizer list a new event on this portal?' }
];

export default function EventChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('rsr_gemini_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  
  const { events } = useStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `👋 Hi! I'm **EventGenie**, your AI Event Management Assistant.
        
I can help you with:
* 📋 **End-to-End Planning:** Timelines, budgets, venue sourcing & logistics.
* 📢 **Marketing & Ticketing:** Promotions, early-bird sales, and sponsor pitch decks.
* 🎬 **Production & AV:** Sound, lighting, stage design, and day-of operations.
* 🎟️ **RSR Portal Guidance:** Finding events, booking tickets, QR check-ins, and organizer dashboards.

Ask me any event question below, or tap one of the suggested topics to get started!`,
        matchedEvents: []
      }
    ];
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-rsr-chatbot', handleOpen);
    return () => window.removeEventListener('open-rsr-chatbot', handleOpen);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(query, events, apiKey);
      const botMsg = {
        id: crypto.randomUUID(),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        matchedEvents: response.matchedEvents || [],
        source: response.source
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ I encountered an error while processing your request. Please try again!`,
          matchedEvents: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Chat cleared! How can I assist you with your event management needs today?`,
          matchedEvents: []
        }
      ]);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('rsr_gemini_api_key', tempApiKey.trim());
    setApiKey(tempApiKey.trim());
    setShowSettings(false);
  };

  // Helper to parse simple markdown to clean HTML elements
  const renderFormattedText = (content) => {
    // Split into lines
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 mt-2.5 mb-1.5">{formatInline(line.slice(4))}</h3>;
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-blue-900 mt-2 mb-1">{formatInline(line.slice(5))}</h4>;
      }
      // Bullet list
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-700 my-0.5 ml-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
      }
      // Sub-bullet
      if (line.startsWith('  * ') || line.startsWith('  - ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 my-0.5 ml-5">
            <span className="text-gray-400 font-bold">◦</span>
            <span>{formatInline(line.slice(4))}</span>
          </div>
        );
      }
      // Horizontal rule
      if (line.trim() === '---') {
        return <hr key={idx} className="my-2 border-slate-200" />;
      }
      // Code block
      if (line.startsWith('```')) {
        return null;
      }
      // Normal paragraph
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">
          {formatInline(line)}
        </p>
      );
    });
  };

  // Helper for inline markdown like **bold**, *italic*, `code`, and [links](/url)
  const formatInline = (text) => {
    // Regex matching bold, code, links
    const parts = [];
    let remaining = text;
    let keyCounter = 0;

    while (remaining.length > 0) {
      // Check link [title](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [full, linkText, url] = linkMatch;
        parts.push(
          <button
            key={keyCounter++}
            onClick={() => {
              if (url.startsWith('/')) {
                navigate(url);
                if (window.innerWidth < 640) setIsOpen(false);
              } else {
                window.open(url, '_blank');
              }
            }}
            className="text-blue-700 underline font-medium hover:text-blue-900 inline-flex items-center gap-0.5"
          >
            {linkText}
          </button>
        );
        remaining = remaining.slice(full.length);
        continue;
      }

      // Check bold **bold**
      const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
      if (boldMatch) {
        parts.push(<strong key={keyCounter++} className="font-semibold text-slate-900">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check code `code`
      const codeMatch = remaining.match(/^`(.*?)`/);
      if (codeMatch) {
        parts.push(<code key={keyCounter++} className="px-1 py-0.5 bg-slate-100 rounded text-pink-600 text-xs font-mono">{codeMatch[1]}</code>);
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check italic *italic*
      const italicMatch = remaining.match(/^\*(.*?)\*/);
      if (italicMatch) {
        parts.push(<em key={keyCounter++} className="italic text-slate-700">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain char/word chunk
      const nextSpecial = remaining.search(/(\[|\*\*|`|\*)/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur shadow-lg border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>Ask EventGenie AI</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Event Management Assistant"
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-full shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Bot className="w-7 h-7 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chatbot Window Container */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] md:w-[460px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    EventGenie AI
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1.5 py-0.2 rounded-full font-medium">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">Event Planning & Portal Expert</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="AI Settings / API Key"
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="hidden sm:block p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Settings Panel (Collapsible) */}
          {showSettings && (
            <div className="p-3.5 bg-blue-50/90 border-b border-blue-100 text-xs text-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  Gemini API Configuration (Optional)
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                The chatbot works 100% with its built-in professional Event Knowledge Base. If you wish to connect dynamic Google Gemini API generation, enter your key below:
              </p>
              <form onSubmit={handleSaveSettings} className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="flex-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition"
                >
                  Save
                </button>
              </form>
            </div>
          )}

          {/* Quick Suggested Topic Chips */}
          <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 overflow-x-auto scrollbar-hide flex gap-1.5 shrink-0">
            {SUGGESTED_QUESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSend(item.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition shadow-xs"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                        isUser
                          ? 'bg-blue-700 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-1">
                          {renderFormattedText(msg.text)}

                          {/* Render Rich Event Cards if portal events matched */}
                          {msg.matchedEvents && msg.matchedEvents.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Featured Matches
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {msg.matchedEvents.map((evt) => (
                                  <div
                                    key={evt.id}
                                    onClick={() => {
                                      navigate(`/events/${evt.id}`);
                                      if (window.innerWidth < 640) setIsOpen(false);
                                    }}
                                    className="cursor-pointer group flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/70 rounded-xl border border-slate-200/80 hover:border-blue-300 transition"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="font-semibold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                                        {evt.title}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                          {evt.city}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5">
                                          <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                          {evt.date}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="shrink-0 text-blue-700 group-hover:translate-x-0.5 transition-transform">
                                      <ChevronRight className="w-4 h-4" />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1 mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Nav Shortcuts Footer */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Ask anything about events
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigate('/events');
                  if (window.innerWidth < 640) setIsOpen(false);
                }}
                className="hover:text-blue-700 underline"
              >
                Browse All Events
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  navigate('/create-event');
                  if (window.innerWidth < 640) setIsOpen(false);
                }}
                className="hover:text-blue-700 underline"
              >
                List Event
              </button>
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 px-3 py-1.5 transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about planning, budgeting, sponsors, tickets..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:hover:bg-blue-700 text-white rounded-lg transition shadow-xs flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
