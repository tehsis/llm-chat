import { LoaderFunctionArgs } from "@remix-run/node";
import { randomUUID } from "crypto";
import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import { emitter } from "~/models/emitter.server";
import { chatStream } from "~/models/llm.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  return eventStream(request.signal, function setup(send) {
    async function handle({ message, id }: { message: string; id: string }) {
      send({
        data: JSON.stringify({
          author: "self",
          id: randomUUID(),
          message,
        }),
        event: "message",
      });

      const res = await chatStream(message);
      for await (const chunk of res) {
        if (!chunk) continue;
        send({
          data: JSON.stringify({
            author: "llm",
            id,
            message: chunk,
          }),
          event: "message",
        });
      }
    }

    emitter.on("chat", handle);

    return function clear() {
      emitter.off("chat", handle);
    };
  });
}
