import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatReply, type ChatMessage } from "@/lib/tools.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — FumanAI" },
      { name: "description", content: "A general-purpose AI assistant built into FumanAI." },
      { property: "og:title", content: "AI Chat — FumanAI" },
      { property: "og:description", content: "General-purpose AI assistant." },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "fumanai.chat.v1";

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const fn = useServerFn(chatReply);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
    taRef.current?.focus();
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const { reply } = await fn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed.");
    } finally {
      setPending(false);
      setTimeout(() => taRef.current?.focus(), 0);
    }
  }

  function clearChat() {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-6 md:py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">AI Chat</h1>
          <p className="text-sm text-muted-foreground">Brainstorming, interview prep, negotiation — ask anything.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}><Trash2 className="mr-1 h-4 w-4" /> Clear</Button>
        )}
      </div>

      <Card className="mt-4 flex flex-1 flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              Start a conversation. Your messages are stored locally in this browser only.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2 text-sm"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <Textarea
              ref={taRef}
              rows={2}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              className="min-h-[44px] resize-none"
            />
            <Button onClick={() => void send()} disabled={!input.trim() || pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}