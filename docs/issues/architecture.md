# Архитектура

## ARCH-01: Дублирование Supabase клиентов
**Приоритет:** P0

**Файлы:**
- `lib/supabaseClient.ts`
- `lib/supabase/server.ts`

**Проблема:**
Два файла с идентичным кодом инициализации Supabase клиента.

**Влияние:**
- Нарушение DRY
- Риск рассинхронизации при изменениях
- Путаница в импортах

**Решение:**
```typescript
// lib/supabase/client.ts — единственный файл
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Missing Supabase env vars");
    client = createClient(url, key);
  }
  return client;
}
```

Удалить `lib/supabaseClient.ts`, обновить все импорты.

---

## ARCH-02: Несогласованная обработка ошибок
**Приоритет:** P1

**Файлы:**
- `lib/data/raceInfo.ts` — возвращает `null`
- `lib/data/races.ts` — бросает `Error`
- `lib/data/greatHouses.ts` — бросает `Error`
- `lib/data/raceSkills.ts` — логирует и бросает

**Проблема:**
Разные стратегии обработки ошибок в data-слое. Вызывающий код не знает, чего ожидать.

**Решение:**
Ввести Result type для всех data-функций:

```typescript
// lib/data/result.ts
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Использование
export async function getRaces(): Promise<Result<RaceListItem[]>> {
  try {
    const { data, error } = await supabase.from("races").select(...);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data ?? [] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("getRaces failed:", msg);
    return { ok: false, error: msg };
  }
}
```

---

## ARCH-03: Монолитный RaceDetailClient
**Приоритет:** P1

**Файл:** `app/library/inhabitants/races/[slug]/RaceDetailClient.tsx`

**Проблема:**
- 270+ строк кода
- 10+ useState хуков
- useMemo с 20+ зависимостями
- Сложно тестировать и поддерживать

**Решение:**
Декомпозиция на подкомпоненты:

```
RaceDetailClient.tsx (контейнер, ~50 строк)
├── sections/
│   ├── AboutSection.tsx (уже есть, расширить)
│   ├── SkillsSection.tsx (уже есть, вынести состояние)
│   ├── RaceClassesSection.tsx (вынести activeClassId)
│   ├── GreatHousesSection.tsx (вынести houseTab, activeHouseId)
│   ├── MoonElfFamiliesSection.tsx (вынести familyTab, activeFamilyId)
│   └── LegendarySquadsSection.tsx (вынести squadState)
```

Каждый компонент управляет своим состоянием локально.

---

## ARCH-04: Слабая обработка вставки секций
**Приоритет:** P2

**Файл:** `lib/races/sectionRules.ts:53-78`

**Проблема:**
Функция `applyInsertions()` молча добавляет секцию в конец, если `after` ключ не найден.

```typescript
const idx = result.findIndex((s) => s.key === ins.after);
if (idx === -1) {
  result.push(...ins.sections); // Молча в конец
}
```

**Решение:**
Добавить warning в dev-режиме:

```typescript
if (idx === -1) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Section insertion: key "${ins.after}" not found, appending to end`);
  }
  result.push(...ins.sections);
}
```
