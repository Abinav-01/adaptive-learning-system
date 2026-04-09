import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { MessageCircle, X, Send, Sparkles, Volume2, Mic, MicOff } from "lucide-react";
import VoiceOrb from "./VoiceOrb";

export default function AITutor({ slide, voiceEnabled, onCommandNext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false); // Master trigger for Voice Mode logic
  const [voiceState, setVoiceState] = useState("idle"); // idle | listening | thinking | speaking
  const messagesEndRef = useRef(null);
  const lastSpokenTextRef = useRef("");

  // --- Voice Synthesis Setup ---
  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setVoiceState("idle");
    }
  }, []);

  const speakText = useCallback((text) => {
    if (!audioEnabled || !("speechSynthesis" in window) || !text) return;
    
    stopSpeech();
    lastSpokenTextRef.current = text;
    setVoiceState("speaking");
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    if (englishVoices.length > 0) {
      const bestVoice = englishVoices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || englishVoices[0];
      utterance.voice = bestVoice;
    }
    
    utterance.onend = () => {
      setVoiceState("listening");
    };

    utterance.onerror = () => setVoiceState("listening");
    
    window.speechSynthesis.speak(utterance);
  }, [audioEnabled, stopSpeech]);

  // --- Voice Recognition Setup (Stable Implementation) ---
  const recognitionRef = useRef(null);
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const hasRecognition = !!SpeechRecognition;

  useEffect(() => {
    if (!hasRecognition) return;

    // Create stable instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Listening started");
      setVoiceState("listening");
    };

    recognition.onresult = (event) => {
      // 1. Interrupt System: AI stops talking immediately when user starts
      if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        const transcript = finalTranscript.toLowerCase();
        console.log("Transcript:", transcript);

        // Intent detection (Simple)
        if (transcript.includes("next slide") || transcript.includes("continue lesson")) {
          if (onCommandNext) onCommandNext();
          speakText("Moving to the next step.");
        } else if (transcript.includes("repeat that") || transcript.includes("say again")) {
          speakText(lastSpokenTextRef.current);
        } else {
          // Trigger AI Response
          askTutor(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setVoiceState("idle");
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      // Auto-restart if voice mode is still active
      if (audioEnabled && voiceEnabled) {
        console.log("Auto-restarting recognition...");
        try {
          recognition.start();
        } catch (e) {
          console.error("Restart failed:", e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioEnabled, voiceEnabled, hasRecognition]); // Re-bind when toggles change

  // Control start/stop based on master toggle
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    if (audioEnabled && voiceEnabled) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started or busy
      }
    } else {
      recognitionRef.current.stop();
      stopSpeech();
    }
  }, [audioEnabled, voiceEnabled]);

  // AUTO-NARRATION on Slide Change
  useEffect(() => {
    if (audioEnabled && slide) {
      const narrationText = slide.narration || `${slide.title}. ${slide.bullets?.join('. ')}`;
      setTimeout(() => speakText(narrationText), 1000);
    }
    if (!isOpen) { 
       setMessages([{ role: "assistant", content: "Hi! I'm listening. Just speak your question or ask me to explain this concept." }]);
    }
  }, [slide?.title, audioEnabled, speakText]);

  const askTutor = async (text) => {
    if (!text || !text.trim() || loading || !slide) return;

    setVoiceState("thinking");
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post("/ai/ask", {
        question: text,
        context: {
          title: slide.title || "",
          bullets: slide.bullets || [],
          formula: slide.formula || "",
          narration: slide.narration || "",
          example_steps: slide.example_steps || []
        },
      });
      const answerText = res.data.answer;
      setMessages((prev) => [...prev, { role: "assistant", content: answerText }]);
      speakText(answerText);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I had a connection glitch. Could you repeat that?" }]);
      setVoiceState("listening");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  return (
    <>
      <div className={`fixed right-10 bottom-24 z-40 transition-all duration-500 scale-125 ${audioEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
         <VoiceOrb state={loading ? "thinking" : voiceState} />
      </div>

      <div className={`fixed right-6 bottom-6 z-40 transition-opacity opacity-100`}>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-[#111] border border-emerald-500/30 text-white px-5 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all font-semibold"
          >
            <Sparkles size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            {audioEnabled ? "Voice Mode Active" : "Ask AI Tutor"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed right-6 bottom-6 z-50 w-80 md:w-96 bg-[#1a1a1a] border border-[#333] shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#222] border-b border-[#333] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                {audioEnabled ? <Volume2 size={18} /> : <Sparkles size={18} />}
                {audioEnabled ? "Hands-Free Tutor" : "AI Tutor"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  disabled={!hasRecognition}
                  className={`text-xs px-3 py-1.5 flex items-center gap-2 font-bold rounded-full transition-all ${!hasRecognition ? 'opacity-50 cursor-not-allowed bg-[#333]' : audioEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#333] text-gray-400 hover:text-white'}`}
                  title={!hasRecognition ? "Voice Recognition not supported in this browser" : audioEnabled ? "Turn off Voice Mode" : "Turn on Voice Mode"}
                >
                  {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  {audioEnabled ? "Voice ON" : "Voice Mode"}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-[#111]">
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white self-end rounded-br-none' : 'bg-[#2a2a2a] text-gray-200 self-start rounded-bl-none border border-[#333]'}`}>
                  <div className="flex items-start gap-2 justify-between">
                    <span>{m.content}</span>
                    {m.role === 'assistant' && (
                      <button onClick={() => speakText(m.content)} className="flex-shrink-0 mt-0.5 text-gray-500 hover:text-emerald-400 bg-transparent p-0"><Volume2 size={12} /></button>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="bg-[#2a2a2a] text-gray-400 self-start rounded-xl px-4 py-2 text-sm animate-pulse">Thinking...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input fallback */}
            <div className="p-4 bg-[#111] border-t border-[#333]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askTutor(query)}
                  placeholder={audioEnabled ? "Voice mode listening..." : "Ask your tutor..."}
                  className="w-full bg-[#222] border border-[#333] text-white rounded-full pl-4 pr-12 py-2 outline-none focus:border-emerald-500 text-sm"
                />
                <button onClick={() => askTutor(query)} className="absolute right-2 p-1.5 text-emerald-500 hover:text-emerald-400"><Send size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
