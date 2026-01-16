/**
 * Builds a stable public URL for Supabase Storage objects.
 *
 * DB conventions are "bucket" + "path" (path inside the bucket).
 * In practice, editors sometimes paste leading slashes, bucket-prefixed paths
 * (e.g. "art/UI_UX/x.png" with bucket="art"), or even a full URL.
 * This helper normalizes those cases to prevent silent 404s.
 */
export function getPublicStorageUrl(bucket?: string | null, path?: string | null) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const b = (bucket ?? "").toString().trim();
  let p = (path ?? "").toString().trim();

  if (!base || !b || !p) return "";

  // Already a full URL.
  if (/^https?:\/\//i.test(p)) return p;

  // Strip leading slashes.
  p = p.replace(/^\/+/, "");

  // If someone stored "<bucket>/<path>" in path, drop the duplicated bucket.
  const bucketPrefix = `${b}/`;
  if (p.startsWith(bucketPrefix)) p = p.slice(bucketPrefix.length);

  // Normalize base (no trailing slash).
  const normalizedBase = base.replace(/\/+$/, "");

  return `${normalizedBase}/storage/v1/object/public/${b}/${p}`;
}
