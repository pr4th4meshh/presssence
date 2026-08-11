import type { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

// Gemini accepts only a subset of JSON Schema; unknown keys ($schema,
// additionalProperties) cause a 400. Whitelisted so new zod-to-json-schema
// output can't silently introduce a key that breaks requests.
const ALLOWED_KEYS = new Set([
  "type",
  "format",
  "description",
  "nullable",
  "enum",
  "items",
  "properties",
  "required",
  "minItems",
  "maxItems",
])

function sanitize(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(sanitize)
  if (node === null || typeof node !== "object") return node

  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key)) continue
    if (key === "properties" && value && typeof value === "object") {
      out[key] = Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitize(v)])
      )
    } else {
      out[key] = sanitize(value)
    }
  }
  return out
}

// Keeps the Zod schema as the single source of truth: it generates the
// constraint sent to the model and validates what comes back.
export function toGeminiSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // $refStrategy "none" inlines nested objects — Gemini doesn't resolve $ref.
  const json = zodToJsonSchema(schema, { target: "openApi3", $refStrategy: "none" })
  return sanitize(json) as Record<string, unknown>
}
