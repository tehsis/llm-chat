import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import { emitter } from "~/models/emitter.server";
import { chatStream } from "~/models/llm.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt") || "";

  return eventStream(request.signal, function setup(send) {
    async function handle(prompt: string) {
      const res = await chatStream(prompt);
      for await (const chunk of res) {
        send({ data: chunk, event: "message" });
      }
    }

    emitter.on("chat", handle);

    return function clear() {
      emitter.off("chat", handle);
    };
  });
}
