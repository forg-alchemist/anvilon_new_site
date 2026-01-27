import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createMockSupabaseClient } from "./mockClient";
import { env, logEnvStatus } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Returns Supabase client. If USE_MOCK_SUPABASE=true or env variables are missing,
 * returns a mock client that returns empty data.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (cached) return cached;

  logEnvStatus();

  if (env.shouldUseMockClient) {
    return createMockSupabaseClient();
  }

  cached = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
  return cached;
}

/**
 * Check if Supabase is configured and available.
 */
export function isSupabaseConfigured(): boolean {
  return env.isSupabaseConfigured;
}
