# UI и компоненты

## UI-01: Inline style mutations на mouse events
**Приоритет:** P1

**Файлы:**
- `components/RaceSlider.tsx:430-437, 582-587`
- `app/library/inhabitants/races/[slug]/sections/GreatHousesSection.tsx:88-98`

**Проблема:**
Прямые мутации DOM стилей вместо React-паттернов:

```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.boxShadow = activeHoverGlow;
  e.currentTarget.style.color = "rgba(35, 20, 5, 0.92)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.boxShadow = "";
  e.currentTarget.style.color = "";
}}
```

**Влияние:**
- Обход React reconciliation
- Сложнее отлаживать
- Не работает с SSR
- Не масштабируется

**Решение:**
Вариант A — CSS классы:
```css
/* globals.css */
.card-hover:hover {
  box-shadow: var(--active-hover-glow);
  color: rgba(35, 20, 5, 0.92);
}
```

Вариант B — Tailwind:
```tsx
<div className="hover:shadow-[0_0_24px_rgba(255,215,0,0.5)] hover:text-amber-900/90">
```

Вариант C — состояние (если нужна логика):
```tsx
const [isHovered, setIsHovered] = useState(false);

<div
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={isHovered ? hoverStyles : baseStyles}
>
```

---

## UI-02: Layout thrashing в RaceSlider
**Приоритет:** P1

**Файл:** `components/RaceSlider.tsx:72-104`

**Проблема:**
`getBoundingClientRect()` вызывается в цикле до 120 раз:

```typescript
while (measure() > maxW && letterEm > minLetterEm && guard < 120) {
  letterEm = Math.max(minLetterEm, letterEm - 0.01);
  el.style.letterSpacing = `${letterEm.toFixed(2)}em`;
  guard += 1;
}
```

**Влияние:**
- Forced synchronous layout на каждой итерации
- Заметные лаги при ресайзе

**Решение:**
Бинарный поиск (~7 итераций вместо 120):

```typescript
function fitText(el: HTMLElement, maxW: number) {
  const measure = () => el.getBoundingClientRect().width;
  let low = minLetterEm;
  let high = maxLetterEm;

  while (high - low > 0.01) {
    const mid = (low + high) / 2;
    el.style.letterSpacing = `${mid.toFixed(2)}em`;

    if (measure() > maxW) {
      high = mid;
    } else {
      low = mid;
    }
  }

  el.style.letterSpacing = `${low.toFixed(2)}em`;
}
```

---

## UI-03: @ts-ignore для RAF ID в RaceSlider
**Приоритет:** P1

**Файл:** `components/RaceSlider.tsx:112-122`

**Проблема:**
Хранение requestAnimationFrame ID через хак с any:

```typescript
(applyFit as any)._raf2 = id2; // @ts-ignore
// ...
const id2 = (applyFit as any)._raf2; // @ts-ignore
```

**Решение:**
Использовать useRef:

```typescript
const rafIdRef = useRef<number | null>(null);

useLayoutEffect(() => {
  const applyFit = () => {
    // ...
  };

  // Отмена предыдущего RAF
  if (rafIdRef.current) {
    cancelAnimationFrame(rafIdRef.current);
  }

  rafIdRef.current = requestAnimationFrame(applyFit);

  return () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  };
}, [text]);
```

---

## UI-04: Неэффективный useMemo в RaceDetailClient
**Приоритет:** P1

**Файл:** `app/library/inhabitants/races/[slug]/RaceDetailClient.tsx:160-270`

**Проблема:**
useMemo с 20+ зависимостями пересчитывается почти всегда:

```typescript
const content = useMemo(() => {
  // 100+ строк switch/case
}, [
  section, aboutTab, skillIndex, detail, raceSkills, raceClasses,
  activeClassId, greatHouses, history, activeHouseId, hoveredHouseId,
  houseTab, houseTooltip, houseGridCols, moonFamilies, activeMoonFamilyId,
  moonFamilyTab, moonSquads, activeMoonSquadId, squadGridCols,
]);
```

**Решение:**
Вынести рендеринг секций в отдельные компоненты. Каждый компонент сам управляет своим состоянием и мемоизацией:

```tsx
// RaceDetailClient.tsx
function RaceDetailClient({ detail, ... }: Props) {
  const [section, setSection] = useState<SectionKey>("about");

  return (
    <div>
      <TabBar section={section} onChange={setSection} />

      {section === "about" && <AboutSection detail={detail} />}
      {section === "skills" && <SkillsSection skills={raceSkills} />}
      {section === "r_classes" && <ClassesSection classes={raceClasses} />}
      {/* ... */}
    </div>
  );
}
```

---

## UI-05: Проблемные зависимости useEffect
**Приоритет:** P2

**Файл:** `components/RaceSlider.tsx:126`

**Проблема:**
`applyFit` используется внутри useLayoutEffect, но не в зависимостях:

```typescript
useLayoutEffect(() => {
  applyFit(); // Используется
  // ...
}, [text]); // applyFit не в зависимостях
```

**Решение:**
Обернуть в useCallback или определить внутри эффекта:

```typescript
useLayoutEffect(() => {
  const applyFit = () => {
    // логика
  };

  applyFit();
  window.addEventListener('resize', applyFit);

  return () => window.removeEventListener('resize', applyFit);
}, [text, maxLetterEm, minLetterEm]); // все используемые значения
```
