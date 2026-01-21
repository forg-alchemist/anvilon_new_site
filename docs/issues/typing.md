# Типизация

## TYPE-01: Использование `any` типов
**Приоритет:** P0

**Файл:** `lib/data/classes.ts`

**Проблема:**
Множественное использование `any`:

```typescript
// Строка 46
function logSupabaseError(prefix: string, err: any)

// Строки 77-78
.map((c: any) =>
) as any[];

// Строка 122
description: (placeholderRaw[0] as any).description ?? ""

// Строка 127
return classes.map((c: any) => {
```

**Влияние:**
- Потеря type safety
- Runtime ошибки не отлавливаются компилятором
- Сложнее рефакторить

**Решение:**
Создать типы для Supabase данных:

```typescript
// lib/data/types.ts

// Тип ошибки Supabase
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Row types для таблиц
export interface ClassRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_bucket: string | null;
  image_path: string | null;
  race_id: number | null;
}

export interface ClassSkillRow {
  id: number;
  class_id: number;
  name: string;
  description: string | null;
  category: string | null;
}

// Типизированный логгер
function logSupabaseError(prefix: string, err: SupabaseError | Error | unknown) {
  if (err instanceof Error) {
    console.error(prefix, { message: err.message });
  } else if (typeof err === 'object' && err !== null && 'message' in err) {
    const e = err as SupabaseError;
    console.error(prefix, { message: e.message, code: e.code });
  } else {
    console.error(prefix, err);
  }
}
```

---

## TYPE-02: Небезопасные приведения типов
**Приоритет:** P2

**Файл:** `lib/data/moonElfFamilies.ts:58-80`

**Проблема:**
Лишние приведения строк, которые уже строки:

```typescript
const bucket = (r.bucket ?? "art").toString();
const slugMoonFam = (r.slug_moon_fam ?? r.slug_moon_fan ?? r.slug ?? "")?.toString() ?? "";
```

**Влияние:**
- Код сложнее читать
- Указывает на неуверенность в типах данных из БД

**Решение:**
Определить row type и доверять ему:

```typescript
interface MoonElfFamilyRow {
  id: number;
  name: string;
  slug: string;
  slug_moon_fam?: string;
  bucket: string;
  path: string;
  description: string | null;
}

// Использование без лишних приведений
const bucket = r.bucket ?? "art";
const slugMoonFam = r.slug_moon_fam ?? r.slug;
```

---

## TYPE-03: Отсутствие типов для section props
**Приоритет:** P2

**Файлы:**
- `app/library/inhabitants/races/[slug]/sections/AboutSection.tsx`
- `app/library/inhabitants/races/[slug]/sections/SkillsSection.tsx`
- и другие секции

**Проблема:**
Props определены inline, нет переиспользуемых типов:

```typescript
export function AboutSection({
  detail,
  tab,
  setAboutTab,
}: {
  detail: RaceDetail;
  tab: "desc" | "tags";
  setAboutTab?: (t: "desc" | "tags") => void;
}) {
```

**Решение:**
Вынести типы в общий файл:

```typescript
// app/library/inhabitants/races/[slug]/types.ts

export type AboutTab = "desc" | "tags";
export type HouseTab = "info" | "council";
export type FamilyTab = "info" | "members";

export interface AboutSectionProps {
  detail: RaceDetail;
  tab: AboutTab;
  setAboutTab?: (t: AboutTab) => void;
}

export interface SkillsSectionProps {
  skills: RaceSkill[];
  skillIndex: number;
  setSkillIndex: (i: number) => void;
}

// В компоненте
import { AboutSectionProps } from "../types";

export function AboutSection({ detail, tab, setAboutTab }: AboutSectionProps) {
```

---

## TYPE-04: Генерация типов из Supabase
**Приоритет:** P2

**Проблема:**
Типы для таблиц БД написаны вручную и могут рассинхронизироваться со схемой.

**Решение:**
Использовать Supabase CLI для генерации типов:

```bash
# Установка
npm install supabase --save-dev

# Генерация типов
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Использование:

```typescript
// lib/database.types.ts (сгенерировано)
export interface Database {
  public: {
    Tables: {
      races: {
        Row: { id: number; name: string; slug: string; ... }
        Insert: { ... }
        Update: { ... }
      }
      // ...
    }
  }
}

// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

export const supabase = createClient<Database>(url, key);

// Теперь типы автоматические
const { data } = await supabase.from("races").select("*");
// data типизирован как Database["public"]["Tables"]["races"]["Row"][]
```
