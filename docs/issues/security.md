# Безопасность

## SEC-01: Отсутствие валидации slug параметра
**Приоритет:** P1

**Файл:** `app/library/inhabitants/races/[slug]/page.tsx:45`

**Проблема:**
Параметр `slug` из URL используется напрямую в запросах без валидации:

```typescript
export default async function RaceDetailPage({ params }: Props) {
  const { slug } = await params;
  // slug сразу идёт в запросы
  const race = await getRaceBySlug(slug);
}
```

**Влияние:**
- Supabase использует параметризованные запросы, так что SQL-инъекция маловероятна
- Но невалидные slug могут вызвать лишние запросы к БД
- Возможны проблемы с логами и мониторингом

**Решение:**
```typescript
// lib/validation.ts
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 100;

export function isValidSlug(slug: string): boolean {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= MAX_SLUG_LENGTH &&
    SLUG_PATTERN.test(slug)
  );
}

// В page.tsx
import { isValidSlug } from "@/lib/validation";
import { notFound } from "next/navigation";

export default async function RaceDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const race = await getRaceBySlug(slug);
  // ...
}
```

---

## SEC-02: Динамический backgroundImage без валидации
**Приоритет:** P2

**Файл:** `app/layout.tsx:47`

**Проблема:**
URL из `getPageArtUrl()` вставляется в inline style:

```typescript
style={{
  backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
}}
```

**Влияние:**
- Если данные в БД скомпрометированы, возможен CSS injection
- Низкий риск, так как данные из собственной БД

**Решение:**
Валидировать URL перед использованием:

```typescript
// lib/validation.ts
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Разрешаем только HTTPS и известные домены
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.endsWith(".supabase.co") ||
       parsed.hostname === "localhost")
    );
  } catch {
    return false;
  }
}

// В layout.tsx
const bgUrl = await getPageArtUrl("library");
const safeBgUrl = bgUrl && isValidImageUrl(bgUrl) ? bgUrl : null;

<div style={{ backgroundImage: safeBgUrl ? `url(${safeBgUrl})` : undefined }}>
```

---

## SEC-03: Логирование чувствительных данных
**Приоритет:** P3

**Файл:** `lib/data/classes.ts:46-57`

**Проблема:**
`logSupabaseError` логирует много полей из объекта ошибки:

```typescript
function logSupabaseError(prefix: string, err: any) {
  try {
    console.error(prefix, {
      message: err?.message,
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
      // ...
    });
  } catch {
    console.error(prefix, err);
  }
}
```

**Влияние:**
- В production логи могут содержать чувствительную информацию
- `details` и `hint` могут раскрывать структуру БД

**Решение:**
Фильтровать информацию в зависимости от окружения:

```typescript
function logSupabaseError(prefix: string, err: unknown) {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof Error) {
    console.error(prefix, { message: err.message });
    return;
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    const e = err as { message: string; code?: string; details?: string };

    if (isDev) {
      // В dev логируем всё для отладки
      console.error(prefix, { message: e.message, code: e.code, details: e.details });
    } else {
      // В prod только безопасную информацию
      console.error(prefix, { message: e.message, code: e.code });
    }
    return;
  }

  console.error(prefix, "Unknown error");
}
```
