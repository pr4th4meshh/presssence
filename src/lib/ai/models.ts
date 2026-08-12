// Model IDs get retired without notice — Google pulled the 2.0/2.5 line for new
// keys in 2026. Check what a key can reach:
//   curl https://generativelanguage.googleapis.com/v1beta/models -H "x-goog-api-key: $KEY"
// Free-tier daily request quotas differ enormously between tiers: `smart` is
// capped at 20 requests/day, so it suits one-shot calls only — never a loop.
export const MODELS = {
  fast: "gemini-3.5-flash-lite",
  smart: "gemini-3.6-flash",
  embedding: "gemini-embedding-001",
} as const

// Changing this or MODELS.embedding invalidates every stored vector — embeddings
// from different models aren't comparable. Re-index if you change either.
export const EMBEDDING_DIMENSIONS = 768
