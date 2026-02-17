"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  isEn: boolean;
  accountFrameUrl: string;
  foregroundUrl: string;
  inactiveButtonUrl: string;
  activeButtonUrl: string;
  anvilIconUrl: string;
  anvilIconFallbackUrl: string;
};

type CampaignCard = {
  title: string;
  role: string;
  players: number;
  status: string;
};

type CharacterCard = {
  name: string;
  level: number;
  archetype: string;
  campaign: string;
  avatarUrl: string;
};

function HoverAnvilIcon({
  src,
  fallbackSrc,
  className,
}: {
  src: string;
  fallbackSrc: string;
  className: string;
}) {
  const [iconSrc, setIconSrc] = useState(src);

  useEffect(() => {
    setIconSrc(src);
  }, [src]);

  if (!iconSrc) return null;

  return (
    <img
      src={iconSrc}
      alt=""
      onError={() => {
        if (iconSrc === src && fallbackSrc && fallbackSrc !== src) {
          setIconSrc(fallbackSrc);
          return;
        }
        setIconSrc("");
      }}
      className={className}
    />
  );
}

function TextureButton({
  label,
  inactiveButtonUrl,
  activeButtonUrl,
  anvilIconUrl,
  anvilIconFallbackUrl,
  showAnvil = true,
  className = "",
  textClassName = "",
}: {
  label: string;
  inactiveButtonUrl: string;
  activeButtonUrl: string;
  anvilIconUrl: string;
  anvilIconFallbackUrl: string;
  showAnvil?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <button
      type="button"
      className={`group relative inline-flex h-[2.5em] items-center overflow-hidden rounded-[0.75em] border border-white/40 px-[1.25em] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_18px_rgba(9,36,68,0.45)] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
        style={{ backgroundImage: inactiveButtonUrl ? `url(${inactiveButtonUrl})` : undefined }}
      />
      <span
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ backgroundImage: activeButtonUrl ? `url(${activeButtonUrl})` : undefined }}
      />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.03)_30%,rgba(0,0,0,0.34))]" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_115%_at_18%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.05)_36%,rgba(6,14,30,0.58)_84%),linear-gradient(180deg,rgba(9,20,40,0.14),rgba(9,20,40,0.54))]" />
      <span className="pointer-events-none absolute inset-x-[1.25em] top-0 h-px bg-white/70" />

      {showAnvil ? (
        <HoverAnvilIcon
          src={anvilIconUrl}
          fallbackSrc={anvilIconFallbackUrl}
          className="pointer-events-none absolute right-[0.75em] top-1/2 h-[1.5em] w-[1.5em] -translate-y-1/2 object-contain opacity-0 drop-shadow-[0_0_10px_rgba(255,210,126,0.85)] transition-opacity duration-200 group-hover:opacity-90 group-focus-visible:opacity-90"
        />
      ) : null}

      <span
        className={`relative z-10 ${showAnvil ? "pr-[2em]" : ""} text-left text-[0.75em] uppercase tracking-[0.11em] text-[#edf8ff] [text-shadow:0_1px_10px_rgba(0,0,0,0.95)] ${textClassName}`}
      >
        {label}
      </span>
    </button>
  );
}

function OpenGlassButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`group relative inline-flex h-[2.5em] items-center overflow-hidden rounded-[0.75em] border border-[#98d8ff]/78 bg-[#091a34]/58 px-[1.5em] text-[0.75em] uppercase tracking-[0.11em] text-[#eaf5ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_0_14px_rgba(125,200,255,0.24),inset_0_-8px_18px_rgba(5,15,34,0.45)] backdrop-blur-[12px] transition-[border-color,box-shadow,color,background,opacity] duration-200 hover:border-[#ffd892]/98 hover:text-[#fff9ef] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_0_16px_rgba(255,206,122,0.56),inset_0_-10px_22px_rgba(86,44,8,0.52)] focus-visible:border-[#ffd892]/98 focus-visible:text-[#fff9ef] focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_0_16px_rgba(255,206,122,0.56),inset_0_-10px_22px_rgba(86,44,8,0.52)] group-hover:border-[#ffd892]/98 group-hover:text-[#fff9ef] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_0_16px_rgba(255,206,122,0.56),inset_0_-10px_22px_rgba(86,44,8,0.52)] group-focus-within:border-[#ffd892]/98 group-focus-within:text-[#fff9ef] group-focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_0_16px_rgba(255,206,122,0.56),inset_0_-10px_22px_rgba(86,44,8,0.52)] ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_18%_0%,rgba(255,255,255,0.18),rgba(255,255,255,0.05)_36%,rgba(7,17,36,0.64)_86%),linear-gradient(180deg,rgba(9,22,44,0.18),rgba(9,22,44,0.58))]" />
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-visible:opacity-100 hover:opacity-100 focus-visible:opacity-100 bg-[radial-gradient(136%_115%_at_18%_0%,rgba(255,232,184,0.32),rgba(255,232,184,0.10)_38%,rgba(23,11,0,0.44)_86%),linear-gradient(180deg,rgba(255,188,86,0.12),rgba(255,153,52,0.22))]" />
      <span className="pointer-events-none absolute inset-x-[1em] top-0 h-px bg-white/65" />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

export default function AccountCabinetClient({
  isEn,
  accountFrameUrl,
  foregroundUrl,
  inactiveButtonUrl,
  activeButtonUrl,
  anvilIconUrl,
  anvilIconFallbackUrl,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState(isEn ? "Player" : "Игрок");
  const labels = useMemo(
    () => ({
      back: isEn ? "Back" : "Назад",
      privateQuarters: isEn ? "Private Quarters" : "Личные покои",
      campaigns: isEn ? "Campaigns" : "Кампании",
      characters: isEn ? "Characters" : "Персонажи",
      role: isEn ? "Role" : "Роль",
      players: isEn ? "Players" : "Игроков",
      status: isEn ? "Status" : "Статус",
      open: isEn ? "Open" : "Открыть",
      openSheet: isEn ? "Open Sheet" : "Открыть лист",
      level: isEn ? "Level" : "Уровень",
      createCampaign: isEn ? "+ Create Campaign" : "+ Создать кампанию",
      joinByLink: isEn ? "+ Join by Link" : "+ Присоединиться по ссылке",
      createCharacter: isEn ? "+ Create Character" : "+ Создать персонажа",
      loading: isEn ? "Loading..." : "Загрузка...",
    }),
    [isEn]
  );

  const campaignCards = useMemo<CampaignCard[]>(
    () =>
      isEn
        ? [
            { title: "World Seal", role: "Game Master", players: 4, status: "Active" },
            { title: "Bone Trail", role: "Player", players: 3, status: "Finished" },
          ]
        : [
            { title: "Печать миров", role: "Мастер", players: 4, status: "Активна" },
            { title: "Тропа костей", role: "Игрок", players: 3, status: "Завершена" },
          ],
    [isEn]
  );

  const characterCards = useMemo<CharacterCard[]>(
    () =>
      isEn
        ? [
            {
              name: "Talon",
              level: 30,
              archetype: "Destructive Mage",
              campaign: "World Seal",
              avatarUrl: "https://i.pinimg.com/474x/76/8b/4a/768b4a3af15c28347e81b4917739ad28.jpg",
            },
            {
              name: "Paki",
              level: 29,
              archetype: "Shadow Hunter",
              campaign: "Bone Trail",
              avatarUrl: "https://i.pinimg.com/474x/0a/7c/c6/0a7cc6126dc48f6abbffa72275ab178a.jpg",
            },
          ]
        : [
            {
              name: "Талон",
              level: 30,
              archetype: "Разрушительный маг",
              campaign: "Печать миров",
              avatarUrl: "https://i.pinimg.com/474x/76/8b/4a/768b4a3af15c28347e81b4917739ad28.jpg",
            },
            {
              name: "Паки",
              level: 29,
              archetype: "Охотник на теней",
              campaign: "Тропа костей",
              avatarUrl: "https://i.pinimg.com/474x/0a/7c/c6/0a7cc6126dc48f6abbffa72275ab178a.jpg",
            },
          ],
    [isEn]
  );

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/enter");
        return;
      }

      const { data: loginRow } = await supabase
        .schema("account")
        .from("user_login")
        .select("username")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const username =
        (loginRow?.username ?? "").trim() ||
        (data.user.user_metadata?.username as string | undefined)?.trim() ||
        data.user.email?.split("@")[0] ||
        (isEn ? "Player" : "Игрок");

      if (!active) return;
      setDisplayName(username);
      setIsLoading(false);
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, [isEn, router]);

  if (isLoading) {
    return (
      <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-8">
        <div className="rounded-2xl border border-[#e3c37c]/40 bg-black/35 px-6 py-4 text-lg text-[#f0dfb7]">
          {labels.loading}
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex h-screen w-full flex-col overflow-hidden">
      <header className="relative z-40 shrink-0 px-3 pb-2 pt-3 md:px-8">
        <div className="flex w-full items-center justify-between">
          <Link
            href="/enter"
            className="inline-flex h-10 items-center rounded-xl border border-[#e3c37c]/45 bg-black/30 px-4 text-xs uppercase tracking-[0.15em] text-[#f4ddb1] transition hover:border-[#e3c37c]/75 hover:bg-[#e3c37c]/10"
          >
            {labels.back}
          </Link>
          <div className="h-10 w-[132px]" aria-hidden />
        </div>
      </header>

      <section
        data-slot="ContentRoot"
        className="relative z-20 min-h-0 flex-1 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            data-slot="SceneContainer"
            className="relative h-full w-full origin-top [container-type:size]"
          >
            <div
              data-slot="FrameContainer"
              className="absolute left-[5%] right-[5%] top-0 bottom-[8%] z-20 [--frame-content-x:6.2%] [--frame-content-top:6.8%] [--frame-content-bottom:4.5%] [--ui:min(1.1cqh,0.8cqw)]"
            >
              {accountFrameUrl ? (
                <img
                  src={accountFrameUrl}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill opacity-[0.97]"
                />
              ) : (
                <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-[#dcae63]/55" />
              )}

              <div className="pointer-events-none absolute left-[var(--frame-content-x)] right-[var(--frame-content-x)] top-[var(--frame-content-top)] bottom-[var(--frame-content-bottom)] z-10 rounded-[20px] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0.00)_58%)]" />

              <div
                data-slot="InnerContent"
                className="absolute left-[var(--frame-content-x)] right-[var(--frame-content-x)] top-[var(--frame-content-top)] bottom-[var(--frame-content-bottom)] z-20 overflow-hidden rounded-[20px]"
              >
                <div className="flex h-full min-h-0 flex-col px-[1.5em] pb-[1.5em] pt-[1.25em] [font-size:calc(var(--ui)*1.75)]">
                  <div data-slot="HeaderContainer" className="grid shrink-0 grid-cols-2 gap-[2em]">
                    <div className="flex min-h-[2.75em] items-end justify-start pl-[1.6%] pr-[0.6%] text-left">
                      <h1 className="text-[1.875em] uppercase tracking-[0.11em] text-[#f4ddb1] [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
                        {labels.privateQuarters}
                      </h1>
                    </div>

                    <div className="flex min-h-[2.75em] items-end justify-end pl-[0.6%] pr-[1.6%] text-right">
                      <div className="text-[1.875em] tracking-[0.05em] text-[#e9f6ff] [text-shadow:0_2px_12px_rgba(0,0,0,0.62)]">
                        {displayName}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(244,214,123,0),rgba(244,214,123,0.92),rgba(244,214,123,0))]" />
                  <div className="mt-1 h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(244,214,123,0.46),rgba(255,255,255,0))]" />

                  <div data-slot="MainContainer" className="mt-[1em] grid min-h-0 flex-1 grid-cols-2 gap-[1.5em]">
                    <section
                      data-slot="CampaignsPanel"
                      className="flex min-h-0 flex-col rounded-[1em] border-[1.5px] border-[#eac98a]/32 bg-[linear-gradient(165deg,rgba(255,227,182,0.10),rgba(255,255,255,0.04)_42%,rgba(8,16,34,0.33))] p-[1em] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[10px]"
                    >
                      <h2 className="shrink-0 text-[1.5em] uppercase tracking-[0.08em] text-[#f4ddb1]">{labels.campaigns}</h2>
                      <div className="mt-[0.5em] h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(244,214,123,0.85),rgba(244,214,123,0))]" />

                      <div
                        data-slot="CampaignScroll"
                        className="mt-[0.75em] min-h-0 flex-1 overflow-y-auto pr-[0.25em] [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(125,200,255,0.75)_rgba(8,18,36,0.35)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7dc8ff]/70 [&::-webkit-scrollbar-track]:bg-[#071632]/45"
                      >
                        <div className="space-y-3 pb-1">
                          {campaignCards.map((campaign) => (
                            <article
                              key={campaign.title}
                              data-slot="CampaignCard"
                              className="group relative flex min-h-[9.125em] flex-col overflow-hidden rounded-[1em] border-[1.6px] border-[#98d8ff]/58 p-[2.8%] shadow-[inset_0_1px_0_rgba(188,232,255,0.26),0_0_18px_rgba(125,200,255,0.25),0_0_36px_rgba(44,118,194,0.14),0_14px_26px_rgba(0,0,0,0.34)] transition-[border-color,box-shadow] duration-200 hover:border-[#ffd892]/94 hover:shadow-[inset_0_1px_0_rgba(255,241,202,0.56),0_0_30px_rgba(255,205,118,0.46),0_0_54px_rgba(234,152,42,0.24),0_14px_26px_rgba(0,0,0,0.34)] focus-within:border-[#ffd892]/94 focus-within:shadow-[inset_0_1px_0_rgba(255,241,202,0.56),0_0_30px_rgba(255,205,118,0.46),0_0_54px_rgba(234,152,42,0.24),0_14px_26px_rgba(0,0,0,0.34)]"
                            >
                              <span
                                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
                                style={{ backgroundImage: inactiveButtonUrl ? `url(${inactiveButtonUrl})` : undefined }}
                              />
                              <span
                                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                                style={{ backgroundImage: activeButtonUrl ? `url(${activeButtonUrl})` : undefined }}
                              />
                              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,14,30,0.62),rgba(7,14,30,0.30)_42%,rgba(7,14,30,0.58))]" />
                              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 bg-[radial-gradient(130%_90%_at_50%_24%,rgba(255,217,136,0.22),rgba(255,217,136,0.00)_58%),linear-gradient(180deg,rgba(255,169,68,0.14),rgba(255,169,68,0.00)_52%,rgba(255,151,42,0.16))]" />
                              <HoverAnvilIcon
                                src={anvilIconUrl}
                                fallbackSrc={anvilIconFallbackUrl}
                                className="pointer-events-none absolute right-[3.2%] top-[11%] h-10 w-10 object-contain opacity-0 drop-shadow-[0_0_14px_rgba(255,210,126,0.85)] transition-opacity duration-200 group-hover:opacity-90 group-focus-within:opacity-90"
                              />

                              <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
                                <div className="min-h-0 min-w-0 self-start overflow-hidden">
                                  <h3 className="text-[1.75em] uppercase tracking-[0.042em] text-[#fff2cf]">{campaign.title}</h3>
                                  <p className="text-[1em] text-white/90">
                                    {labels.role}: {campaign.role}
                                  </p>
                                  <p className="text-[1em] text-white/90">
                                    {labels.players}: {campaign.players}
                                  </p>
                                  <p className="text-[1em] text-white/90">
                                    {labels.status}: {campaign.status}
                                  </p>
                                </div>

                                <div className="shrink-0 self-end pb-1">
                                  <OpenGlassButton label={labels.open} className="min-w-[10em] justify-center" />
                                </div>
                              </div>
                            </article>
                          ))}

                          <div className="space-y-2 pt-1">
                            <TextureButton
                              label={labels.createCampaign}
                              inactiveButtonUrl={inactiveButtonUrl}
                              activeButtonUrl={activeButtonUrl}
                              anvilIconUrl={anvilIconUrl}
                              anvilIconFallbackUrl={anvilIconFallbackUrl}
                              showAnvil={false}
                              className="w-full"
                            />
                            <TextureButton
                              label={labels.joinByLink}
                              inactiveButtonUrl={inactiveButtonUrl}
                              activeButtonUrl={activeButtonUrl}
                              anvilIconUrl={anvilIconUrl}
                              anvilIconFallbackUrl={anvilIconFallbackUrl}
                              showAnvil={false}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section
                      data-slot="CharactersPanel"
                      className="flex min-h-0 flex-col rounded-[1em] border-[1.5px] border-[#99d4ff]/34 bg-[linear-gradient(165deg,rgba(161,215,255,0.10),rgba(255,255,255,0.04)_42%,rgba(8,16,34,0.33))] p-[1em] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[10px]"
                    >
                      <h2 className="shrink-0 text-[1.5em] uppercase tracking-[0.08em] text-[#bfe3ff]">{labels.characters}</h2>
                      <div className="mt-[0.5em] h-px w-full shrink-0 bg-[linear-gradient(90deg,rgba(244,214,123,0.85),rgba(244,214,123,0))]" />

                      <div
                        data-slot="CharacterScroll"
                        className="mt-[0.75em] min-h-0 flex-1 overflow-y-auto pr-[0.25em] [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(125,200,255,0.75)_rgba(8,18,36,0.35)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7dc8ff]/70 [&::-webkit-scrollbar-track]:bg-[#071632]/45"
                      >
                        <div className="space-y-3 pb-1">
                          {characterCards.map((character) => (
                            <article
                              key={character.name}
                              data-slot="CharacterCard"
                              className="group relative flex min-h-[9.375em] flex-col overflow-hidden rounded-[1em] border-[1.6px] border-[#98d8ff]/58 p-[2.8%] shadow-[inset_0_1px_0_rgba(188,232,255,0.26),0_0_18px_rgba(125,200,255,0.25),0_0_36px_rgba(44,118,194,0.14),0_14px_26px_rgba(0,0,0,0.34)] transition-[border-color,box-shadow] duration-200 hover:border-[#ffd892]/94 hover:shadow-[inset_0_1px_0_rgba(255,241,202,0.56),0_0_30px_rgba(255,205,118,0.46),0_0_54px_rgba(234,152,42,0.24),0_14px_26px_rgba(0,0,0,0.34)] focus-within:border-[#ffd892]/94 focus-within:shadow-[inset_0_1px_0_rgba(255,241,202,0.56),0_0_30px_rgba(255,205,118,0.46),0_0_54px_rgba(234,152,42,0.24),0_14px_26px_rgba(0,0,0,0.34)]"
                            >
                              <span
                                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
                                style={{ backgroundImage: inactiveButtonUrl ? `url(${inactiveButtonUrl})` : undefined }}
                              />
                              <span
                                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                                style={{ backgroundImage: activeButtonUrl ? `url(${activeButtonUrl})` : undefined }}
                              />
                              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,14,30,0.64),rgba(7,14,30,0.28)_44%,rgba(7,14,30,0.60))]" />
                              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 bg-[radial-gradient(130%_90%_at_50%_24%,rgba(255,217,136,0.22),rgba(255,217,136,0.00)_58%),linear-gradient(180deg,rgba(255,169,68,0.14),rgba(255,169,68,0.00)_52%,rgba(255,151,42,0.16))]" />
                              <HoverAnvilIcon
                                src={anvilIconUrl}
                                fallbackSrc={anvilIconFallbackUrl}
                                className="pointer-events-none absolute right-[3.2%] top-[11%] h-10 w-10 object-contain opacity-0 drop-shadow-[0_0_14px_rgba(255,210,126,0.85)] transition-opacity duration-200 group-hover:opacity-90 group-focus-within:opacity-90"
                              />

                              <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
                                <div className="flex min-h-0 min-w-0 self-start gap-3 overflow-hidden">
                                  <div className="h-[4.75em] w-[4.75em] shrink-0 overflow-hidden rounded-full border-2 border-[#98d6ff]/65 bg-[radial-gradient(circle_at_30%_30%,rgba(185,226,255,0.35),rgba(8,18,36,0.10)_65%)] p-[2px] shadow-[0_0_16px_rgba(125,200,255,0.34)]">
                                    <img
                                      src={character.avatarUrl}
                                      alt=""
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0 overflow-hidden">
                                    <h3 className="text-[1.75em] uppercase tracking-[0.042em] text-[#edf7ff]">{character.name}</h3>
                                    <p className="text-[1em] text-white/92">
                                      {character.level} {labels.level}
                                    </p>
                                    <p className="text-[1em] text-white/92">{character.archetype}</p>
                                    <p className="text-[1em] text-white/78">
                                      {labels.campaigns}: {character.campaign}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 self-end">
                                  <OpenGlassButton label={labels.openSheet} className="min-w-[11.25em] justify-center" />
                                </div>
                              </div>
                            </article>
                          ))}

                          <div className="pt-1">
                            <TextureButton
                              label={labels.createCharacter}
                              inactiveButtonUrl={inactiveButtonUrl}
                              activeButtonUrl={activeButtonUrl}
                              anvilIconUrl={anvilIconUrl}
                              anvilIconFallbackUrl={anvilIconFallbackUrl}
                              showAnvil={false}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div data-slot="ForegroundContainer" className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[33.333%]">
              {foregroundUrl ? (
                <img
                  src={foregroundUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-fill object-bottom"
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



