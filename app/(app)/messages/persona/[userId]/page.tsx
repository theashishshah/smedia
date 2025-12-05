"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import { motion, AnimatePresence } from "framer-motion";

type UIMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
};

type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function PersonaChatPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [targetUser, setTargetUser] = useState<any>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch target user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // We can reuse the conversations API if we already chatted,
        // or simpler: just fetch public profile info?
        // For now, let's assume we can fetch via a simple API or just display generic until we have a dedicated user fetch endpoint.
        // Wait, I can use the same get messages API to get user info if I refactor it,
        // but checking `api/messages/[userId]` returns messages.
        // Let's create a quick "get user" helper or just rely on what we have.
        // Actually, for persona, we don't strictly need the user object from DB if we just want to chat.
        // But showcasing the name is nice.
        // Let's try to fetch from a new endpoint or existing one.
        // Since I don't have a direct "get user by id" public API, I will just show "Persona" for now
        // OR better, I can assume the user passed the name in query param? No, that's messy.
        // I'll make a lightweight fetch to `api/conversations` (inefficient) or just fetch `/api/users/${userId}` if I make one.
        // Let's stick to "Chat with Persona" title if user fetch is hard,
        // BUT I see `post.author` in other places.
        // Let's just mock the name loading or use a placeholder,
        // as I don't have a "get user details" API ready and don't want to overengineer.
        // Wait, I can use `api/messages/[userId]`? No that returns messages.
        // I'll leave the name generic "Persona" or "User" for now to save time,
        // or fetching it client side from a new route is easy.
        // Let's create `api/users/[id]/route.ts` quickly?
        // No, let's just use "Advisor" or "AI Persona" as default.
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [userId]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const chatHistory: LLMMessage[] = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    chatHistory.push({ role: "user", content: userMsg.text });

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      if (data.reply) {
        const botMsg: UIMessage = {
          id: crypto.randomUUID(),
          sender: "assistant",
          text: data.reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr] min-h-screen">
      <Navbar />

      <section className="flex flex-col h-[85vh] md:h-[90vh] gap-4">
        <Topbar />

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <div className="font-semibold text-foreground flex items-center gap-2">
              <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded text-xs border border-purple-500/20">
                AI
              </span>
              Chatting with Persona
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-muted/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-purple-600 text-white rounded-full p-2 hover:opacity-90 disabled:opacity-50 transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
