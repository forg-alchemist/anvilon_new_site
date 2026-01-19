export type { RaceSectionKey } from "@/lib/races/raceSections";

export type RaceDetail = {
  slug: string;
  name: string;
  artUrl: string;
  initiative: number;
  /** URL карты владений (public storage) */
  mapUrl?: string;
  about: {
    /** Теги расы (капсулы над описанием) */
    tags: string[];

    /** Вкладка "Описание расы" (первый текстовый блок) */
    description: string;

    /** Вкладка "Описание расы" (второй текстовый блок под заголовком "Особенности") */
    features: string;

    /** Вкладка "Физиология" (подраздел 1) */
    physiology: string;

    /** Вкладка "Физиология" (подраздел 2: "Происхождение") */
    origin: string;

    /** Теги показываются ТОЛЬКО в подразделе "Происхождение" внутри вкладки "Физиология" */
    originTags: string[];

    /** Вкладка "Физиология" (подраздел 3) */
    sociality: string;

    archetypes: string;
    /** Теги-капсулы для "Архетипы и роль персонажа" */
    archetypeTags: string[];

    /** Текст блока "Характер" для вкладки "Архетипы и роль персонажа" */
    character: string;

    relations: string;
    /** Теги-капсулы для вкладки "Друзья и враги" */
    relationshipsTags: string[];

    /** Вкладка "Имена" — общий текст */
    names: string;
    /** Вкладка "Имена" — фамилии/родовые имена */
    surname: string;
    /** Вкладка "Имена" — особенности построения имен */
    nameFeatures: string;
  };
};

export type RaceSkill = {
  slug: string;
  skillNum: number;
  name: string;
  description: string;
  artPath: string;
};

export type AboutTabKey = "desc" | "phys" | "arch" | "relations" | "names";

export type HouseTabKey = "description" | "members" | "bonus" | "tradition";
export type MoonElfFamilyTabKey = "description" | "bonus" | "story";




// ✅ "Происхождение" как отдельную вкладку УДАЛИЛИ.
// ✅ Теперь оно внутри вкладки "Физиология" как подраздел.

export type HouseTooltipState = { visible: boolean; text: string; x: number; y: number };
