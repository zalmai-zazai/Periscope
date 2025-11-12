import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export function isOpenAIConfigured(): boolean {
  return (
    !!process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_test_key_here"
  );
}

export function shouldUseRealAI(): boolean {
  return process.env.USE_REAL_AI === "true" && isOpenAIConfigured();
}
