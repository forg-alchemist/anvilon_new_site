# Anvilon Codebase Guide for AI Agents

## Project Overview
**Anvilon** is a Next.js 16+ fantasy game content browser (Russian fantasy RPG universe). It displays race details, skills, classes, history, families, and squads with a visually rich UI powered by Supabase as the backend.

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + custom CSS (radial gradients, custom fonts)
- **Backend**: Supabase (public client auth)
- **UI State**: Client-side React state with memoization

## Architecture Overview

### Data Flow Pattern
1. **Server Component (page.tsx)** fetches data from Supabase in parallel using `getSupabaseServerClient()`
2. **Data Transformation** happens in server components (tag parsing, URL generation via `getPublicStorageUrl()`)
3. **Client Component (RaceDetailClient.tsx)** receives pre-fetched data as props and manages UI state (active section, tabs)
4. **Data Files (lib/data/)** export async functions that call Supabase directly—no caching layer

### Key Directories
- **`app/`** - Next.js App Router pages and layouts (SSR + client hydration)
  - **`app/library/inhabitants/races/[slug]/`** - Race detail page architecture
    - `page.tsx` (server component) - fetches data in parallel
    - `RaceDetailClient.tsx` (client component) - renders tabs, sections, UI state
    - `sections/` - individual section renderers (AboutSection, SkillsSection, etc.)
    - `types.ts` - type definitions for race data structure
  - **`app/rules/character/books/magic/`** - Magic spell builder path
- **`lib/`** - Business logic and data access
  - **`lib/data/`** - Supabase query functions (races, skills, classes, catalogs, etc.)
  - **`lib/supabase/`** - Supabase client initialization (`server.ts`, `client.ts`, `publicUrl.ts`)
  - **`lib/races/`** - Race-specific rules engine (`raceSections.ts`, `sectionRules.ts`)
  - **`lib/ui/`** - UI utilities (richText renderer)
- **`components/`** - Reusable React components (PageShell, NavButton, RaceSlider)
- **`public/`** - Static assets

### Service Boundaries

#### Supabase Integration
- **Setup**: `lib/supabaseClient.ts` exports singleton `getSupabaseClient()`
- **Server-side**: `lib/supabase/server.ts` for page components
- **Client-side**: `lib/supabaseClient.ts` for event handlers
- **Storage URLs**: `lib/supabase/publicUrl.ts` constructs public storage URLs
- **Env vars required**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Race Sections (Dynamic Content)
- **Rules Engine**: `lib/races/sectionRules.ts` defines which sections appear for each race slug
- **Section Types**: "about", "skills", "r_classes", "map", "houses", "history", "religion" (or custom)
- **Coming Soon**: Sections can be marked `comingSoon: true` to show disabled state
- **Pattern**: Use `getRaceSectionsForSlug(slug)` to get enabled sections → memoized with `useMemo`

## Developer Workflows

### Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Build & Production
```bash
npm run build
npm start
```

### Type Checking & Linting
```bash
# ESLint (Next.js + TypeScript rules)
npm run lint
```

### Environment Setup
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Code Patterns & Conventions

### Next.js 15+ Async Params
Route params are **async Promises**. Always use `await`:
```typescript
export default async function RacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ← REQUIRED in Next.js 15+
  // ...
}
```

### Tag Delimiters
Tags in content are split by **semicolon (`;`)**, not comma:
```typescript
const tags = raw.split(";").map(t => t.trim()).filter(Boolean);
```

### Client vs Server Components
- **Server**: `page.tsx` fetches from Supabase, transforms data, renders initial UI
- **Client**: `RaceDetailClient.tsx` with `"use client"` manages interactive state (tabs, sections, sliders)
- **Handoff**: Server passes pre-fetched data as props to client component

### UI Component Reusability
- **PageShell**: Wrapper for page title + back button + content
  - Props: `title`, `children`, `backHref`, `backLabel`
  - Handles styling, art loading from public storage
- **NavButton**: Navigation buttons with styled appearance
- **RaceSlider**: Carousel for browsing races

### Error Handling Pattern
- Supabase queries log errors to console, return empty arrays/null
- No error UI boundaries—graceful degradation
- Example: `getCatalogBooks()` returns `[]` on error

### Rich Text Rendering
- Use `renderRichText(htmlString)` from `lib/ui/richText.tsx`
- Converts sanitized HTML to React components

### Storage URL Generation
- `getPublicStorageUrl(bucket, path)` → constructs public storage URLs
- Common buckets: `"art"`, `"UI_UX"`
- Used in `<img>` tags and CSS backgrounds

## TypeScript & Project Config

### Path Alias
- `@/*` → root of workspace (e.g., `@/lib/data` = `./lib/data`)

### Strict Mode
- All strict TypeScript checks enabled
- No implicit `any`, require explicit return types on exported functions

### CSS Framework
- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Custom fonts**: "Yeseva One" (headings), "Forum" (body)
- **CSS variables**: Theme colors defined in `:root` (--ui-cyan, --ui-blue, --ui-violet, --ui-ember, --ui-gold)
- **Backgrounds**: Radial gradients applied to `body` (astral theme)

## Common Tasks

### Adding a New Race Section
1. Create section component in `app/library/inhabitants/races/[slug]/sections/` (e.g., `NewSection.tsx`)
2. Define type in `types.ts` for data structure
3. Fetch data in `page.tsx` from `lib/data/`
4. Add rule in `lib/races/sectionRules.ts` with section key and label
5. Import and render in `RaceDetailClient.tsx` with conditional rendering based on active section

### Adding a New Data Source
1. Create query function in `lib/data/newEntity.ts` (call `getSupabaseServerClient()`)
2. Fetch in `page.tsx` in parallel with other queries
3. Pass to client component as prop
4. Render or display in appropriate section

### Styling Components
- Use Tailwind classes for layout/responsive
- Custom CSS for gradients, animations, fonts
- Reference CSS variables (e.g., `color: var(--ui-cyan)`)
- Images from public storage use `getPublicStorageUrl(bucket, path)`

## Anti-Patterns to Avoid
- ❌ Don't create new Supabase client instances—use singleton from `getSupabaseClient()` or `getSupabaseServerClient()`
- ❌ Don't hardcode storage URLs—use `getPublicStorageUrl()` helper
- ❌ Don't split tags by comma—use semicolon (`;`)
- ❌ Don't fetch in client components when server components are available
- ❌ Don't forget `await params` in Next.js 15+ route handlers
