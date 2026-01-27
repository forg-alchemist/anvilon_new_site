# Качество кода

Принципы: DRY, KISS, SOLID, Clean Code

---

## CODE-01: Дублирование логики трансформации данных
**Приоритет:** P2
**Принцип:** DRY

**Файлы:**
- `lib/data/races.ts`
- `lib/data/greatHouses.ts`
- `lib/data/moonElfFamilies.ts`
- `lib/data/moonSquad.ts`

**Проблема:**
Повторяющийся паттерн формирования imageUrl:

```typescript
// В races.ts
imageUrl: getPublicStorageUrl(r.image_bucket, r.image_path),

// В greatHouses.ts
imageUrl: getPublicStorageUrl(h.bucket, h.path),

// В moonElfFamilies.ts
imageUrl: getPublicStorageUrl(r.bucket, r.path),

// В moonSquad.ts
imageUrl: getPublicStorageUrl(squad.image_bucket, squad.image_path),
```

**Решение:**
Создать generic helper:

```typescript
// lib/data/helpers.ts
interface WithImage {
  image_bucket?: string | null;
  image_path?: string | null;
  bucket?: string | null;
  path?: string | null;
}

export function withImageUrl<T extends WithImage>(
  item: T
): T & { imageUrl: string | null } {
  const bucket = item.image_bucket ?? item.bucket;
  const path = item.image_path ?? item.path;
  return {
    ...item,
    imageUrl: getPublicStorageUrl(bucket, path),
  };
}

// Использование
const races = data.map(withImageUrl);
```

---

## CODE-02: Сложные условия в switch/case
**Приоритет:** P2
**Принцип:** KISS

**Файл:** `app/library/inhabitants/races/[slug]/RaceDetailClient.tsx:160-270`

**Проблема:**
Огромный switch внутри useMemo со сложной логикой:

```typescript
const content = useMemo(() => {
  switch (section) {
    case "about":
      // 20+ строк
    case "skills":
      // 15+ строк
    case "r_classes":
      // 25+ строк
    // ... ещё 5 case
  }
}, [/* 20+ зависимостей */]);
```

**Решение:**
Map компонентов вместо switch:

```typescript
const SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>> = {
  about: AboutSection,
  skills: SkillsSection,
  r_classes: RaceClassesSection,
  houses: GreatHousesSection,
  history: HistorySection,
  map: MapSection,
  families: MoonElfFamiliesSection,
  squads: LegendarySquadsSection,
};

// В компоненте
const SectionComponent = SECTION_COMPONENTS[section];
return <SectionComponent {...sectionProps} />;
```

---

## CODE-03: Magic strings
**Приоритет:** P2
**Принцип:** Clean Code

**Файлы:** Множество файлов

**Проблема:**
Строковые литералы разбросаны по коду:

```typescript
// В разных файлах
setSection("about");
if (section === "skills") { ... }
tab === "desc"
bucket ?? "art"
```

**Решение:**
Централизовать константы:

```typescript
// lib/constants.ts
export const SECTIONS = {
  ABOUT: "about",
  SKILLS: "skills",
  CLASSES: "r_classes",
  HOUSES: "houses",
  HISTORY: "history",
  MAP: "map",
  FAMILIES: "families",
  SQUADS: "squads",
} as const;

export const TABS = {
  DESC: "desc",
  TAGS: "tags",
  INFO: "info",
  COUNCIL: "council",
  MEMBERS: "members",
} as const;

export const DEFAULTS = {
  BUCKET: "art",
} as const;

// Типы из констант
export type SectionKey = typeof SECTIONS[keyof typeof SECTIONS];
export type AboutTab = typeof TABS.DESC | typeof TABS.TAGS;
```

---

## CODE-04: Функции с множеством параметров
**Приоритет:** P3
**Принцип:** Clean Code

**Файл:** `lib/supabase/publicUrl.ts`

**Проблема:**
Функция принимает nullable параметры с fallback логикой:

```typescript
export function getPublicStorageUrl(
  bucket?: string | null,
  path?: string | null
): string | null {
  const b = bucket ?? "art";
  const p = path?.replace(/^\/+/, "") ?? "";
  // ...
}
```

**Решение:**
Использовать объект параметров:

```typescript
interface StorageUrlParams {
  bucket?: string;
  path?: string;
}

const DEFAULTS: Required<StorageUrlParams> = {
  bucket: "art",
  path: "",
};

export function getPublicStorageUrl(params: StorageUrlParams = {}): string | null {
  const { bucket, path } = { ...DEFAULTS, ...params };

  if (!path) return null;

  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}
```

---

## CODE-05: Отсутствие единого error boundary
**Приоритет:** P2
**Принцип:** SOLID (Single Responsibility)

**Проблема:**
Каждая страница обрабатывает ошибки по-своему. Нет централизованного error boundary.

**Решение:**
Создать Error Boundary компонент:

```typescript
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <h2>Что-то пошло не так</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// app/error.tsx (Next.js error boundary)
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <h2>Произошла ошибка</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Попробовать снова</button>
    </div>
  );
}
```

---

## CODE-06: Race condition при множественных setState
**Приоритет:** P2
**Принцип:** Clean Code

**Файл:** `app/library/inhabitants/races/[slug]/RaceDetailClient.tsx:74-78`

**Проблема:**
Множественные setState вызовы при смене slug:

```typescript
useEffect(() => {
  setSection("about");
  setAboutTab("desc");
  setSkillIndex(0);
  // ещё 5+ setState
}, [detail.slug]);
```

**Влияние:**
- Несколько ре-рендеров
- Потенциальное несогласованное состояние

**Решение:**
Объединить связанное состояние:

```typescript
interface ViewState {
  section: SectionKey;
  aboutTab: AboutTab;
  skillIndex: number;
  activeClassId: number | null;
  // ...
}

const INITIAL_STATE: ViewState = {
  section: "about",
  aboutTab: "desc",
  skillIndex: 0,
  activeClassId: null,
};

const [viewState, setViewState] = useState<ViewState>(INITIAL_STATE);

// Сброс одним вызовом
useEffect(() => {
  setViewState(INITIAL_STATE);
}, [detail.slug]);

// Обновление части состояния
const updateView = (partial: Partial<ViewState>) => {
  setViewState((prev) => ({ ...prev, ...partial }));
};
```
