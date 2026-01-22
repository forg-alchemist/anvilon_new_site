/**
 * Centralized environment variables provider with validation.
 * Throws build-time errors for missing required variables.
 */

type EnvMode = "production" | "development" | "test";

interface EnvConfig {
  /** Current Node environment */
  NODE_ENV: EnvMode;

  /** Supabase project URL */
  SUPABASE_URL: string | undefined;

  /** Supabase anonymous key */
  SUPABASE_ANON_KEY: string | undefined;

  /** Use mock Supabase client (bypasses real database) */
  USE_MOCK_SUPABASE: boolean;

  /** Is Supabase properly configured */
  isSupabaseConfigured: boolean;

  /** Should use mock client (explicit flag or missing config) */
  shouldUseMockClient: boolean;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase() === "true" || value === "1";
}

function getEnvMode(): EnvMode {
  const env = process.env.NODE_ENV;
  if (env === "production" || env === "development" || env === "test") {
    return env;
  }
  return "development";
}

function createEnvConfig(): EnvConfig {
  const NODE_ENV = getEnvMode();
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const USE_MOCK_SUPABASE = parseBoolean(process.env.USE_MOCK_SUPABASE);

  const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  const shouldUseMockClient = USE_MOCK_SUPABASE || !isSupabaseConfigured;

  return {
    NODE_ENV,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    USE_MOCK_SUPABASE,
    isSupabaseConfigured,
    shouldUseMockClient,
  };
}

/**
 * Validates required environment variables for production build.
 * Call this in next.config.ts to fail build early if config is missing.
 */
export function validateEnvForBuild(): void {
  const env = createEnvConfig();

  // In production, require either real Supabase config OR explicit mock flag
  if (env.NODE_ENV === "production") {
    if (!env.isSupabaseConfigured && !env.USE_MOCK_SUPABASE) {
      throw new Error(
        `[Build Error] Missing required environment variables for production:\n` +
          `  - NEXT_PUBLIC_SUPABASE_URL\n` +
          `  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n` +
          `Either provide these variables or set USE_MOCK_SUPABASE=true to run without database.`
      );
    }
  }
}

/**
 * Environment configuration singleton.
 * Access env variables through this object.
 */
export const env: EnvConfig = createEnvConfig();

/**
 * Log environment status (for debugging).
 * Only logs once per process.
 */
let hasLoggedStatus = false;

export function logEnvStatus(): void {
  if (hasLoggedStatus) return;
  hasLoggedStatus = true;

  const config = env;

  if (config.shouldUseMockClient) {
    if (config.USE_MOCK_SUPABASE) {
      console.info("[Env] USE_MOCK_SUPABASE=true - using mock Supabase client");
    } else {
      console.warn(
        "[Env] Supabase not configured - using mock client (empty data)"
      );
    }
  } else {
    console.info("[Env] Supabase configured and ready");
  }
}
