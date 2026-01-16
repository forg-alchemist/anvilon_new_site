"use client";

import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { SubHeader, TextBlock } from "./_shared";

export type MoonSquadPersonItem = {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  character?: string | null;
  artUrl?: string | null;
  bucket?: string | null;
  artPath?: string | null;
};

export type MoonSquadLike = {
  id?: string | null;
  slug_squad?: string | null;
  name?: string | null;
  description?: string | null;
  artUrl?: string | null;
  bucket?: string | null;
  artPath?: string | null;
  persons?: MoonSquadPersonItem[] | null;
};

type Props = {
  title?: string;
  squads: MoonSquadLike[];
  /** Kept for API compatibility; layout is fixed to 2 columns. */
  gridCols?: number;
  /** Optional controlled selection (preferred). */
  activeId?: string | null;
  /** Optional controlled selection (legacy typo support). */
  activeIdd?: string | null;
  /** Optional controlled setter. */
  setActiveId?: Dispatch<SetStateAction<string | null>>;
};

function normalizePath(v?: string | null) {
  const s = (v ?? "").toString().trim();
  if (!s) return "";
  return s.replace(/^\/+/, "");
}

function resolveImgSrc(item: {
  artUrl?: string | null;
  bucket?: string | null;
  artPath?: string | null;
}) {
  if (item.artUrl) return item.artUrl;

  const bucket = (item.bucket ?? "").toString().trim();
  const artPath = normalizePath(item.artPath);
  if (!bucket || !artPath) return "";

  return getPublicStorageUrl(bucket, artPath);
}

function SilverLine({ selected, allowHover }: { selected: boolean; allowHover: boolean }) {
  return (
    <div
      className={[
        "mx-auto mt-2 h-[2px] w-[70%] max-w-[260px] rounded-full transition-opacity duration-150",
        selected
          ? "opacity-100"
          : allowHover
          ? "opacity-0 group-hover:opacity-100"
          : "opacity-0",
      ].join(" ")}
      style={{
        background:
          "linear-gradient(90deg, rgba(220,230,255,0), rgba(220,230,255,0.85), rgba(220,230,255,0))",
        boxShadow: "0 0 18px rgba(220,230,255,0.18)",
      }}
    />
  );
}

export default function LegendarySquadsSection(props: Props) {
  const {
    title = "Легендарные отряды",
    squads,
    activeId: activeIdProp,
    activeIdd,
    setActiveId: setActiveIdProp,
  } = props;

  const isControlled = typeof setActiveIdProp === "function";

  const [uncontrolledActiveId, setUncontrolledActiveId] = React.useState<string | null
  >(() => (activeIdProp ?? activeIdd ?? null) as string | null);

  const activeId = (isControlled ? (activeIdProp ?? activeIdd ?? null) : uncontrolledActiveId) as
    | string
    | null;
  const setActiveId = (isControlled ? setActiveIdProp : setUncontrolledActiveId) as Dispatch<
    SetStateAction<string | null>
  >;

  const safeSquads = Array.isArray(squads) ? squads : [];
  const hasActive = activeId !== null;

  const activeSquad = React.useMemo(() => {
    if (!activeId) return null;
    return safeSquads.find((s) => {
      const id = (s.id ?? s.slug_squad ?? s.name ?? "").toString();
      return id === activeId;
    }) ?? null;
  }, [activeId, safeSquads]);

  const persons = React.useMemo<MoonSquadPersonItem[]>(() => {
    const p = activeSquad?.persons;
    return Array.isArray(p) ? p : [];
  }, [activeSquad]);

  const [activePersonId, setActivePersonId] = React.useState<string | null>(null);

  type SquadPanelTabKey = "description" | "members";
  const [panelTab, setPanelTab] = React.useState<SquadPanelTabKey>("description");

  // Reset selected person when squad changes
  React.useEffect(() => {
    if (!activeSquad) {
      setPanelTab("description");
      setActivePersonId(null);
      return;
    }
    // Always start from the squad description when switching squads.
    setPanelTab("description");
    const first = persons[0];
    if (!first) {
      setActivePersonId(null);
      return;
    }
    const pid = (first.id ?? first.name ?? "").toString();
    setActivePersonId(pid || null);
  }, [activeSquad, persons]);

  const activePerson = React.useMemo(() => {
    if (!activePersonId) return null;
    return (
      persons.find((p) => (p.id ?? p.name ?? "").toString() === activePersonId) ?? null
    );
  }, [activePersonId, persons]);

  // --- Members carousel: infinite (cyclic) order with the active member always pinned to the left.
  const activePersonIndex = React.useMemo(() => {
    if (!activePersonId) return 0;
    const idx = persons.findIndex((p) => (p.id ?? p.name ?? "").toString() === activePersonId);
    return Math.max(0, idx);
  }, [activePersonId, persons]);

  const setActivePersonByIndex = React.useCallback(
    (idx: number) => {
      if (!persons.length) return;
      const n = persons.length;
      const wrapped = ((idx % n) + n) % n;
      const p = persons[wrapped];
      const pid = (p.id ?? p.name ?? "").toString();
      setActivePersonId(pid || null);
    },
    [persons]
  );

  const orderedPersons = React.useMemo(() => {
    if (!persons.length) return [];
    const start = activePersonIndex;
    return [...persons.slice(start), ...persons.slice(0, start)];
  }, [persons, activePersonIndex]);

  // Non-active members follow after the active one (active is always the left-most card).
  const restPersons = React.useMemo(() => {
    if (!orderedPersons.length) return [];
    return orderedPersons.slice(1);
  }, [orderedPersons]);

  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.78)";
  const goldSoft = "rgba(244, 214, 123, 0.16)";

  const PANEL_TABS: Array<{ key: SquadPanelTabKey; label: string; hidden?: boolean }> = [
    { key: "description", label: "ОПИСАНИЕ" },
    { key: "members", label: "ЧЛЕНЫ ОТРЯДА", hidden: persons.length === 0 },
  ];

  return (
    <section className="mt-12">
      <div
        className="mb-5"
        style={{
          fontFamily: "var(--font-buttons)",
          fontSize: 18,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(235, 245, 255, 0.92)",
        }}
      >
        {title}
      </div>

      {safeSquads.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-white/80">
          Пока пусто.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {safeSquads.map((s) => {
              const id = (s.id ?? s.slug_squad ?? s.name ?? "").toString();
              const selected = activeId === id;
              const dimOthers = hasActive && !selected;
              const allowHoverFx = !hasActive || selected;
              const src = resolveImgSrc(s);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveId((prev) => (prev === id ? null : id))}
                  className={`w-full text-center transition-all duration-200 ${
                    allowHoverFx ? "group" : ""
                  }`}
                  style={
                    dimOthers
                      ? {
                          opacity: 0.34,
                          filter: "grayscale(0.65) saturate(0.7) brightness(0.62)",
                          transition: "opacity 200ms ease, filter 200ms ease",
                        }
                      : { transition: "opacity 200ms ease, filter 200ms ease" }
                  }
                  aria-pressed={selected}
                >
                  <div
                    className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3"
                    style={{
                      boxShadow: selected
                        ? "0 28px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(230,240,255,0.18)"
                        : "0 22px 70px rgba(0,0,0,0.45)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div
                      className="relative w-full overflow-hidden rounded-2xl border border-white/12 bg-black/30"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={(s.name ?? "").toString()}
                          className={[
                            "h-full w-full object-cover transition-[filter] duration-200",
                            dimOthers
                              ? "brightness-[0.45] saturate-[0.65]"
                              : "brightness-100 saturate-100",
                          ].join(" ")}
                          draggable={false}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}

                      {/* Darken non-selected tiles when one is active (matches other sections) */}
                      {dimOthers ? (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "rgba(0,0,0,0.35)" }}
                        />
                      ) : null}

                      <div
                        className={
                          allowHoverFx
                            ? "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            : "pointer-events-none absolute inset-0 opacity-0"
                        }
                        style={{
                          background:
                            "radial-gradient(circle at 50% 40%, rgba(210,225,255,0.18), rgba(0,0,0,0) 55%)",
                        }}
                      />
                    </div>

                    <div
                      className="mt-3 text-center"
                      style={{
                        fontFamily: "var(--font-buttons)",
                        fontSize: 16,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(235, 245, 255, 0.92)",
                      }}
                    >
                      {(s.name ?? "").toString()}
                    </div>

                    {/* When something is selected: underline is only on the selected tile.
                        When nothing is selected: underline appears on hover. */}
                    <SilverLine selected={selected} allowHover={!hasActive && allowHoverFx} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expand panel */}
          {activeSquad ? (
            <div
              className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5"
              style={{
                boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-center"
                style={{
                  fontFamily: "var(--font-title)",
                  fontSize: 26,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(235,245,255,0.92)",
                  textShadow: "0 2px 22px rgba(0,0,0,0.55)",
                }}
              >
                {(activeSquad.name ?? "").toString()}
              </div>

              <div
                className="mx-auto mt-4 h-px w-[92%]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(220,230,255,0), rgba(220,230,255,0.22), rgba(220,230,255,0))",
                }}
              />

              {/* Inner tabs (like the race "about" buttons) */}
              <div className="mt-5 flex flex-wrap justify-start gap-3">
                {PANEL_TABS.filter((t) => !t.hidden).map((t) => {
                  const active = panelTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setPanelTab(t.key)}
                      className="rounded-full border px-2.5 py-1.5 transition"
                      style={{
                        borderColor: active
                          ? "rgba(244, 214, 123, 0.38)"
                          : "rgba(255,255,255,0.10)",
                        background: active
                          ? `
                            radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                            linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))
                          `
                          : "rgba(0,0,0,0.25)",
                        boxShadow: active
                          ? `0 12px 28px rgba(0,0,0,0.55), 0 0 22px ${goldSoft}`
                          : "0 10px 24px rgba(0,0,0,0.40)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-buttons)",
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 16px rgba(0,0,0,0.85)`
                            : "0 2px 14px rgba(0,0,0,0.8)",
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TAB: ОПИСАНИЕ (без заголовка) */}
              {panelTab === "description" ? (
                <div className="mt-4">
                  {activeSquad.description ? (
                    <TextBlock text={(activeSquad.description ?? "").toString()} />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-white/70">
                      Описание пока не добавлено.
                    </div>
                  )}
                </div>
              ) : null}

              {/* TAB: ЧЛЕНЫ ОТРЯДА (без заголовка секции) */}
              {panelTab === "members" && persons.length ? (
                <div className="mt-6">

                  {/* Active pinned on the left; the rest is dimmed and scrollable.
                      Cycling is infinite via arrows (index wraps), without duplicating cards. */}
                  <div className="flex items-stretch gap-4">
                    {/* Active card (always left) */}
                    {orderedPersons[0] ? (
                      <button
                        type="button"
                        onClick={() => {
                          const pid = (orderedPersons[0].id ?? orderedPersons[0].name ?? "").toString();
                          setActivePersonId(pid || null);
                        }}
                        className="shrink-0"
                        aria-pressed={true}
                      >
                        <div
                          className="relative overflow-hidden rounded-2xl border bg-black/25"
                          style={{
                            width: 150,
                            aspectRatio: "9 / 16",
                            borderColor: "rgba(230,240,255,0.22)",
                            boxShadow:
                              "0 18px 55px rgba(0,0,0,0.55), 0 0 0 1px rgba(230,240,255,0.18)",
                          }}
                        >
                          {resolveImgSrc(orderedPersons[0]) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImgSrc(orderedPersons[0])}
                              alt={(orderedPersons[0].name ?? "").toString()}
                              className="h-full w-full object-cover"
                              draggable={false}
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full" />
                          )}
                        </div>
                      </button>
                    ) : null}

                    {/* Scroll strip */}
                    <div
                      className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/15"
                      style={{
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 18px 55px rgba(0,0,0,0.28)",
                        // soft fade on edges
                        maskImage:
                          "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                          "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
                      }}
                    >
                      {/* Arrows (infinite wrap) */}
                      {persons.length > 1 ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                          <button
                            type="button"
                            onClick={() => setActivePersonByIndex(activePersonIndex - 1)}
                            className="pointer-events-auto rounded-full border px-3 py-2 transition"
                            style={{
                              borderColor: "rgba(255,255,255,0.14)",
                              background: "rgba(0,0,0,0.35)",
                              boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
                              backdropFilter: "blur(8px)",
                            }}
                            aria-label="Предыдущий участник"
                          >
                            <span style={{ color: inkSoft, fontFamily: "var(--font-buttons)", letterSpacing: "0.12em" }}>
                              ‹
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActivePersonByIndex(activePersonIndex + 1)}
                            className="pointer-events-auto rounded-full border px-3 py-2 transition"
                            style={{
                              borderColor: "rgba(255,255,255,0.14)",
                              background: "rgba(0,0,0,0.35)",
                              boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
                              backdropFilter: "blur(8px)",
                            }}
                            aria-label="Следующий участник"
                          >
                            <span style={{ color: inkSoft, fontFamily: "var(--font-buttons)", letterSpacing: "0.12em" }}>
                              ›
                            </span>
                          </button>
                        </div>
                      ) : null}

                      {/* Hide native scrollbar; navigation is handled via the arrow buttons */}
                      <div className="overflow-x-hidden px-4 py-3">
                        <div className="flex gap-4">
                          {restPersons.map((p) => {
                            const pid = (p.id ?? p.name ?? "").toString();
                            const psrc = resolveImgSrc(p);
                            return (
                              <button
                                key={pid}
                                type="button"
                                onClick={() => setActivePersonId(pid)}
                                className="shrink-0"
                                aria-pressed={false}
                                style={{
                                  opacity: 0.42,
                                  filter: "grayscale(0.55) saturate(0.75) brightness(0.70)",
                                  transition: "opacity 180ms ease, filter 180ms ease",
                                }}
                              >
                                <div
                                  className="relative overflow-hidden rounded-2xl border bg-black/25"
                                  style={{
                                    width: 150,
                                    aspectRatio: "9 / 16",
                                    borderColor: "rgba(255,255,255,0.10)",
                                    boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
                                  }}
                                >
                                  {psrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={psrc}
                                      alt={(p.name ?? "").toString()}
                                      className="h-full w-full object-cover"
                                      draggable={false}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-full w-full" />
                                  )}

                                  <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{ background: "rgba(0,0,0,0.20)" }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {panelTab === "members" && activePerson ? (
                <div
                  className="my-6 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(220,230,255,0), rgba(220,230,255,0.25), rgba(220,230,255,0))",
                  }}
                />
              ) : null}

              {/* Person details (NO repeated portrait here) */}
              {panelTab === "members" && activePerson ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-6">
                  <div
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-buttons)",
                      fontSize: 14,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(235,245,255,0.92)",
                    }}
                  >
                    {(activePerson.name ?? "").toString()}
                  </div>

                  <div className="mt-5">
                    <SubHeader title="Описание" />
                    {activePerson.description ? (
                      <TextBlock text={(activePerson.description ?? "").toString()} />
                    ) : null}
                  </div>

                  {activePerson.character ? (
                    <div className="mt-6">
                      <SubHeader title="Характер" />
                      <TextBlock text={(activePerson.character ?? "").toString()} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
