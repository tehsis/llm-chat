import React from "react";

type Messages = Map<string, { message: string; author: string }>;

export function ChatList({ children }: React.PropsWithChildren<{}>) {
  return <div className="p-20 flex flex-col">{children}</div>;
}

export function ChatMessageFromSelf({ message }: { message: string }) {
  return <div className="bg-purple-700 rounded p-2 mb-4 w-1/2">{message}</div>;
}

export function ChatMessage({ message }: { message: string }) {
  return (
    <div className="bg-purple-800 rounded p-2 mb-4 w-1/2 float-left">
      {message}
    </div>
  );
}

export function Chat({ messages }: { messages: Messages }) {
  return (
    <ChatList>
      {[...messages.entries()].map(([id, { message, author }]) =>
        author === "self" ? (
          <ChatMessageFromSelf key={id} message={message} />
        ) : (
          <ChatMessage key={id} message={message} />
        ),
      )}
    </ChatList>
  );
}
