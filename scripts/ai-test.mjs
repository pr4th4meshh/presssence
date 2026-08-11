import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set.")
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey })

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: "What is the capital of Japan?",
  })

  console.log("Answer:")
  console.log(response.text)
  const usage = response.usageMetadata

  console.log("\nToken usage:")
  console.log(`Input tokens: ${usage?.promptTokenCount ?? "N/A"}`)
  console.log(`Output tokens: ${usage?.candidatesTokenCount ?? "N/A"}`)
  console.log(`Total tokens: ${usage?.totalTokenCount ?? "N/A"}`)
} catch (err) {
  console.error("Request failed:")
  console.error(err)
  process.exit(1)
}
