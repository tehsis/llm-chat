import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { IterableReadableStream } from "@langchain/core/utils/stream";

const { OLLAMA_BASE_URL, OLLAMA_MODEL } = process.env;

const chatModel = new ChatOllama({
  baseUrl: OLLAMA_BASE_URL,
  model: OLLAMA_MODEL,
});

const llmchain = chatModel.pipe(new StringOutputParser());

export async function chat(prompt: string): Promise<string> {
  return await llmchain.invoke(prompt);
}

export async function chatStream(
  prompt: string,
): Promise<IterableReadableStream<string>> {
  return await llmchain.stream(prompt);
}
