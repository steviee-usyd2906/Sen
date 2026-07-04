// ============================================================
// Security store seam — same pattern as app/lib/forecast-source.ts:
// when Supabase env vars are unset the in-memory store runs everything;
// setting NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY flips to
// the real database with no other code change.
// TODO(plug-in): run scripts/001–003 in Supabase, set the env vars, done.
// ============================================================

import "server-only";
import { memoryStore } from "./memory-store";
import { supabaseStore } from "./supabase-store";
import type { SecurityStore } from "./types";

export function getSecurityStore(): SecurityStore {
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  return configured ? supabaseStore : memoryStore;
}
