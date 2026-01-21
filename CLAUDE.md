# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Anvilon Web is a Russian-language fantasy world reference application built with Next.js 16+ (App Router) and Supabase. It presents a library of races, classes, history, and game rules for the Anvilon fantasy universe.

## Build and Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router (React 19)
- **Language:** TypeScript 5
- **Backend:** Supabase (PostgreSQL + Storage)
- **Styling:** Tailwind CSS 4

### Key Patterns

**Server Components for Data Fetching:**
All Supabase queries happen in server components or server functions in `lib/data/`. Client components receive pre-fetched data as props.

```typescript
// lib/data/*.ts - Server-side data fetching
export async function getRaces(): Promise<RaceListItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("races").select(...);
  return data;
}
```

**Section-Based Page Structure:**
Race detail pages use a modular section system. Each section is a separate component in `app/library/inhabitants/races/[slug]/sections/`. Section visibility is configured per-race in `lib/races/raceSections.ts`.

**Dynamic Routes with Async Params:**
Next.js 15+ pattern - params are async and must be awaited:
```typescript
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

### Directory Structure

- `app/` - Next.js App Router pages
- `components/` - Reusable React components (NavButton, PageShell, RaceSlider)
- `lib/data/` - Supabase data fetching functions and types
- `lib/races/` - Race-specific configuration (section rules)
- `lib/supabase/` - Supabase client setup (server.ts, publicUrl.ts)
- `lib/ui/` - UI utilities (richText rendering)

### Supabase Tables

Core tables: `races`, `race_info`, `race_skills`, `race_map`, `class`, `class_skill`, `great_house`, `moon_elf_fam`, `moon_elf_squad`, `moon_squad_pers`, `page_art`

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Code Conventions

- Russian language for UI text (Cyrillic fonts: Yeseva One for headings, Forum for body)
- Dark theme with gradient overlays
- Use `"use client"` directive only for components requiring interactivity
- Types co-located with data functions in `lib/data/` or in `types.ts` files
