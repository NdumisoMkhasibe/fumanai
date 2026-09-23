import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "react-oidc-context";

import {
  chatReply,
  type ChatMessage,
} from "@/lib/chat-api";

import {
  Card,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Loader2,
  Send,
  Trash2,
} from "lucide-react";

import {
  toast,
} from "sonner";


export const Route =
  createFileRoute("/chat")({
    head: () => ({
      meta: [
        {
          title:
            "AI Chat — FumanAI",
        },
        {
          name:
            "description",
          content:
            "A general-purpose AI assistant built into FumanAI.",
        },
        {
          property:
            "og:title",
          content:
            "AI Chat — FumanAI",
        },
        {
          property:
            "og:description",
          content:
            "General-purpose AI assistant.",
        },
      ],
    }),

    component:
      ChatPage,
  });


const STORAGE_KEY =
  "fumanai.chat.v1";


function ChatPage() {
  const auth =
    useAuth();


  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);


  const [
    input,
    setInput,
  ] =
    useState("");


  const [
    pending,
    setPending,
  ] =
    useState(false);


  const scrollRef =
    useRef<
      HTMLDivElement
    >(null);


  const taRef =
    useRef<
      HTMLTextAreaElement
    >(null);


  const accessToken =
    auth.user
      ?.access_token;


  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (raw) {
        const parsed =
          JSON.parse(raw);


        if (
          Array.isArray(
            parsed
          )
        ) {
          setMessages(
            parsed
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load local chat:",
        error
      );
    }


    taRef.current
      ?.focus();
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          messages
        )
      );
    } catch (error) {
      console.error(
        "Failed to save local chat:",
        error
      );
    }


    scrollRef.current
      ?.scrollTo({
        top:
          scrollRef.current
            .scrollHeight,

        behavior:
          "smooth",
      });
  }, [messages]);


  async function send() {
    const text =
      input.trim();


    if (
      !text ||
      pending
    ) {
      return;
    }


    if (!accessToken) {
      toast.error(
        "You must be signed in"
      );

      return;
    }


    const next:
      ChatMessage[] = [
        ...messages,

        {
          role:
            "user",

          content:
            text,
        },
      ];


    setMessages(
      next
    );

    setInput("");

    setPending(true);


    try {
      const {
        reply,
      } =
        await chatReply(
          {
            messages:
              next,
          },
          accessToken
        );


      setMessages([
        ...next,

        {
          role:
            "assistant",

          content:
            reply,
        },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chat failed."
      );
    } finally {
      setPending(false);


      setTimeout(
        () =>
          taRef.current
            ?.focus(),
        0
      );
    }
  }


  function clearChat() {
    setMessages([]);


    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Failed to clear local chat:",
        error
      );
    }
  }


  if (
    auth.isLoading
  ) {
    return (
      <div className="p-12" />
    );
  }


  if (
    !auth.isAuthenticated ||
    !accessToken
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold">
            Sign in to use AI Chat
          </h1>

          <p className="mt-2 text-muted-foreground">
            Sign in to chat with FumanAI.
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              auth.signinRedirect()
            }
          >
            Sign in
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-6 py-6 md:py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            AI Chat
          </h1>

          <p className="text-sm text-muted-foreground">
            Brainstorming, interview prep, negotiation — ask anything.
          </p>
        </div>


        {messages.length >
          0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={
              clearChat
            }
          >
            <Trash2 className="mr-1 h-4 w-4" />

            Clear
          </Button>
        )}
      </div>


      <Card className="mt-4 flex flex-1 flex-col overflow-hidden p-0">
        <div
          ref={
            scrollRef
          }
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {messages.length ===
            0 && (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              Start a conversation. Your messages are currently stored locally in this browser.
            </div>
          )}


          {messages.map(
            (
              message,
              index
            ) => (
              <div
                key={
                  index
                }
                className={
                  message.role ===
                  "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role ===
                    "user"
                      ? "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                      : "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2 text-sm"
                  }
                >
                  {
                    message.content
                  }
                </div>
              </div>
            )
          )}


          {pending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                <Loader2 className="inline h-3.5 w-3.5 animate-spin" />

                {" "}
                Thinking…
              </div>
            </div>
          )}
        </div>


        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <Textarea
              ref={
                taRef
              }
              rows={2}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={
                input
              }
              onChange={(
                event
              ) =>
                setInput(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  void send();
                }
              }}
              className="min-h-[44px] resize-none"
            />


            <Button
              onClick={() =>
                void send()
              }
              disabled={
                !input.trim() ||
                pending
              }
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
  
}