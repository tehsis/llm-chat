import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { emitter } from "~/models/emitter.server";
import { randomUUID } from "node:crypto";
import { Chat } from "~/Components/Chat";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json({ prompt: url.searchParams.get("prompt") });
}

type Messages = Map<string, { message: string; author: string }>;

function usePrompt() {
  const messageObject = useEventSource(`/sse/subscribe`, {
    event: "message",
  });

  const [messages, setMessages] = useState<Messages>(new Map());

  useEffect(() => {
    if (messageObject && messageObject !== "UNKNOWN_EVENT_DATA") {
      setMessages((prev) => {
        const {
          id,
          message,
          author,
        }: { id: string; message: string; author: string } =
          JSON.parse(messageObject);
        const updatedMessages = new Map(prev);
        const currentMessage = updatedMessages.get(id);
        updatedMessages.set(id, {
          message: (currentMessage?.message ?? "") + message,
          author,
        });

        return updatedMessages;
      });
    }
  }, [messageObject]);

  return messages;
}

function useClearFormOnSuccess(form: HTMLFormElement) {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  useEffect(
    function resetFormOnSuccess() {
      if (navigation.state === "idle" && actionData?.ok) {
        form.reset();
      }
    },
    [navigation.state, actionData],
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const message = body.get("message");
  const id = randomUUID();

  emitter.emit("chat", { id, message });

  return json({ ok: true });
}

export default function ChatRoute() {
  const messages = usePrompt();
  const formRef = useRef<HTMLFormElement>(null);
  useClearFormOnSuccess(formRef.current!);

  return (
    <div className="bg-purple-950 w-full text-purple-50 h-full">
      <Chat messages={messages} />
      <Form
        ref={formRef}
        className="bg-purple-900 rounded p-4 w-full"
        method="POST"
      >
        <input
          placeholder="Type a message..."
          className="appearance-none placeholder:text-purple-300 bg-purple-500 p-2 rounded w-1/2"
          type="text"
          id="message"
          name="message"
          autoComplete="off"
        />
        <button className="bg-purple-800 p-2 ml-2 rounded" type="submit">
          Send
        </button>
      </Form>
    </div>
  );
}
