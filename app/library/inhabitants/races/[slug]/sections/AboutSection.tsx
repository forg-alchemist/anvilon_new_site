"use client";

import React from "react";
import type { RaceDetail, AboutTabKey } from "../types";
import { SubHeader, TagsRow, TextBlock } from "./_shared";

export default function AboutSection({
  detail,
  aboutTab,
  setAboutTab,
}: {
  detail: RaceDetail;
  aboutTab: AboutTabKey;
  setAboutTab?: (k: AboutTabKey) => void;
}) {
  if (false /* section guard moved to parent */) {
        return (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
            Этот раздел пока пустой — заполним позже.
          </div>
        );
      }
  
      switch (aboutTab) {
        case "desc":
          // ✅ ДВА РАЗНЫХ текстовых блока: description + features
          return (
            <div className="flex flex-col gap-8">
              {detail.about.tags.length ? <TagsRow tags={detail.about.tags} /> : null}
              <TextBlock text={detail.about.description} />
              <div>
              <SubHeader title="Особенности" />
              <div className="mt-3">
                <TextBlock text={detail.about.features} />
              </div>
            </div>
            </div>
          );
  
        case "phys":
          // ✅ Внутри "Физиология" три подраздела: Физиология, Происхождение, Социальность
          return (
            <div className="flex flex-col gap-8">
              <div>
              <SubHeader title="Физиология" />
              <div className="mt-3">
                <TextBlock text={detail.about.physiology} />
              </div>
            </div>
  
              <SubHeader title="Происхождение" />
              <TagsRow tags={detail.about.originTags} />
              <TextBlock text={detail.about.origin} />
  
              <div>
              <SubHeader title="Социальность" />
              <div className="mt-3">
                <TextBlock text={detail.about.sociality} />
              </div>
            </div>
            </div>
          );
  
        case "arch":
          return (
            <div className="flex flex-col gap-8">
              {detail.about.archetypeTags.length ? <TagsRow tags={detail.about.archetypeTags} /> : null}
              <TextBlock text={detail.about.archetypes} />
  
              {detail.about.character.trim().length ? (
                <>
                  <div>
              <SubHeader title="Характер" />
              <div className="mt-3">
                <TextBlock text={detail.about.character} />
              </div>
            </div>
                </>
              ) : null}
            </div>
          );
  
        case "relations":
          return (
            <div className="flex flex-col gap-8">
              {detail.about.relationshipsTags.length ? <TagsRow tags={detail.about.relationshipsTags} /> : null}
              <TextBlock text={detail.about.relations} />
            </div>
          );
  
        case "names":
          return (
            <div className="flex flex-col gap-8">
              <TextBlock text={detail.about.names} />
  
              <div>
              <SubHeader title="Фамилии" />
              <div className="mt-3">
                <TextBlock text={detail.about.surname} />
              </div>
            </div>
  
              {detail.about.nameFeatures.trim().length ? (
                <>
                  <div>
              <SubHeader title="Особенности" />
              <div className="mt-3">
                <TextBlock text={detail.about.nameFeatures} />
              </div>
            </div>
                </>
              ) : null}
            </div>
          );
  default:
          return null;
      }
}
