# UI компоненты и стили

Проблемы организации UI-слоя: стили, компоненты, паттерны.

---

## UICOMP-01: Дублирование цветов и градиентов
**Приоритет:** P0

**Проблема:**
Одни и те же цвета определены в 6+ файлах с разными именами:

```typescript
// RaceSlider.tsx:178-186
const ether = "rgba(125,211,252,0.55)";
const textMain = "rgba(235, 245, 255, 0.92)";

// RaceDetailClient.tsx:271-275
const ink = "rgba(235, 245, 255, 0.92)";
const glowCyan = "rgba(125,211,252,0.20)";

// SkillsSection.tsx:16-19
const ink = "rgba(235, 245, 255, 0.92)";
const gold = "rgba(244, 214, 123, 0.60)";

// RaceClassesSection.tsx:192-195
const goldLight = "rgba(244, 214, 123, 0.92)";
const cyan = "rgba(125, 211, 252, 0.92)";

// GreatHousesSection.tsx:180-183
"rgba(235, 245, 255, 0.92)"
"rgba(244, 214, 123, 0.85)"

// LegendarySquadsSection.tsx:180-182
const ink = "rgba(235, 245, 255, 0.92)";
const goldSoft = "rgba(244, 214, 123, 0.16)";
```

**Влияние:**
- Невозможно изменить цвет глобально
- Разные имена для одного цвета (`textMain` vs `ink`)
- CSS переменные в `globals.css` **не используются**

**Решение:**
```typescript
// lib/ui/tokens.ts
export const colors = {
  // Текст
  ink: "rgba(235, 245, 255, 0.92)",
  inkSoft: "rgba(214, 230, 255, 0.75)",
  inkMuted: "rgba(235, 245, 255, 0.60)",

  // Акценты
  gold: "rgba(244, 214, 123, 0.85)",
  goldSoft: "rgba(244, 214, 123, 0.20)",
  goldLight: "rgba(244, 214, 123, 0.92)",

  // Glow
  cyan: "rgba(125, 211, 252, 0.55)",
  cyanSoft: "rgba(125, 211, 252, 0.20)",
  violet: "rgba(167, 139, 250, 0.45)",

  // Background
  base1: "#0f1424",
  base2: "#141a33",
} as const;

export const shadows = {
  panel: "0 18px 50px rgba(0,0,0,0.45)",
  button: "0 8px 18px rgba(0,0,0,0.3)",
  buttonActive: "0 10px 24px rgba(0,0,0,0.4)",
  glow: "0 0 24px rgba(255,215,0,0.5)",
} as const;

// Использование
import { colors, shadows } from "@/lib/ui/tokens";
<div style={{ color: colors.ink, boxShadow: shadows.panel }}>
```

---

## UICOMP-02: Дублирование компонентов SubHeader и TagsRow
**Приоритет:** P0

**Файлы:**
- `app/library/inhabitants/races/[slug]/sections/_shared.tsx:6-80`
- `app/library/inhabitants/races/[slug]/sections/SkillsSection.tsx:296-368`

**Проблема:**
Компоненты `SubHeader` и `TagsRow` реализованы дважды:

```typescript
// _shared.tsx — первая реализация
export function SubHeader({ title }: { title: string }) { ... }
export function TagsRow({ tags }: { tags?: string[] }) { ... }

// SkillsSection.tsx — КОПИЯ
function SubHeader({ title }: { title: string }) { ... }  // строки 296-327
function TagsRow({ tags }: { tags?: string[] }) { ... }   // строки 329-368
```

**Влияние:**
- Изменение в одном месте не влияет на другое
- Два источника истины

**Решение:**
Удалить дубликаты из `SkillsSection.tsx`, использовать импорт:

```typescript
// SkillsSection.tsx
import { SubHeader, TagsRow } from "./_shared";
```

---

## UICOMP-03: Inline hover через JS вместо CSS
**Приоритет:** P0

**Файлы:**
- `components/RaceSlider.tsx:430-451`
- `app/library/inhabitants/races/[slug]/sections/GreatHousesSection.tsx:88-98`

**Проблема:**
Hover-эффекты реализованы через JS манипуляции DOM:

```typescript
onMouseEnter={(e) => {
  const frame = e.currentTarget.parentElement;
  if (frame) frame.style.boxShadow = activeHoverGlow;
  e.currentTarget.style.background = ctaHoverGoldBg;
  e.currentTarget.style.color = "rgba(35, 20, 5, 0.92)";
  e.currentTarget.style.textShadow = "0 1px 10px rgba(0,0,0,0.35)";
  e.currentTarget.style.boxShadow = ctaHoverShadow;
}}
onMouseLeave={(e) => {
  const frame = e.currentTarget.parentElement;
  if (frame) frame.style.boxShadow = "";
  e.currentTarget.style.background = ctaBaseBg;
  // ...
}}
```

**Влияние:**
- Layout thrashing на каждый hover
- Обход React reconciliation
- Не работает с SSR
- Сложно дебажить

**Решение:**
CSS классы или Tailwind:

```css
/* globals.css */
.cta-button {
  background: var(--cta-base-bg);
  transition: all 0.2s ease;
}
.cta-button:hover {
  background: var(--cta-hover-bg);
  box-shadow: var(--cta-hover-shadow);
}
```

Или Tailwind с arbitrary values:

```tsx
<button className="
  bg-[var(--cta-base-bg)]
  hover:bg-[var(--cta-hover-bg)]
  hover:shadow-[var(--cta-hover-shadow)]
  transition-all duration-200
">
```

---

## UICOMP-04: Монолитный RaceSlider (624 строки)
**Приоритет:** P1

**Файл:** `components/RaceSlider.tsx`

**Проблема:**
Один файл содержит 4 компонента и всю логику:

```
RaceSlider.tsx (624 строк)
├── CornerArrow (строки 19-39) — SVG компонент
├── FitTitle (строки 52-165) — логика fitting текста + ResizeObserver
├── RaceCard (строки 168-478) — карточка с 277 строк inline стилей
└── RaceSlider (строки 480-624) — навигация и сетка
```

**Решение:**
Разбить на файлы:

```
components/
├── RaceSlider/
│   ├── index.tsx           # Основной слайдер
│   ├── RaceCard.tsx        # Карточка расы
│   ├── FitTitle.tsx        # Fitting текста
│   ├── CornerArrow.tsx     # SVG стрелка
│   └── styles.ts           # Токены стилей
```

---

## UICOMP-05: Отсутствует переиспользуемый Tabs компонент
**Приоритет:** P1

**Файлы:**
- `RaceClassesSection.tsx:54-101`
- `GreatHousesSection.tsx:191-233`
- `MoonElfFamiliesSection.tsx:204-241`
- `LegendarySquadsSection.tsx:343-385`

**Проблема:**
Одинаковая разметка табов копируется в каждой секции:

```tsx
// Везде одно и то же
<button
  className="rounded-full border px-2.5 py-1.5 transition"
  style={{
    borderColor: active ? "rgba(...)" : "rgba(...)",
    background: active ? `radial-gradient(...)` : "rgba(...)",
    boxShadow: active ? "0 10px 24px..." : "0 8px 18px...",
    backdropFilter: "blur(10px)",
  }}
>
  <span style={{ fontFamily: "var(--font-buttons)", ... }}>
    {t.label}
  </span>
</button>
```

**Решение:**
```typescript
// components/ui/Tabs.tsx
interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          active={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </TabButton>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1.5 transition backdrop-blur-[10px]",
        active ? "border-gold/60 bg-gold-gradient shadow-active" : "border-white/10 bg-dark/40 shadow-base"
      )}
    >
      <span className="font-buttons text-sm">{children}</span>
    </button>
  );
}
```

---

## UICOMP-06: Дублирование Grid+Panel паттерна
**Приоритет:** P1

**Файлы:**
- `GreatHousesSection.tsx` (436 строк)
- `MoonElfFamiliesSection.tsx` (320 строк)
- `LegendarySquadsSection.tsx` (599 строк)

**Проблема:**
Все три секции используют одинаковую структуру:
1. Сетка карточек
2. При клике — раскрывается панель с информацией
3. Внутри панели — табы и контент

**Решение:**
Создать generic компоненты:

```typescript
// components/ui/SelectableGrid.tsx
interface SelectableGridProps<T> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  renderPanel: (item: T) => ReactNode;
  columns?: number;
}

export function SelectableGrid<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  renderItem,
  renderPanel,
  columns = 4,
}: SelectableGridProps<T>) {
  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {items.map((item) => (
        <div key={item.id} onClick={() => onSelect(item.id)}>
          {renderItem(item, item.id === selectedId)}
        </div>
      ))}
      {selectedItem && (
        <div className="col-span-full">
          {renderPanel(selectedItem)}
        </div>
      )}
    </div>
  );
}
```

---

## UICOMP-07: Helper-функции внутри компонентов
**Приоритет:** P2

**Файлы:**
- `RaceClassesSection.tsx:9-26`
- `RaceSlider.tsx:19-39, 52-165`

**Проблема:**
Утилитарные функции определены внутри файлов компонентов:

```typescript
// RaceClassesSection.tsx
function toUpperSafe(s?: string | null) {
  return (s ?? "").toUpperCase();
}

function normalizeSkills(skills: ClassSkill[] | undefined) {
  // 14 строк логики
}
```

**Решение:**
```typescript
// lib/utils/string.ts
export function toUpperSafe(s?: string | null): string {
  return (s ?? "").toUpperCase();
}

// lib/utils/skills.ts
export function normalizeSkills(skills: ClassSkill[] | undefined): NormalizedSkill[] {
  // логика
}
```

---

## UICOMP-08: Placeholder дублирует основной компонент
**Приоритет:** P2

**Файл:** `SkillsSection.tsx:99-190`

**Проблема:**
`RaceSkillPanel` и `RaceSkillPanelPlaceholder` — почти идентичный код:

```typescript
// RaceSkillPanel (строки 99-150)
function RaceSkillPanel({ skill }: { skill: RaceSkill }) {
  return (
    <div style={{ opacity: 1 }}>
      {/* контент */}
    </div>
  );
}

// RaceSkillPanelPlaceholder (строки 152-190)
function RaceSkillPanelPlaceholder() {
  return (
    <div style={{ opacity: 0.7 }}>
      {/* тот же контент с placeholder текстом */}
    </div>
  );
}
```

**Решение:**
```typescript
interface RaceSkillPanelProps {
  skill?: RaceSkill;
  isPlaceholder?: boolean;
}

function RaceSkillPanel({ skill, isPlaceholder }: RaceSkillPanelProps) {
  const opacity = isPlaceholder ? 0.7 : 1;
  const title = skill?.name ?? "Выберите навык";
  const description = skill?.description ?? "Описание навыка появится здесь";

  return (
    <div style={{ opacity }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

---

## UICOMP-09: Panel-блоки дублируют стили
**Приоритет:** P2

**Файлы:**
- `RaceClassesSection.tsx:232`
- `GreatHousesSection.tsx:168`
- `MoonElfFamiliesSection.tsx:181`
- `LegendarySquadsSection.tsx:314`

**Проблема:**
Одинаковые inline стили для панелей:

```tsx
// Везде одно и то же
<div
  className="rounded-2xl border border-white/10 bg-black/25 p-5"
  style={{
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  }}
>
```

**Решение:**
```typescript
// components/ui/Panel.tsx
interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/25 p-5",
        "backdrop-blur-[10px] shadow-panel",
        className
      )}
    >
      {children}
    </div>
  );
}

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,0.45)",
      },
    },
  },
};
```

---

## UICOMP-10: CSS переменные не используются
**Приоритет:** P2

**Файл:** `app/globals.css:3-26`

**Проблема:**
CSS переменные определены, но игнорируются:

```css
/* globals.css — определены */
:root {
  --ui-gold: #d7c79a;
  --ui-cyan: #36d2ff;
  --ui-violet: #7b4dff;
}

/* Компоненты — используют другие значения */
const gold = "rgba(244, 214, 123, 0.85)";  // НЕ --ui-gold
const cyan = "rgba(125, 211, 252, 0.55)";  // НЕ --ui-cyan
```

**Решение:**
Либо использовать CSS vars, либо удалить неиспользуемые:

```css
/* globals.css */
:root {
  /* Текст */
  --color-ink: rgba(235, 245, 255, 0.92);
  --color-ink-soft: rgba(214, 230, 255, 0.75);

  /* Акценты */
  --color-gold: rgba(244, 214, 123, 0.85);
  --color-gold-soft: rgba(244, 214, 123, 0.20);

  /* Glow */
  --color-cyan: rgba(125, 211, 252, 0.55);
  --color-violet: rgba(167, 139, 250, 0.45);
}
```

```typescript
// В компонентах
<span style={{ color: "var(--color-ink)" }}>

// Или через Tailwind
// tailwind.config.js
colors: {
  ink: "var(--color-ink)",
  gold: "var(--color-gold)",
}
// Использование
<span className="text-ink">
```

---

## UICOMP-11: Отсутствует UI-kit структура
**Приоритет:** P1

**Проблема:**
- `_shared.tsx` находится в `races/[slug]/sections/`, но используется шире
- Нет централизованного места для UI компонентов
- Компоненты разбросаны

**Текущая структура:**
```
components/
  ├── NavButton.tsx
  ├── PageShell.tsx
  └── RaceSlider.tsx

app/.../sections/
  └── _shared.tsx  # SubHeader, TagsRow, TextBlock
```

**Решение:**
```
components/
├── ui/
│   ├── index.ts           # Экспорты
│   ├── Button.tsx
│   ├── Tabs.tsx
│   ├── Panel.tsx
│   ├── SubHeader.tsx
│   ├── TagsRow.tsx
│   └── TextBlock.tsx
├── layout/
│   ├── PageShell.tsx
│   └── NavButton.tsx
└── race/
    ├── RaceSlider/
    │   ├── index.tsx
    │   ├── RaceCard.tsx
    │   └── FitTitle.tsx
    └── sections/
        ├── AboutSection.tsx
        ├── SkillsSection.tsx
        └── ...
```

---

## UICOMP-12: Смешивание Tailwind и inline styles
**Приоритет:** P2

**Все компоненты**

**Проблема:**
Один элемент использует и className и style:

```tsx
<div
  className="rounded-2xl border p-5"  // Tailwind
  style={{                             // Inline
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  }}
>
```

**Решение:**
Вынести в Tailwind config или CSS modules:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        panel: "10px",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,0.45)",
      },
    },
  },
};
```

```tsx
<div className="rounded-2xl border p-5 backdrop-blur-panel shadow-panel">
```

---

## Сводка

| ID | Приоритет | Проблема |
|----|-----------|----------|
| UICOMP-01 | P0 | Дублирование цветов в 6+ файлах |
| UICOMP-02 | P0 | Дублирование SubHeader/TagsRow |
| UICOMP-03 | P0 | Inline hover через JS |
| UICOMP-04 | P1 | Монолитный RaceSlider (624 строки) |
| UICOMP-05 | P1 | Нет переиспользуемого Tabs |
| UICOMP-06 | P1 | Дублирование Grid+Panel паттерна |
| UICOMP-07 | P2 | Helper-функции внутри компонентов |
| UICOMP-08 | P2 | Placeholder дублирует Panel |
| UICOMP-09 | P2 | Panel-блоки дублируют стили |
| UICOMP-10 | P2 | CSS переменные не используются |
| UICOMP-11 | P1 | Отсутствует UI-kit структура |
| UICOMP-12 | P2 | Смешивание Tailwind и inline styles |

**P0:** 3 | **P1:** 4 | **P2:** 5
