"use client";

import React, { useEffect, useMemo, useState } from "react";

import { getCatalogBooks } from "@/lib/data/catalogs";
import { getMagicSchools } from "@/lib/data/magicSchool";
import { getMagicPaths, type MagicPath } from "@/lib/data/magicPath";
import { getTalents, type TalentRow } from "@/lib/data/talents";

type SelectOption = { value: string; label: string };

type CatalogBookRow = {
  id: string;
  group: string | null;
  name: string | null;
};

const EMPTY_OPTION: SelectOption = { value: "", label: "—" };

function loopClamp(next: number, min: number, max: number) {
  if (next < min) return max;
  if (next > max) return min;
  return next;
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="decrease"
        onClick={() => onChange(loopClamp(value - 1, min, max))}
        className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.06]"
      >
        ‹
      </button>
      <div className="min-w-10 select-none text-center text-sm font-semibold text-white/85">{value}</div>
      <button
        type="button"
        aria-label="increase"
        onClick={() => onChange(loopClamp(value + 1, min, max))}
        className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.06]"
      >
        ›
      </button>
    </div>
  );
}

function SelectField({
  options,
  value,
  onChange,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20"
    >
      {options.map((o) => (
        <option key={`${o.value}:${o.label}`} value={o.value} className="bg-[#0b1020]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition placeholder:text-white/30 focus:border-white/20"
    />
  );
}

function NumberField({
  value,
  onChange,
  placeholder,
  allowEmpty = false,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(allowEmpty ? "" : 0);
          return;
        }
        const next = Number(raw);
        onChange(Number.isFinite(next) ? next : 0);
      }}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition placeholder:text-white/30 focus:border-white/20"
    />
  );
}

function CellLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-[12px] font-semibold text-white/70">{children}</div>;
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-4">
        <div className="text-base font-semibold text-white/85">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-white/50">{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}

type SpellResourceRow = {
  id: string;
  resourceTypeId: string; // required in spell
  resourceCostId: string; // required in spell
  resourceCostCustom: string; // optional manual override (UI only for now)
};

type EffectBlock = {
  id: string;

  // Row 1
  isCrit: boolean;
  attackDistanceKind: string; // attack_category (required)
  targetType: string; // type_target (required)
  targetKind: string; // attack_focus (required)
  distance: number; // number (required)
  attackType: string; // attack_type (required)
  attackDirection: string; // direction_attack (optional)

  // Row 2
  impactType: string; // impact (required)
  impactDuration: number; // number
  impactValue: string; // input
  resistanceEffectiveness: string; // potency_resist (optional)
  effect: string; // effect (optional)
  effectDuration: number; // number
  effectValue: string; // input

  // Row 3
  dependentTalent: string; // (db talents) optional
  movementType: string; // move_type (optional)
  movementValue: number | ""; // number (optional)
  maintainability: string; // concentration (optional)
  resourceType: string; // resource_type (optional)
  resourceCost: string; // depends on resource_type (optional)

  // Row 4 (new)
  replacementEffectId: string; // pick from existing effects (optional)

  // Conditions (1+ rows, default "Нет условий")
  conditions: Array<{
    id: string;
    conditionId: string; // catalogs_book.id (group=conditions)
    description: string; // only for "Специальные условия"
  }>;
};

function uid() {
  // Prefer crypto UUID on the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== "undefined" ? crypto : null;
  if (c && typeof c.randomUUID === "function") return c.randomUUID() as string;
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEffectBlock(): EffectBlock {
  return {
    id: uid(),

    isCrit: false,
    attackDistanceKind: "",
    targetType: "",
    targetKind: "",
    distance: 0,
    attackType: "",
    attackDirection: "",

    impactType: "",
    impactDuration: 0,
    impactValue: "",
    resistanceEffectiveness: "",
    effect: "",
    effectDuration: 0,
    effectValue: "",

    dependentTalent: "",
    movementType: "",
    movementValue: "",
    maintainability: "",
    resourceType: "",
    resourceCost: "",

    replacementEffectId: "",

    conditions: [
      {
        id: uid(),
        conditionId: "",
        description: "",
      },
    ],
  };
}

// === Resource cost filtering (spell + effects) ===
// Your table is the source of truth for which cost items are allowed per resource type name.
const RESOURCE_COST_FALLBACK_LABELS = [
  "Без затрат",
  "Заклинание ученика",
  "Заклинание мастера",
  "Заклинание грандмастера",
  "Заклинание эксперта",
  "Концентрация навыка",
  "Затраты жизни навыка",
  "Заклинание ученика двойные затраты",
  "Заклинание мастера двойные затраты",
  "Заклинание грандмастера двойные затраты",
  "Заклинание эксперта двойные затраты",
  "Длительность стойки",
  "Время восстановления навыка",
  "Половинные затраты жетонов",
  "Полные затраты жетонов",
  "Сверхзатраты жетонов",
];

function getAllowedCostLabelsByResourceTypeName(resourceTypeName: string): string[] {
  const n = (resourceTypeName || "").toLowerCase();

  const allow: string[] = [];

  const includes = (s: string) => n.includes(s.toLowerCase());

  if (includes("всегда")) {
    allow.push("Без затрат");
    return allow;
  }

  const isMana = includes("затраты маны");
  const isHealth = includes("затраты здоровья") || includes("затраты жизни");
  // Base presets
  if (isMana) {
    allow.push(
      "Заклинание ученика",
      "Заклинание мастера",
      "Заклинание грандмастера",
      "Заклинание эксперта",
      "Концентрация навыка",
    );
  }
  if (isHealth) {
    allow.push("Затраты жизни навыка");
  }

  // Items marked as "mana/health" in your sheet must appear for BOTH mana and health.
  if (includes("/") || isMana || isHealth) {
    allow.push(
      "Заклинание ученика двойные затраты",
      "Заклинание мастера двойные затраты",
      "Заклинание грандмастера двойные затраты",
      "Заклинание эксперта двойные затраты",
    );
  }

  if (includes("время восстановления")) {
    allow.push("Длительность стойки", "Время восстановления навыка");
  }

  if (includes("затраты свободных действий") || includes("жетонов нетерпимости")) {
    allow.push("Половинные затраты жетонов", "Полные затраты жетонов", "Сверхзатраты жетонов");
  }

  // Fallback: if nothing matched, allow all (so UI never becomes empty)
  if (allow.length === 0) return [...RESOURCE_COST_FALLBACK_LABELS];

  return allow;
}

export function SpellBuilderForm() {
  // Header fields (draft)
  const [spellName, setSpellName] = useState<string>("");
  const [spellDescription, setSpellDescription] = useState<string>("");

  // Reference data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schools, setSchools] = useState<any[]>([]);
  const [paths, setPaths] = useState<MagicPath[]>([]);
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [catalogBooks, setCatalogBooks] = useState<CatalogBookRow[]>([]);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedPathId, setSelectedPathId] = useState<string>("");
  const [spellLevel, setSpellLevel] = useState<number>(1);
  const [talentExceptionId, setTalentExceptionId] = useState<string>(""); // can be empty

  // Spell resources (1+ rows)
  const [spellResources, setSpellResources] = useState<SpellResourceRow[]>([
    { id: uid(), resourceTypeId: "", resourceCostId: "", resourceCostCustom: "" },
  ]);

  // Effects
  const [effects, setEffects] = useState<EffectBlock[]>([createEffectBlock()]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const results = await Promise.allSettled([getMagicSchools(), getMagicPaths(), getTalents(), getCatalogBooks()]);

      if (!mounted) return;

      const schoolsData = results[0].status === "fulfilled" ? (results[0].value ?? []) : [];
      const pathsData = results[1].status === "fulfilled" ? (results[1].value ?? []) : [];
      const talentsData = results[2].status === "fulfilled" ? (results[2].value ?? []) : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catalogsData = results[3].status === "fulfilled" ? ((results[3].value ?? []) as any[]) : [];

      setSchools(schoolsData);
      setPaths(pathsData);
      setTalents(talentsData);

      const normalizedCatalogs: CatalogBookRow[] = (catalogsData ?? [])
        .map((r) => ({
          id: String(r?.id ?? ""),
          group: (r?.group ?? null) as string | null,
          name: (r?.name ?? null) as string | null,
        }))
        .filter((r) => r.id && r.group && r.name);

      setCatalogBooks(normalizedCatalogs);

      const firstSchool = schoolsData[0];
      if (firstSchool?.id) setSelectedSchoolId(String(firstSchool.id));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const schoolOptions = useMemo<SelectOption[]>(
    () => (schools ?? []).map((s: any) => ({ value: String(s.id), label: String(s.name ?? "—") })),
    [schools],
  );

  const filteredPaths = useMemo<MagicPath[]>(
    () => (paths ?? []).filter((p) => !!selectedSchoolId && p.id_magic_school === selectedSchoolId),
    [paths, selectedSchoolId],
  );

  const pathOptions = useMemo<SelectOption[]>(
    () => filteredPaths.map((p) => ({ value: String(p.id), label: String(p.name ?? "—") })),
    [filteredPaths],
  );

  useEffect(() => {
    const firstPath = filteredPaths[0];
    setSelectedPathId(firstPath?.id ?? "");
  }, [selectedSchoolId, filteredPaths]);

  const talentOptions = useMemo<SelectOption[]>(
    () => {
      const base = (talents ?? [])
        .filter((t) => String(t.name ?? "").trim().length > 0)
        .map((t) => ({ value: String(t.id), label: String(t.name) }));
      return [EMPTY_OPTION, ...base];
    },
    [talents],
  );

  const catalogOptionsByGroup = useMemo<Record<string, SelectOption[]>>(() => {
    const map: Record<string, SelectOption[]> = {};
    for (const row of catalogBooks) {
      const g = row.group ?? "";
      const name = row.name ?? "";
      if (!g || !name) continue;
      if (!map[g]) map[g] = [];
      map[g].push({ value: String(row.id), label: String(name) });
    }
    return map;
  }, [catalogBooks]);

  const getCatalogGroupOptions = (group: string, required: boolean): SelectOption[] => {
    const opts = catalogOptionsByGroup[group] ?? [];
    if (required) return opts.length ? opts : [EMPTY_OPTION];
    return [EMPTY_OPTION, ...opts];
  };

  const catalogLabelById = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const row of catalogBooks) {
      if (row.id && row.name) m[String(row.id)] = String(row.name);
    }
    return m;
  }, [catalogBooks]);

  // Conditions catalog (effect-level)
  const conditionOptionsRequired = useMemo<SelectOption[]>(
    () => getCatalogGroupOptions("conditions", true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogOptionsByGroup],
  );

  const noConditionsId = useMemo(() => {
    const row = catalogBooks.find((r) => (r.group ?? "") === "conditions" && (r.name ?? "") === "Нет условий");
    return row?.id ?? conditionOptionsRequired[0]?.value ?? "";
  }, [catalogBooks, conditionOptionsRequired]);

  const specialConditionsId = useMemo(() => {
    const row = catalogBooks.find((r) => (r.group ?? "") === "conditions" && (r.name ?? "") === "Специальные условия");
    return row?.id ?? "";
  }, [catalogBooks]);

  const firstNonNoConditionId = useMemo(() => {
    const found = conditionOptionsRequired.find((o) => o.value && o.value !== noConditionsId);
    return found?.value ?? noConditionsId;
  }, [conditionOptionsRequired, noConditionsId]);

  const resourceTypeOptions = useMemo(() => getCatalogGroupOptions("resource_type", true), [catalogOptionsByGroup]);
  // "Затраты ресурса" — фиксированный список по твоей таблице, не из БД.
  const resourceCostOptionsAll = useMemo(
    () => RESOURCE_COST_FALLBACK_LABELS.map((label) => ({ value: label, label })),
    [],
  );

  const getResourceCostOptions = (resourceTypeId: string, includeEmpty: boolean): SelectOption[] => {
    const name = catalogLabelById[resourceTypeId] ?? resourceTypeId ?? "";
    const allowLabels = getAllowedCostLabelsByResourceTypeName(name);

    const filtered = resourceCostOptionsAll.filter((o) => allowLabels.includes(o.label));
    const safe = filtered.length ? filtered : resourceCostOptionsAll;

    return includeEmpty ? [EMPTY_OPTION, ...safe] : safe;
  };

  // Ensure required selects have defaults once catalogs are loaded.
  useEffect(() => {
    if (!catalogBooks.length) return;

    const first = (group: string) => (catalogOptionsByGroup[group]?.[0]?.value ?? "");

    // Normalize spell resources: ensure 1+ row and defaults.
    setSpellResources((prev) => {
      const base = prev.length ? prev : [{ id: uid(), resourceTypeId: "", resourceCostId: "", resourceCostCustom: "" }];

      const next = base.map((r) => {
        const typeId = r.resourceTypeId || first("resource_type");
        const costOpts = getResourceCostOptions(typeId, false);
        const costId = r.resourceCostId || costOpts[0]?.value || "";
        return { ...r, resourceTypeId: typeId, resourceCostId: costId, resourceCostCustom: r.resourceCostCustom ?? "" };
      });

      return next;
    });

    // Normalize effect required groups (red on your sheet)
    const requiredGroups: Array<{ key: keyof EffectBlock; group: string }> = [
      { key: "attackDistanceKind", group: "attack_category" },
      { key: "targetType", group: "type_target" },
      { key: "targetKind", group: "attack_focus" },
      { key: "attackType", group: "attack_type" },
      { key: "impactType", group: "impact" },
    ];

    setEffects((prev) =>
      prev.map((e) => {
        const patch: Partial<EffectBlock> = {};
        for (const rg of requiredGroups) {
          const cur = e[rg.key] as unknown as string;
          if (!cur) {
            const def = first(rg.group);
            if (def) patch[rg.key] = def as any;
          }
        }

        // Normalize conditions: must be 1+ rows, default to "Нет условий".
        const baseConds = Array.isArray(e.conditions) && e.conditions.length
          ? e.conditions
          : [{ id: uid(), conditionId: "", description: "" }];

        const normalizedConds = baseConds.map((c, i) => {
          const safeId = c.id || uid();
          const condId = c.conditionId || (i === 0 ? noConditionsId : firstNonNoConditionId);
          const desc = c.description ?? "";
          return { id: safeId, conditionId: condId, description: desc };
        });

        // If any non-"Нет условий" condition exists, drop "Нет условий".
        const hasNonNo = normalizedConds.some((c) => c.conditionId && c.conditionId !== noConditionsId);
        const finalConds = hasNonNo
          ? normalizedConds.filter((c) => c.conditionId && c.conditionId !== noConditionsId)
          : [{ ...normalizedConds[0], conditionId: noConditionsId, description: "" }];

        patch.conditions = finalConds;
        return Object.keys(patch).length ? { ...e, ...patch } : e;
      }),
    );
  }, [catalogBooks.length, noConditionsId, firstNonNoConditionId, catalogOptionsByGroup]);

  const updateEffect = (index: number, patch: Partial<EffectBlock>) => {
    setEffects((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const addConditionRow = (effectIndex: number) => {
    setEffects((prev) => {
      return prev.map((e, i) => {
        if (i !== effectIndex) return e;

        const cur = Array.isArray(e.conditions) && e.conditions.length ? e.conditions : [{ id: uid(), conditionId: noConditionsId, description: "" }];

        // If currently only "Нет условий", replace it with a real first condition.
        if (cur.length === 1 && cur[0]?.conditionId === noConditionsId) {
          return {
            ...e,
            conditions: [{ id: uid(), conditionId: firstNonNoConditionId, description: "" }],
          };
        }

        return {
          ...e,
          conditions: [...cur, { id: uid(), conditionId: firstNonNoConditionId, description: "" }],
        };
      });
    });
  };

  const removeConditionRow = (effectIndex: number, conditionRowIndex: number) => {
    setEffects((prev) => {
      return prev.map((e, i) => {
        if (i !== effectIndex) return e;
        const cur = Array.isArray(e.conditions) ? e.conditions : [];
        const next = cur.filter((_, ci) => ci !== conditionRowIndex);
        if (!next.length) {
          return { ...e, conditions: [{ id: uid(), conditionId: noConditionsId, description: "" }] };
        }

        // If user removed everything but left nothing meaningful, keep at least one.
        const hasNonNo = next.some((c) => c.conditionId && c.conditionId !== noConditionsId);
        return { ...e, conditions: hasNonNo ? next : [{ ...next[0], conditionId: noConditionsId, description: "" }] };
      });
    });
  };

  const updateConditionRow = (effectIndex: number, conditionRowIndex: number, patch: Partial<EffectBlock["conditions"][number]>) => {
    setEffects((prev) => {
      return prev.map((e, i) => {
        if (i !== effectIndex) return e;
        const cur = Array.isArray(e.conditions) && e.conditions.length ? e.conditions : [{ id: uid(), conditionId: noConditionsId, description: "" }];
        const next = cur.map((c, ci) => (ci === conditionRowIndex ? { ...c, ...patch } : c));

        const selectedId = next[conditionRowIndex]?.conditionId ?? "";

        // "Нет условий" is mutually exclusive.
        if (selectedId === noConditionsId) {
          return { ...e, conditions: [{ id: uid(), conditionId: noConditionsId, description: "" }] };
        }

        // If any non-no condition exists, drop all "Нет условий" rows.
        const filtered = next.filter((c) => c.conditionId && c.conditionId !== noConditionsId);

        // Clear description if not special.
        const normalized = filtered.map((c) => {
          if (c.conditionId !== specialConditionsId) return { ...c, description: "" };
          return { ...c, description: c.description ?? "" };
        });

        return { ...e, conditions: normalized.length ? normalized : [{ id: uid(), conditionId: noConditionsId, description: "" }] };
      });
    });
  };

  const addEffectAfter = (index: number) => {
    setEffects((prev) => {
      const next = [...prev];
      const nb = createEffectBlock();
      nb.conditions = [{ id: uid(), conditionId: noConditionsId, description: "" }];
      next.splice(index + 1, 0, nb);
      return next;
    });
  };

  const removeEffect = (index: number) => {
    setEffects((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateSpellResource = (index: number, patch: Partial<SpellResourceRow>) => {
    setSpellResources((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addSpellResourceRow = () => {
    setSpellResources((prev) => [
      ...prev,
      {
        id: uid(),
        resourceTypeId: resourceTypeOptions[0]?.value ?? "",
        resourceCostId: "",
        resourceCostCustom: "",
      },
    ]);
  };

  const removeSpellResourceRow = (index: number) => {
    setSpellResources((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit confirmation modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const resetToDefaults = () => {
    // Text fields
    setSpellName("");
    setSpellDescription("");

    // Base selects / numbers
    setSpellLevel(1);
    setTalentExceptionId("");

    // School / path defaults
    const firstSchoolId = schools?.[0]?.id ? String(schools[0].id) : "";
    if (firstSchoolId) {
      setSelectedSchoolId(firstSchoolId);
      // Explicitly reset the path to the first available for this school (even if the school id didn't change).
      const firstPathForSchool = (paths ?? []).find((p) => p.id_magic_school === firstSchoolId);
      setSelectedPathId(firstPathForSchool?.id ?? "");
    } else {
      setSelectedSchoolId("");
      setSelectedPathId("");
    }

    // Spell resources (must remain 1+)
    const firstResourceTypeId = resourceTypeOptions?.[0]?.value ?? "";
    const firstCost = getResourceCostOptions(firstResourceTypeId, false)?.[0]?.value ?? "";
    setSpellResources([
      {
        id: uid(),
        resourceTypeId: firstResourceTypeId,
        resourceCostId: firstCost,
        resourceCostCustom: "",
      },
    ]);

    // Effects reset: keep exactly 1 and restore required fields to first options
    const first = (group: string) => (catalogOptionsByGroup[group]?.[0]?.value ?? "");
    const e0 = createEffectBlock();
    const patched: EffectBlock = {
      ...e0,
      attackDistanceKind: first("attack_category"),
      targetType: first("type_target"),
      targetKind: first("attack_focus"),
      attackType: first("attack_type"),
      impactType: first("impact"),
      conditions: [{ id: uid(), conditionId: noConditionsId, description: "" }],
    };
    setEffects([patched]);
  };

  return (
    <div className="space-y-6">
      <Card title="Параметры заклинания" subtitle="Базовые поля. Эффекты ниже — отдельными блоками.">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[160px_1fr_1fr]">
            {/* Header row */}
            <div className="border-b border-white/10" />
            <div className="border-b border-white/10 py-4 text-center text-sm font-semibold text-white/80">
              Название заклинания
            </div>
            <div className="border-b border-white/10 py-4 text-center text-sm font-semibold text-white/80">
              Описание заклинания
            </div>

            {/* Art column */}
            <div className="row-span-5 border-r border-white/10 p-4">
              <button
                type="button"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition hover:bg-white/[0.06]"
              >
                Загрузить изображение
              </button>
            </div>

            {/* Name / Description */}
            <div className="border-b border-r border-white/10 p-4">
              <TextField value={spellName} onChange={setSpellName} placeholder="поле ввода" />
            </div>
            <div className="border-b border-white/10 p-4">
              <TextField value={spellDescription} onChange={setSpellDescription} placeholder="поле ввода" />
            </div>

            {/* School / Path */}
            <div className="border-b border-r border-white/10 p-4">
              <div className="flex flex-col gap-2">
                <CellLabel>Школа магии</CellLabel>
                <SelectField
                  options={schoolOptions.length ? schoolOptions : [EMPTY_OPTION]}
                  value={selectedSchoolId || (schoolOptions[0]?.value ?? "")}
                  onChange={setSelectedSchoolId}
                />
              </div>
            </div>
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-col gap-2">
                <CellLabel>Путь магии</CellLabel>
                <SelectField
                  options={pathOptions.length ? pathOptions : [EMPTY_OPTION]}
                  value={selectedPathId || (pathOptions[0]?.value ?? "")}
                  onChange={setSelectedPathId}
                />
              </div>
            </div>

            {/* Level / Talent exception */}
            <div className="border-b border-r border-white/10 p-4">
              <div className="flex flex-col gap-2">
                <CellLabel>Уровень заклинания</CellLabel>
                <div className="flex items-center justify-center">
                  <Stepper value={spellLevel} onChange={setSpellLevel} />
                </div>
              </div>
            </div>
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-col gap-2">
                <CellLabel>Талант-исключение</CellLabel>
                <SelectField options={talentOptions} value={talentExceptionId} onChange={setTalentExceptionId} />
              </div>
            </div>

            {/* Spell resources */}
            <div className="border-r border-white/10 p-4">
              <div className="text-center text-[12px] font-semibold text-white/70">Тип ресурса</div>
            </div>
            <div className="p-4">
              <div className="text-center text-[12px] font-semibold text-white/70">Затраты ресурса</div>
            </div>

            <div className="border-r border-white/10 p-4">
              <div className="space-y-3">
                {spellResources.map((r, i) => {
                  const canRemove = spellResources.length > 1;
                  return (
                    <div key={r.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SelectField
                          options={resourceTypeOptions.length ? resourceTypeOptions : [EMPTY_OPTION]}
                          value={r.resourceTypeId}
                          onChange={(v) => {
                            const nextType = v;
                            const nextCostOpts = getResourceCostOptions(nextType, false);
                            updateSpellResource(i, {
                              resourceTypeId: nextType,
                              resourceCostId: nextCostOpts[0]?.value ?? "",
                            });
                          }}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="add resource row"
                          onClick={addSpellResourceRow}
                          className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition hover:bg-white/[0.06]"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label="remove resource row"
                          onClick={() => removeSpellResourceRow(i)}
                          disabled={!canRemove}
                          className={`h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition ${
                            canRemove ? "hover:bg-white/[0.06]" : "opacity-40"
                          }`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {spellResources.map((r, i) => {
                  const costOptions = getResourceCostOptions(r.resourceTypeId, false);
                  const value = r.resourceCostId || costOptions[0]?.value || "";
                  return (
                    <div key={`${r.id}:cost`} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SelectField
                          options={costOptions.length ? costOptions : [EMPTY_OPTION]}
                          value={value}
                          onChange={(v) => updateSpellResource(i, { resourceCostId: v })}
                        />
                      </div>
                      <div className="w-[180px]">
                        <TextField
                          value={r.resourceCostCustom ?? ""}
                          onChange={(v) => updateSpellResource(i, { resourceCostCustom: v })}
                          placeholder="или поле ввода"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Эффекты заклинания" subtitle="1+ блоков. Красные поля обязательны, синие могут быть пустыми.">
        <div className="space-y-6">
          {effects.map((e, idx) => {
            const canRemove = effects.length > 1;
            const replacementOptions: SelectOption[] = [
              EMPTY_OPTION,
              ...effects
                .filter((x) => x.id !== e.id)
                .map((x) => ({ value: x.id, label: `Эффект ${effects.findIndex((y) => y.id === x.id) + 1}` })),
            ];

            return (
              <div key={e.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur">
                  <div className="text-sm font-semibold text-white/85">Эффект {idx + 1}</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label="add effect"
                      onClick={() => addEffectAfter(idx)}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition hover:bg-white/[0.06]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      aria-label="remove effect"
                      onClick={() => removeEffect(idx)}
                      disabled={!canRemove}
                      className={`h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition ${
                        canRemove ? "hover:bg-white/[0.06]" : "opacity-40"
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-x-4 gap-y-4 p-4">
                  {/* Row 1 */}
                  <div className="flex flex-col gap-2">
                    <CellLabel>Крит?</CellLabel>
                    <div className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <input
                        type="checkbox"
                        checked={e.isCrit}
                        onChange={(ev) => updateEffect(idx, { isCrit: ev.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Дистанция атаки</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("attack_category", true)}
                      value={e.attackDistanceKind}
                      onChange={(v) => updateEffect(idx, { attackDistanceKind: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Тип цели</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("type_target", true)}
                      value={e.targetType}
                      onChange={(v) => updateEffect(idx, { targetType: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Вид цели</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("attack_focus", true)}
                      value={e.targetKind}
                      onChange={(v) => updateEffect(idx, { targetKind: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Дистанция</CellLabel>
                    <NumberField value={e.distance} onChange={(v) => updateEffect(idx, { distance: v === "" ? 0 : v })} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Тип атаки</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("attack_type", true)}
                      value={e.attackType}
                      onChange={(v) => updateEffect(idx, { attackType: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Направление атаки</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("direction_attack", false)}
                      value={e.attackDirection}
                      onChange={(v) => updateEffect(idx, { attackDirection: v })}
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col gap-2">
                    <CellLabel>Тип воздействия</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("impact", true)}
                      value={e.impactType}
                      onChange={(v) => updateEffect(idx, { impactType: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Длительность воздействия</CellLabel>
                    <NumberField
                      value={e.impactDuration}
                      onChange={(v) => updateEffect(idx, { impactDuration: v === "" ? 0 : v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Значение воздействия</CellLabel>
                    <TextField value={e.impactValue} onChange={(v) => updateEffect(idx, { impactValue: v })} placeholder="поле ввода" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Сопротивление/эффективность</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("potency_resist", false)}
                      value={e.resistanceEffectiveness}
                      onChange={(v) => updateEffect(idx, { resistanceEffectiveness: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Эффект</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("effect", false)}
                      value={e.effect}
                      onChange={(v) => updateEffect(idx, { effect: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Длительность эффекта</CellLabel>
                    <NumberField
                      value={e.effectDuration}
                      onChange={(v) => updateEffect(idx, { effectDuration: v === "" ? 0 : v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Значение эффекта</CellLabel>
                    <TextField value={e.effectValue} onChange={(v) => updateEffect(idx, { effectValue: v })} placeholder="поле ввода" />
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col gap-2">
                    <CellLabel>Зависимый талант</CellLabel>
                    <SelectField
                      options={talentOptions}
                      value={e.dependentTalent}
                      onChange={(v) => updateEffect(idx, { dependentTalent: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Тип передвижения</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("move_type", false)}
                      value={e.movementType}
                      onChange={(v) => updateEffect(idx, { movementType: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Значение передвижения</CellLabel>
                    <NumberField
                      value={e.movementValue}
                      allowEmpty
                      onChange={(v) => updateEffect(idx, { movementValue: v })}
                      placeholder="число"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Поддерживаемость</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("concentration", false)}
                      value={e.maintainability}
                      onChange={(v) => updateEffect(idx, { maintainability: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Тип ресурса</CellLabel>
                    <SelectField
                      options={getCatalogGroupOptions("resource_type", false)}
                      value={e.resourceType}
                      onChange={(v) => {
                        const nextType = v;
                        const nextCostOpts = nextType ? getResourceCostOptions(nextType, true) : [EMPTY_OPTION];
                        updateEffect(idx, { resourceType: nextType, resourceCost: nextCostOpts[0]?.value ?? "" });
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Затраты ресурса</CellLabel>
                    <SelectField
                      options={e.resourceType ? getResourceCostOptions(e.resourceType, true) : [EMPTY_OPTION]}
                      value={e.resourceCost}
                      onChange={(v) => updateEffect(idx, { resourceCost: v })}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <CellLabel>Замена воздействия или эффекта</CellLabel>
                    <SelectField
                      options={replacementOptions}
                      value={e.replacementEffectId}
                      onChange={(v) => updateEffect(idx, { replacementEffectId: v })}
                    />
                  </div>
                </div>

                {/* Conditions */}
                <div className="border-t border-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/80">Условия</div>
                    <button
                      type="button"
                      aria-label="add condition"
                      onClick={() => addConditionRow(idx)}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition hover:bg-white/[0.06]"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(Array.isArray(e.conditions) && e.conditions.length ? e.conditions : [{ id: "__fallback", conditionId: noConditionsId, description: "" }]).map(
                      (c, ci) => {
                        const canRemove = (e.conditions?.length ?? 0) > 1;
                        const isSpecial = c.conditionId === specialConditionsId;
                        const specialMissing = isSpecial && !String(c.description ?? "").trim();

                        return (
                          <div key={c.id} className="grid grid-cols-[1fr_44px] gap-3">
                            <div className="space-y-2">
                              <SelectField
                                options={conditionOptionsRequired.length ? conditionOptionsRequired : [EMPTY_OPTION]}
                                value={c.conditionId || noConditionsId}
                                onChange={(v) => updateConditionRow(idx, ci, { conditionId: v })}
                              />

                              {isSpecial ? (
                                <textarea
                                  value={c.description ?? ""}
                                  onChange={(ev) => updateConditionRow(idx, ci, { description: ev.target.value })}
                                  placeholder="Опишите специальное условие"
                                  rows={2}
                                  className={`min-h-[64px] w-full resize-y rounded-xl border bg-white/[0.04] px-3 py-2 text-sm text-white/80 outline-none transition placeholder:text-white/30 focus:border-white/20 ${
                                    specialMissing ? "border-red-500/50" : "border-white/10"
                                  }`}
                                />
                              ) : null}

                              {specialMissing ? (
                                <div className="text-xs text-red-300/90">Описание обязательно для «Специальные условия».</div>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              aria-label="remove condition"
                              onClick={() => removeConditionRow(idx, ci)}
                              disabled={!canRemove}
                              className={`h-11 w-11 self-start rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/75 transition ${
                                canRemove ? "hover:bg-white/[0.06]" : "opacity-40"
                              }`}
                            >
                              ×
                            </button>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Submit block (full width) */}
      <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="h-12 w-full rounded-2xl border border-[#e7c47a]/40 bg-[#e7c47a]/15 text-sm font-semibold tracking-wide text-[#f6e6b6] shadow-[0_0_0_1px_rgba(231,196,122,0.12),0_10px_30px_-12px_rgba(231,196,122,0.55)] transition hover:bg-[#e7c47a]/20 hover:shadow-[0_0_0_1px_rgba(231,196,122,0.18),0_14px_40px_-14px_rgba(231,196,122,0.6)]"
        >
          Отправить
        </button>
      </div>

      {/* Submit block (full width) */}
      <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="h-12 w-full rounded-2xl border border-[#e7c47a]/40 bg-[#e7c47a]/15 text-sm font-semibold tracking-wide text-[#f6e6b6] shadow-[0_0_0_1px_rgba(231,196,122,0.12),0_10px_30px_-12px_rgba(231,196,122,0.55)] transition hover:bg-[#e7c47a]/20 hover:shadow-[0_0_0_1px_rgba(231,196,122,0.18),0_14px_40px_-14px_rgba(231,196,122,0.6)]"
        >
          Отправить
        </button>
      </div>

      {/* Confirmation modal */}
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-[#0b1020]/90 shadow-2xl">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="text-sm font-semibold text-white/90">Уверены в заполнении?</div>
              <div className="mt-1 text-xs text-white/55">Выберите действие.</div>
            </div>
            <div className="space-y-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="h-11 w-full rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/25 hover:border-emerald-400/50"
              >
                Да, отправить
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  resetToDefaults();
                }}
                className="h-11 w-full rounded-xl border border-[#e7c47a]/35 bg-[#e7c47a]/15 text-sm font-semibold text-[#f6e6b6] transition hover:bg-[#e7c47a]/20"
              >
                Да, отправить и обнулить
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="h-11 w-full rounded-xl border border-rose-500/30 bg-rose-500/15 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 hover:border-rose-500/50"
              >
                Нет, перепроверить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SpellBuilderForm;
