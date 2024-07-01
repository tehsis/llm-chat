import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  defer,
  json,
} from "@remix-run/node";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { chat } from "~/models/llm.server";
import { useEventSource } from "remix-utils/sse/react";
import { emitter } from "~/models/emitter.server";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return json({ prompt: url.searchParams.get("prompt") });
}

function usePrompt() {
  const message = useEventSource(`/sse/subscribe`, {
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

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const message = body.get("message");
  emitter.emit("chat", message);
  return json({ ok: true });
}

export default function ChatRoute() {
  const message = usePrompt();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(
    function resetFormOnSuccess() {
      if (navigation.state === "idle" && actionData?.ok) {
        formRef.current?.reset();
      }
    },
    [navigation.state, actionData],
  );

  return (
    <div className="bg-purple-950 w-full text-purple-50 h-full">
      <div className="p-20">
        {message != "" ? (
          <div className="bg-purple-800 rounded p-2 mb-4 w-1/2">{message}</div>
        ) : null}
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
          />
          <button className="bg-purple-800 p-2 ml-2 rounded" type="submit">
            Send
          </button>
        </Form>
      </div>
    </div>
  );
}
