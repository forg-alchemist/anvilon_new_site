export type MagicTheme = {
  /** main accent color (used for title, button text/border) */
  main: string;
  /** glow color in rgba (used for shadows) */
  glow: string;
  /** softer glow for subtle highlights */
  glowSoft: string;
};

const DEFAULT_THEME: MagicTheme = {
  main: "#E6D6A8",
  glow: "rgba(230,214,168,0.45)",
  glowSoft: "rgba(230,214,168,0.22)",
};

const THEMES: Record<string, MagicTheme> = {
  // 1) Light — gold
  "1c23be73-5385-4f12-934e-3dfaa064a3fa": {
    main: "#E6C36A",
    glow: "rgba(230,195,106,0.55)",
    glowSoft: "rgba(230,195,106,0.24)",
  },

  // 2) Life — emerald
  "91fe04bc-d87e-4ff3-b1fe-b3a06b2abce8": {
    main: "#3FBF7F",
    glow: "rgba(63,191,127,0.55)",
    glowSoft: "rgba(63,191,127,0.22)",
  },

  // 3) Fire — red
  "4265439e-e06d-4601-92f7-63d9b5968a4a": {
    main: "#C83A2B",
    glow: "rgba(200,58,43,0.60)",
    glowSoft: "rgba(200,58,43,0.24)",
  },

  // 4) Water — blue
  "5e1c17b2-ec57-4de1-b0d5-269ebdad1848": {
    main: "#3A6FC8",
    glow: "rgba(58,111,200,0.60)",
    glowSoft: "rgba(58,111,200,0.24)",
  },

  // 5) Air — light blue
  "d7a1075a-16f5-4a7b-89ad-f08d3f199d3c": {
    main: "#7EC8E3",
    glow: "rgba(126,200,227,0.60)",
    glowSoft: "rgba(126,200,227,0.24)",
  },

  // 6) Earth — brown
  "4ca72c61-4835-4fdd-8e2c-ff8e0cec19f4": {
    main: "#8A6A3A",
    glow: "rgba(138,106,58,0.60)",
    glowSoft: "rgba(138,106,58,0.24)",
  },

  // 7) Death — azure
  "48ebac97-2ece-45e7-9a71-d98b8cd86f0e": {
    main: "#4FC3C7",
    glow: "rgba(79,195,199,0.60)",
    glowSoft: "rgba(79,195,199,0.24)",
  },

  // 8) Dark — purple
  "a152f4dc-f47e-4eaa-97a6-522eee7d466b": {
    main: "#8A4FFF",
    glow: "rgba(138,79,255,0.64)",
    glowSoft: "rgba(138,79,255,0.26)",
  },

  // 9) Chaos — orange
  "9fdeee70-acb1-4220-ab8f-dd7a39ccc6b1": {
    main: "#FF8A2A",
    glow: "rgba(255,138,42,0.62)",
    glowSoft: "rgba(255,138,42,0.26)",
  },

  // 10) Whispers of Ethil — fuchsia
  "68cb2951-f827-4f80-a8b8-d747ab23fcf2": {
    main: "#E13CF3",
    glow: "rgba(225,60,243,0.68)",
    glowSoft: "rgba(225,60,243,0.28)",
  },

  // 11) Blood — crimson
  "8511844e-2f24-465e-9c77-b6bd59c70330": {
    main: "#7A0E1A",
    glow: "rgba(122,14,26,0.72)",
    glowSoft: "rgba(122,14,26,0.30)",
  },

  // 12) Ghost/Order — cold silver-astral (chosen)
  "344cfb66-c96c-4744-a47d-9e02f3c880d8": {
    main: "#B8C6D9",
    glow: "rgba(184,198,217,0.62)",
    glowSoft: "rgba(184,198,217,0.26)",
  },
};

export function getMagicTheme(id?: string | null): MagicTheme {
  if (!id) return DEFAULT_THEME;
  return THEMES[id] ?? DEFAULT_THEME;
}
