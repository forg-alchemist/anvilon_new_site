# Mock Supabase Client

## Обзор

Реализован mock-клиент Supabase, который позволяет запускать приложение без реального подключения к базе данных. Это решает проблему локальной разработки когда у разработчика нет доступа к Supabase проекту.

## Мотивация

1. **Локальная разработка** — Возможность работать над UI/UX без настройки базы данных
2. **CI/CD** — Запуск билда и тестов без секретов базы данных
3. **Демонстрации** — Показ приложения без необходимости настройки backend
4. **Onboarding** — Новые разработчики могут сразу запустить проект

## Архитектура

### Централизованный провайдер окружения (`lib/env.ts`)

```typescript
interface EnvConfig {
  NODE_ENV: "production" | "development" | "test";
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  USE_MOCK_SUPABASE: boolean;
  isSupabaseConfigured: boolean;
  shouldUseMockClient: boolean;
}
```

Преимущества:
- Единая точка доступа к переменным окружения
- Типизация всех переменных
- Вычисляемые свойства (isSupabaseConfigured, shouldUseMockClient)
- Валидация при билде

### Mock клиент (`lib/supabase/mockClient.ts`)

Реализует интерфейс Supabase клиента с пустыми ответами:

```typescript
function createMockSupabaseClient(): SupabaseClient {
  return {
    from: () => createMockQueryBuilder(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    storage: { ... },
    auth: { ... }
  };
}
```

Mock query builder поддерживает все chainable методы Supabase:
- select, insert, update, delete
- eq, neq, gt, gte, lt, lte
- order, limit, offset
- single, maybeSingle
- и другие

### Валидация при билде

В `next.config.ts` добавлена проверка:
- В production требуется либо конфигурация Supabase, либо явный флаг `USE_MOCK_SUPABASE=true`
- В development mock используется автоматически при отсутствии конфигурации

## Использование

### Локальная разработка без базы

```bash
# .env.local не требуется или может быть пустым
npm run dev
# Приложение запустится с mock клиентом
```

### Явное включение mock режима

```bash
# .env.local
USE_MOCK_SUPABASE=true
```

### Production с mock (для демо)

```bash
# При деплое
USE_MOCK_SUPABASE=true npm run build
```

## Поведение mock клиента

| Операция | Результат |
|----------|-----------|
| `from().select()` | `{ data: null, error: null }` |
| `storage.from().getPublicUrl()` | `{ data: { publicUrl: "" } }` |
| `auth.getUser()` | `{ data: { user: null }, error: null }` |

## Логирование

При запуске выводится информация о режиме работы:

```
[Env] USE_MOCK_SUPABASE=true - using mock Supabase client
```

или

```
[Env] Supabase not configured - using mock client (empty data)
```
