"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import Link from "next/link";
import { cn } from "@/libs/utils";

type User = {
  id: string;
  name: string;
  image?: string;
  email: string;
};

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};

type Conversation = {
  user: User;
  lastMessage: string;
  updatedAt: string;
};

import { Suspense } from "react";

function MessagesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [messages]); // Refresh when local messages change

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        // setLoading(true); // Don't show full loader on polling
        const res = await fetch(`/api/messages/${selectedUserId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [selectedUserId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedUserId || sending) return;

    const text = inputText;
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`/api/messages/${selectedUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setInputText(text); // Revert on failure
    } finally {
      setSending(false);
    }
  };

  const selectedUser = conversations.find(
    (c) => c.user.id === selectedUserId
  )?.user;

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr] min-h-screen">
      <Navbar />

      <section className="flex flex-col h-[85vh] md:h-[90vh] gap-4">
        <Topbar />

        <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Sidebar / Conversation List */}
          <div
            className={cn(
              "w-full md:w-1/3 border-r border-border flex flex-col bg-muted/20",
              selectedUserId ? "hidden md:flex" : "flex"
            )}
          >
            <div className="p-4 border-b border-border font-semibold text-lg text-foreground">
              Messages
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((c) => (
                  <Link
                    key={c.user.id}
                    href={`/messages?userId=${c.user.id}`}
                    className={cn(
                      "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50",
                      selectedUserId === c.user.id && "bg-muted"
                    )}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0">
                      {c.user.image ? (
                        <Image
                          src={c.user.image}
                          alt={c.user.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-zinc-700 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {c.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.lastMessage}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-background",
              !selectedUserId ? "hidden md:flex" : "flex"
            )}
          >
            {!selectedUserId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <MessageSquareIcon className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a conversation to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border flex items-center gap-3 bg-muted/20">
                  <button
                    onClick={() => router.push("/messages")}
                    className="md:hidden p-1 -ml-1 text-muted-foreground"
                  >
                    ←
                  </button>
                  <div className="font-semibold text-foreground">
                    {selectedUser ? selectedUser.name : "Chat"}
                  </div>
                  {/* Persona Chat Link could go here */}
                  <Link
                    href={`/messages/persona/${selectedUserId}`}
                    className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition"
                  >
                    Chat with AI Persona
                  </Link>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading && messages.length === 0 ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === (session?.user as any)?.id;
                      return (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-border bg-muted/10"
                >
                  <div className="flex gap-2">
                    <input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="bg-primary text-primary-foreground rounded-full p-2 hover:opacity-90 disabled:opacity-50 transition"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
