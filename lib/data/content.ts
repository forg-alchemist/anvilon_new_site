import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ContentBlock = {
  id: string;
  type: string;
  sort: number;
  payload: any;
};

export type ContentSection = {
  id: string;
  slug: string;
  title: string;
  sort: number;
  blocks: ContentBlock[];
};

export type ContentDocument = {
  id: string;
  entity_type: string;
  entity_slug: string;
  title: string;
  status: string;
  published_revision_id: string | null;
};

export type ContentRevision = {
  id: string;
  document_id: string;
  version: number;
};

type DbSectionRow = {
  id: string;
  slug: string;
  title: string;
  sort: number | null;
};

type DbBlockRow = {
  id: string;
  type: string;
  sort: number | null;
  payload: any;
  section_id: string;
};

/**
 * Fetch published (or latest) content for an entity.
 *
 * Expected tables (Supabase/Postgres):
 * - content_documents (entity_type, entity_slug, published_revision_id, title, ...)
 * - content_revisions (document_id, version, ...)
 * - content_sections (revision_id, slug, title, sort)
 * - content_blocks (revision_id, section_id, type, sort, payload)
 *
 * IMPORTANT: If tables are not present yet, this function fails soft and returns null.
 */
export async function getContentSectionsForEntity(entityType: string, entitySlug: string): Promise<ContentSection[] | null> {
  const supabase = getSupabaseServerClient();

  // 1) document
  const { data: doc, error: docErr } = await supabase
    .from("content_documents")
    .select("id, entity_type, entity_slug, title, status, published_revision_id")
    .eq("entity_type", entityType)
    .eq("entity_slug", entitySlug)
    .maybeSingle();

  if (docErr) {
    // Table may not exist yet, or no permissions — fail soft.
    console.warn("[getContentSectionsForEntity] document error:", docErr.message);
    return null;
  }
  if (!doc) return null;

  const document = doc as ContentDocument;

  // 2) choose revision: published first, else latest by version
  let revisionId: string | null = document.published_revision_id ?? null;

  if (!revisionId) {
    const { data: rev, error: revErr } = await supabase
      .from("content_revisions")
      .select("id, document_id, version")
      .eq("document_id", document.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (revErr) {
      console.warn("[getContentSectionsForEntity] revision error:", revErr.message);
      return null;
    }
    revisionId = (rev as ContentRevision | null)?.id ?? null;
  }

  if (!revisionId) return null;

  // 3) sections
  const { data: sectionsData, error: secErr } = await supabase
    .from("content_sections")
    .select("id, slug, title, sort")
    .eq("revision_id", revisionId)
    .order("sort", { ascending: true });

  if (secErr) {
    console.warn("[getContentSectionsForEntity] sections error:", secErr.message);
    return null;
  }

  const sections = ((sectionsData ?? []) as DbSectionRow[]).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    sort: s.sort ?? 0,
    blocks: [] as ContentBlock[],
  }));

  if (!sections.length) return [];

  // 4) blocks
  const { data: blocksData, error: blkErr } = await supabase
    .from("content_blocks")
    .select("id, section_id, type, sort, payload")
    .eq("revision_id", revisionId)
    .order("sort", { ascending: true });

  if (blkErr) {
    console.warn("[getContentSectionsForEntity] blocks error:", blkErr.message);
    return null;
  }

  const bySection = new Map<string, ContentBlock[]>();
  for (const b of (blocksData ?? []) as DbBlockRow[]) {
    const list = bySection.get(b.section_id) ?? [];
    list.push({
      id: b.id,
      type: b.type,
      sort: b.sort ?? 0,
      payload: b.payload ?? {},
    });
    bySection.set(b.section_id, list);
  }

  return sections.map((s) => ({ ...s, blocks: bySection.get(s.id) ?? [] }));
}

/**
 * Legacy helper: convert your old race_info columns into new sections+blocks.
 * This lets the UI work immediately, even before DB migration is done.
 */
export function legacyRaceInfoToSections(input: {
  tags?: string[];
  description?: string;
  peculiarities?: string;
  physiology?: string;
  origin_tags?: string[];
  origin?: string;
  sociality?: string;
  archetype_tags?: string[];
  archetype?: string;
  character?: string;
  relationships_tags?: string[];
  relationships?: string;
  names?: string;
  surname?: string;
  name_features?: string;
}): ContentSection[] {
  const tags = input.tags ?? [];
  const originTags = input.origin_tags ?? [];
  const archetypeTags = input.archetype_tags ?? [];
  const relTags = input.relationships_tags ?? [];

  const sec = (slug: string, title: string, blocks: ContentBlock[], sort: number): ContentSection => ({
    id: `legacy:${slug}`,
    slug,
    title,
    sort,
    blocks,
  });

  const blocks = (arr: Array<Omit<ContentBlock, "id" | "sort">>): ContentBlock[] =>
    arr
      .filter(Boolean)
      .map((b, i) => ({ id: `legacy:${b.type}:${i}`, sort: (i + 1) * 10, ...b }));

  const descBlocks: ContentBlock[] = blocks([
    tags.length ? { type: "chips", payload: { items: tags } } : null,
    input.description?.trim() ? { type: "paragraph", payload: { text: input.description } } : null,
    input.peculiarities?.trim()
      ? { type: "heading", payload: { level: 2, text: "Особенности" } }
      : null,
    input.peculiarities?.trim() ? { type: "paragraph", payload: { text: input.peculiarities } } : null,
  ].filter(Boolean) as any);

  const physBlocks: ContentBlock[] = blocks([
    input.physiology?.trim() ? { type: "heading", payload: { level: 2, text: "Физиология" } } : null,
    input.physiology?.trim() ? { type: "paragraph", payload: { text: input.physiology } } : null,
    { type: "heading", payload: { level: 2, text: "Происхождение" } },
    originTags.length ? { type: "chips", payload: { items: originTags } } : null,
    input.origin?.trim() ? { type: "paragraph", payload: { text: input.origin } } : null,
    input.sociality?.trim() ? { type: "heading", payload: { level: 2, text: "Социальность" } } : null,
    input.sociality?.trim() ? { type: "paragraph", payload: { text: input.sociality } } : null,
  ].filter(Boolean) as any);

  const archBlocks: ContentBlock[] = blocks([
    archetypeTags.length ? { type: "chips", payload: { items: archetypeTags } } : null,
    input.archetype?.trim() ? { type: "paragraph", payload: { text: input.archetype } } : null,
    input.character?.trim() ? { type: "heading", payload: { level: 2, text: "Характер" } } : null,
    input.character?.trim() ? { type: "paragraph", payload: { text: input.character } } : null,
  ].filter(Boolean) as any);

  const relBlocks: ContentBlock[] = blocks([
    relTags.length ? { type: "chips", payload: { items: relTags } } : null,
    input.relationships?.trim() ? { type: "paragraph", payload: { text: input.relationships } } : null,
  ].filter(Boolean) as any);

  const namesBlocks: ContentBlock[] = blocks([
    input.names?.trim() ? { type: "paragraph", payload: { text: input.names } } : null,
    input.surname?.trim() ? { type: "heading", payload: { level: 2, text: "Фамилии" } } : null,
    input.surname?.trim() ? { type: "paragraph", payload: { text: input.surname } } : null,
    input.name_features?.trim() ? { type: "heading", payload: { level: 2, text: "Особенности" } } : null,
    input.name_features?.trim() ? { type: "paragraph", payload: { text: input.name_features } } : null,
  ].filter(Boolean) as any);

  return [
    sec("desc", "Описание расы", descBlocks, 10),
    sec("phys", "Физиология", physBlocks, 20),
    sec("arch", "Архетипы и характер", archBlocks, 30),
    sec("relations", "Друзья и враги", relBlocks, 40),
    sec("names", "Имена", namesBlocks, 50),
  ];
}
