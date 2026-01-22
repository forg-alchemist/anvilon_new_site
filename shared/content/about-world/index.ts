import IntroContent from "./intro.mdx";
import MagicContent from "./magic.mdx";
import TechnologyContent from "./technology.mdx";
import GodsContent from "./gods.mdx";
import AncientsContent from "./ancients.mdx";
import ContinentsContent from "./continents.mdx";

export const aboutWorldSections = [
  { key: "intro", label: "Об Анвилоне", Content: IntroContent },
  { key: "magic", label: "Магия", Content: MagicContent },
  { key: "technology", label: "Технологии", Content: TechnologyContent },
  { key: "gods", label: "Божества", Content: GodsContent },
  { key: "ancients", label: "Древние", Content: AncientsContent },
  { key: "continents", label: "Материки", Content: ContinentsContent },
] as const;

export type AboutWorldSectionKey = (typeof aboutWorldSections)[number]["key"];
