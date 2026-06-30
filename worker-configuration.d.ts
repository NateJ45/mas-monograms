// Auto-generated Cloudflare Workers environment bindings.
// Provides types for R2, KV, and other bindings used in src/pages/api/*.ts

/// <reference types="@cloudflare/workers-types" />

interface Env {
  // R2 bucket for quote submission backups
  QUOTE_BACKUP: R2Bucket;
  // Wrangler secrets — set via `wrangler secret put`
  RESEND_API_KEY: string;
  QUOTE_OWNER_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
  SANITY_API_READ_TOKEN: string;
  // Session KV — declared here so the type compiles; the adapter enables sessions
  // automatically when this binding exists. Set up via wrangler kv:namespace create SESSION
  // before deploying. If you don't need sessions, remove this line and set sessions: false
  // in astro.config.mjs adapter options to suppress the build warning.
  SESSION: KVNamespace;
}
