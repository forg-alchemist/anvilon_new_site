import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Empty result that mimics Supabase query response
 */
const emptyResult = { data: null, error: null };

/**
 * Chainable mock query builder - returns empty data for all operations.
 * Implements the Supabase query builder interface.
 */
function createMockQueryBuilder(): unknown {
  const builder: Record<string, unknown> = {};

  const chainMethods = [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "ilike",
    "is",
    "in",
    "contains",
    "containedBy",
    "range",
    "overlaps",
    "textSearch",
    "match",
    "not",
    "or",
    "and",
    "filter",
    "order",
    "limit",
    "offset",
    "single",
    "maybeSingle",
    "csv",
    "returns",
  ];

  for (const method of chainMethods) {
    builder[method] = () => builder;
  }

  // Terminal method - makes the builder thenable
  builder.then = (resolve: (value: typeof emptyResult) => void) => {
    resolve(emptyResult);
    return Promise.resolve(emptyResult);
  };

  return builder;
}

/**
 * Mock Supabase client that returns empty data for all queries.
 * Allows the app to run without a database connection.
 */
export function createMockSupabaseClient(): SupabaseClient {
  const mock = {
    from: () => createMockQueryBuilder(),
    rpc: () => Promise.resolve(emptyResult),
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
        download: () => Promise.resolve({ data: null, error: null }),
        upload: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
      }),
    },
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  };

  return mock as unknown as SupabaseClient;
}
