import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { chat } from "~/models/llm.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt");

  if (!prompt) {
    return json({ response: "Please provide a prompt" }, { status: 400 });
  }

  const response = await chat(prompt);

  return json({ response });
}

export default function ChatRoute() {
  const data = useLoaderData<typeof loader>();

  return <div>{data.response}</div>;
}
