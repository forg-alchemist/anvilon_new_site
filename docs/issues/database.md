# База данных

## DB-01: N+1 Query в getMoonSquadsWithPersons
**Приоритет:** P1

**Файл:** `lib/data/moonSquad.ts:91-109`

**Проблема:**
Два отдельных запроса с последующим джойном в памяти:

```typescript
export async function getMoonSquadsWithPersons(): Promise<MoonSquadWithPersons[]> {
  const [squads, persons] = await Promise.all([
    getMoonSquads(),
    getMoonSquadPersons(),
  ]);

  return squads.map((squad) => ({
    ...squad,
    persons: persons.filter((p) => p.squad_id === squad.id),
  }));
}
```

**Влияние:**
- 2 запроса к БД вместо 1
- Фильтрация в памяти O(n*m)
- Не масштабируется при росте данных

**Решение:**
Использовать Supabase relations (nested select):

```typescript
export async function getMoonSquadsWithPersons(): Promise<MoonSquadWithPersons[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("moon_elf_squad")
    .select(`
      id,
      name,
      slug,
      description,
      image_bucket,
      image_path,
      persons:moon_squad_pers (
        id,
        name,
        role,
        description,
        image_bucket,
        image_path
      )
    `)
    .order("name");

  if (error) {
    console.error("getMoonSquadsWithPersons error:", error.message);
    throw new Error(error.message);
  }

  return (data ?? []).map((squad) => ({
    ...squad,
    imageUrl: getPublicStorageUrl(squad.image_bucket, squad.image_path),
    persons: squad.persons.map((p) => ({
      ...p,
      imageUrl: getPublicStorageUrl(p.image_bucket, p.image_path),
    })),
  }));
}
```

---

## DB-02: Отсутствие валидации bucket name
**Приоритет:** P2

**Файл:** `lib/supabase/publicUrl.ts:9-30`

**Проблема:**
Bucket name не проверяется на допустимые символы:

```typescript
export function getPublicStorageUrl(bucket?: string | null, path?: string | null) {
  const b = bucket ?? "art";
  // Нет валидации b
  return `${normalizedBase}/storage/v1/object/public/${b}/${p}`;
}
```

**Влияние:**
- Возможны невалидные URL при ошибочных данных в БД
- Потенциальная path traversal (хотя Supabase защищает)

**Решение:**
```typescript
const VALID_BUCKET = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

export function getPublicStorageUrl(
  bucket?: string | null,
  path?: string | null
): string | null {
  const b = bucket ?? "art";

  if (!VALID_BUCKET.test(b)) {
    console.warn(`Invalid bucket name: "${b}"`);
    return null;
  }

  const p = path?.replace(/^\/+/, "") ?? "";
  if (!p) return null;

  return `${normalizedBase}/storage/v1/object/public/${b}/${p}`;
}
```

---

## DB-03: Молчаливое проглатывание ошибок при загрузке данных
**Приоритет:** P2

**Файл:** `app/library/inhabitants/races/[slug]/page.tsx:88`

**Проблема:**
Ошибка запроса проглатывается без логирования:

```typescript
const info = await getRaceInfoBySlug(slug).catch(() => null);
```

**Влияние:**
- Невозможно понять причину пустых данных
- Затрудняет отладку в production

**Решение:**
```typescript
const info = await getRaceInfoBySlug(slug).catch((e) => {
  console.error(`Failed to load race info for "${slug}":`, e);
  return null;
});
```

Или использовать Result type из ARCH-02:

```typescript
const infoResult = await getRaceInfoBySlug(slug);
const info = infoResult.ok ? infoResult.data : null;
```
