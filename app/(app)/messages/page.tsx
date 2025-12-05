"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";

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

export default function MessagesPage() {
    const personaName = "User...";
    const personaImage = "/meme.png";

    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 🟢 Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // 🟢 Load chat history from localStorage on first render
    useEffect(() => {
        const saved = localStorage.getItem("chat-messages");
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    // 🟢 Save messages in localStorage
    useEffect(() => {
        localStorage.setItem("chat-messages", JSON.stringify(messages));
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: UIMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Build history for backend
        const chatHistory: LLMMessage[] = [
            ...(JSON.parse(localStorage.getItem("chat-history") || "[]") as LLMMessage[]),
            { role: "user", content: input.trim() },
        ];

        localStorage.setItem("chat-history", JSON.stringify(chatHistory));

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
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };

                setMessages((prev) => [...prev, botMsg]);

                chatHistory.push({ role: "assistant", content: data.reply });
                localStorage.setItem("chat-history", JSON.stringify(chatHistory));
            } else {
                console.error("No reply from server.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr] min-h-screen text-white">
            <Navbar />

            <section className="space-y-6 flex flex-col h-[90vh]">
                <Topbar />

                {/* Chat container */}
                <div className="flex flex-col flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    {/* Chat body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${
                                        msg.sender === "assistant" ? "justify-start" : "justify-end"
                                    }`}
                                >
                                    {msg.sender === "assistant" ? (
                                        <div className="flex items-start gap-3 max-w-[80%]">
                                            <div>
                                                <div className="rounded-2xl px-4 py-2 bg-zinc-800 text-white text-sm md:text-base leading-relaxed">
                                                    {msg.text}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {personaName} • {msg.time}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end max-w-[80%]">
                                            <div className="rounded-2xl px-4 py-2 bg-blue-600 text-white text-sm md:text-base leading-relaxed">
                                                {msg.text}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">
                                                You • {msg.time}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* 🟣 Typing animation */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-start gap-3 max-w-[80%]">
                                        <div className="rounded-2xl px-4 py-2 bg-zinc-800 text-zinc-400 text-sm flex gap-1">
                                            <motion.span
                                                className="w-2 h-2 bg-zinc-400 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-zinc-400 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    delay: 0.2,
                                                }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-zinc-400 rounded-full"
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    delay: 0.4,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input bar */}
                    <footer className="p-4 border-t border-zinc-800 flex items-center gap-3 bg-zinc-950">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={`Chat with ${personaName}...`}
                            className="flex-1 text-white placeholder-zinc-500 border border-zinc-700 bg-zinc-900 focus-visible:ring-0 focus-visible:border-blue-600"
                        />
                        <Button
                            onClick={handleSend}
                            size="icon"
                            variant="secondary"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </footer>
                </div>
            </section>
        </main>
    );
}

// import Navbar from "@/app/components/Navbar";
// import Topbar from "@/app/components/Topbar";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/libs/auth-options";
// import { redirect } from "next/navigation";

// const demoMessages = [
//     { id: 1, name: "Piyush", message: "Hey! You checked React 19 yet?" },
//     { id: 2, name: "BuildInPublic", message: "Love your smedia project 👏" },
// ];

// export default async function MessagesPage() {
//     const session = await getServerSession(authOptions);
//     if (!session) redirect("/login");
//     return (
//         <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
//             <Navbar />

//             <section className="space-y-6">
//                 <Topbar />
//                 <div className="rounded-2xl border border-zinc-800 p-4 space-y-4">
//                     {demoMessages.map((m) => (
//                         <div key={m.id} className="rounded-lg bg-zinc-900/50 p-4">
//                             <h3 className="font-semibold text-white">{m.name}</h3>
//                             <p className="text-zinc-400 text-sm">{m.message}</p>
//                         </div>
//                     ))}
//                 </div>
//             </section>
//         </main>
//     );
// }
