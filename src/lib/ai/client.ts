import { GoogleGenAI } from "@google/genai"
import "server-only"

let cached: GoogleGenAI | undefined

// Lazy so importing lib/ai during a build doesn't require the key to be present.
export function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get one free at https://aistudio.google.com/apikey"
    )
  }
  if (!cached) cached = new GoogleGenAI({ apiKey })
  return cached
}
