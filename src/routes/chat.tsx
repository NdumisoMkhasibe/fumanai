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
} from "@/lib/chat-api";

import {
  clearChatMessages,
  getChatMessages,
  saveChatMessage,
  type StoredChatMessage,
} from "@/lib/chat-history-api";

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


function ChatPage() {
  const auth =
    useAuth();


  const [
    messages,
    setMessages,
  ] =
    useState<
      StoredChatMessage[]
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


  const [
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(true);


  const [
    clearing,
    setClearing,
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
    if (
      !accessToken
    ) {
      setLoadingHistory(
        false
      );

      return;
    }


    let active =
      true;


    async function loadHistory() {
      setLoadingHistory(
        true
      );


      try {
        const history =
          await getChatMessages(
            accessToken
          );


        if (active) {
          setMessages(
            history
          );
        }
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load chat history."
          );
        }
      } finally {
        if (active) {
          setLoadingHistory(
            false
          );
        }
      }
    }


    void loadHistory();


    return () => {
      active =
        false;
    };
  }, [accessToken]);


  useEffect(() => {
    scrollRef.current
      ?.scrollTo({
        top:
          scrollRef.current
            .scrollHeight,

        behavior:
          "smooth",
      });
  }, [
    messages,
    pending,
  ]);


  useEffect(() => {
    if (
      !loadingHistory
    ) {
      taRef.current
        ?.focus();
    }
  }, [
    loadingHistory,
  ]);


  async function send() {
    const text =
      input.trim();


    if (
      !text ||
      pending ||
      loadingHistory
    ) {
      return;
    }


    if (!accessToken) {
      toast.error(
        "You must be signed in"
      );

      return;
    }


    setInput("");

    setPending(true);


    try {
      const savedUserMessage =
        await saveChatMessage(
          "user",
          text,
          accessToken
        );


      const nextMessages =
        [
          ...messages,
          savedUserMessage,
        ];


      setMessages(
        nextMessages
      );


      const aiMessages =
        nextMessages.map(
          (message) => ({
            role:
              message.role,

            content:
              message.content,
          })
        );


      const {
        reply,
      } =
        await chatReply(
          {
            messages:
              aiMessages,
          },
          accessToken
        );


      const savedAssistantMessage =
        await saveChatMessage(
          "assistant",
          reply,
          accessToken
        );


      setMessages([
        ...nextMessages,
        savedAssistantMessage,
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chat failed."
      );
    } finally {
      setPending(
        false
      );


      setTimeout(
        () =>
          taRef.current
            ?.focus(),
        0
      );
    }
  }


  async function clearChat() {
    if (
      !accessToken ||
      clearing
    ) {
      return;
    }


    setClearing(
      true
    );


    try {
      await clearChatMessages(
        accessToken
      );


      setMessages(
        []
      );


      toast.success(
        "Chat history cleared."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear chat history."
      );
    } finally {
      setClearing(
        false
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
            onClick={() =>
              void clearChat()
            }
            disabled={
              clearing ||
              pending
            }
          >
            {clearing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}

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
          {loadingHistory && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Loading chat history…
            </div>
          )}


          {!loadingHistory &&
            messages.length ===
              0 && (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              Start a conversation. Your chat history is stored in your FumanAI account and can sync across devices.
            </div>
          )}


          {!loadingHistory &&
            messages.map(
              (
                message
              ) => (
                <div
                  key={
                    message.messageId
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
              disabled={
                loadingHistory ||
                pending
              }
            />


            <Button
              onClick={() =>
                void send()
              }
              disabled={
                !input.trim() ||
                pending ||
                loadingHistory
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