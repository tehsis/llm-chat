import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import { chatStream } from "~/models/llm.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt") || "";

  return eventStream(request.signal, function setup(send, abort) {
    async function run() {
      console.log("Querying the llm...");
      console.log("Prompt: ", prompt);
      const res = await chatStream(prompt);
      console.log("Querying completed... streaming");
      for await (const chunk of res) {
        send({ data: chunk, event: "message" });
      }
    }

    run();

    return () => {};
  });
}
