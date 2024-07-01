import { LoaderFunctionArgs, defer, json } from "@remix-run/node";
import { Await, Form, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { chat } from "~/models/llm.server";
import { useEventSource } from "remix-utils/sse/react";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json({ prompt: url.searchParams.get("prompt") });
}

function usePrompt(prompt: string | null) {
  if (!prompt) return "";
  const message = useEventSource(`/sse/chat?prompt=${prompt}`, {
    event: "message",
  });

  const [messageComplete, setMessageComplete] = useState("");

  useEffect(() => {
    if (message && message !== "UNKNOWN_EVENT_DATA") {
      setMessageComplete((prevMessage) => prevMessage + message);
    }
  }, [message]);

  return messageComplete;
}

export default function ChatRoute() {
  const { prompt } = useLoaderData<typeof loader>();

  const message = usePrompt(prompt);

  return (
    <div>
      <div>{message}</div>
    </div>
  );
}
