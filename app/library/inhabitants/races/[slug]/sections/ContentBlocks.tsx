"use client";

import React from "react";
import type { ContentBlock } from "@/lib/data/content";
import { TagsRow, SubHeader, TextBlock } from "./_shared";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

/**
 * A minimal block renderer for the new content model.
 *
 * Supported block types:
 * - paragraph: { text }
 * - heading: { level?: number, text }
 * - chips: { items: string[] }
 * - list: { title?: string, items: string[] }  (renders as simple list)
 * - kv_list: { title?: string, items: Array<{ name|key|left, meaning|value|right }> }
 * - quote: { text, author? }
 * - image: { bucket, path, src, alt?, caption? }
 * - gallery: { images: Array<{ bucket, path, src, alt?, caption? }>, variant?: "grid"|"carousel" }
 */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  const p = (block.payload ?? {}) as any;

  switch (block.type) {
    case "paragraph": {
      return <TextBlock text={String(p.text ?? "")} />;
    }

    case "heading": {
      const text = String(p.text ?? "");
      if (!text.trim()) return null;
      // Use existing SubHeader styling for level>=2, and plain for level 1.
      const level = Number(p.level ?? 2);
      if (level <= 1) {
        return (
          <div className="pt-1 pb-4">
            <div
              style={{
                fontFamily: "var(--font-buttons)",
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(244, 214, 123, 0.90)",
                textShadow: "0 0 14px rgba(244, 214, 123, 0.25), 0 2px 16px rgba(0,0,0,0.85)",
              }}
            >
              {text}
            </div>
          </div>
        );
      }
      return <SubHeader title={text} />;
    }

    case "chips": {
      const items = Array.isArray(p.items) ? p.items.map(String) : [];
      return <TagsRow tags={items} />;
    }

    case "list": {
      const title = String(p.title ?? "").trim();
      const items = Array.isArray(p.items) ? p.items.map(String).filter(Boolean) : [];
      if (!items.length) return null;

      return (
        <div className="flex flex-col gap-3">
          {title ? <SubHeader title={title} /> : null}
          <div className="rounded-2xl border border-white/10 bg-black/25 p-5 lg:p-3" style={{ backdropFilter: "blur(10px)" }}>
            <ul className="list-disc pl-6" style={{ color: "rgba(235, 245, 255, 0.90)", fontSize: 18, lineHeight: 1.65 }}>
              {items.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    case "kv_list": {
      const title = String(p.title ?? "").trim();
      const items = Array.isArray(p.items) ? p.items : [];
      if (!items.length) return null;

      return (
        <div className="flex flex-col gap-3">
          {title ? <SubHeader title={title} /> : null}
          <div
            className="rounded-2xl border border-white/10 bg-black/25 p-5 lg:p-3"
            style={{
              backdropFilter: "blur(10px)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
              color: "rgba(235, 245, 255, 0.90)",
              fontSize: 18,
              lineHeight: 1.65,
            }}
          >
            <div className="flex flex-col gap-2">
              {items.map((it: any, idx: number) => {
                const left = String(it.name ?? it.key ?? it.left ?? "");
                const right = String(it.meaning ?? it.value ?? it.right ?? "");
                if (!left.trim() && !right.trim()) return null;
                return (
                  <div key={idx} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <div
                      className="sm:w-[280px] shrink-0"
                      style={{
                        fontFamily: "var(--font-buttons)",
                        letterSpacing: "0.02em",
                        color: "rgba(244, 214, 123, 0.92)",
                        textShadow: "0 2px 14px rgba(0,0,0,0.8)",
                      }}
                    >
                      {left}
                    </div>
                    <div style={{ color: "rgba(235, 245, 255, 0.90)" }}>{right}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    case "quote": {
      const text = String(p.text ?? "").trim();
      if (!text) return null;
      const author = String(p.author ?? "").trim();
      return (
        <div
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:p-3"
          style={{ backdropFilter: "blur(10px)", boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}
        >
          <div style={{ color: "rgba(235,245,255,0.92)", fontSize: 18, lineHeight: 1.7, fontStyle: "italic" }}>
            {text}
          </div>
          {author ? (
            <div className="mt-3" style={{ color: "rgba(214,230,255,0.74)", fontSize: 14, letterSpacing: "0.12em" }}>
              — {author}
            </div>
          ) : null}
        </div>
      );
    }

    case "image": {
      const src = resolveImageSrc(p);
      if (!src) return null;
      const caption = String(p.caption ?? "").trim();
      const alt = String(p.alt ?? caption ?? "image");
      return (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25" style={{ backdropFilter: "blur(10px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="h-auto w-full object-cover" />
          </div>
          {caption ? <div style={{ color: "rgba(214,230,255,0.74)", fontSize: 14 }}>{caption}</div> : null}
        </div>
      );
    }

    case "gallery": {
      const images = Array.isArray(p.images) ? p.images : [];
      if (!images.length) return null;
      // MVP: render as grid. Carousel can be added later as a block-variant.
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((im: any, idx: number) => {
            const src = resolveImageSrc(im);
            if (!src) return null;
            const caption = String(im.caption ?? "").trim();
            const alt = String(im.alt ?? caption ?? "image");
            return (
              <div key={idx} className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25" style={{ backdropFilter: "blur(10px)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} className="h-auto w-full object-cover" />
                </div>
                {caption ? <div style={{ color: "rgba(214,230,255,0.74)", fontSize: 13 }}>{caption}</div> : null}
              </div>
            );
          })}
        </div>
      );
    }

    default: {
      // Unknown block type: show nothing in production UI.
      // During migration, you can temporarily replace this with a debug view.
      return null;
    }
  }
}

function resolveImageSrc(p: any): string {
  // Prefer explicit src (already public URL)
  if (typeof p?.src === "string" && p.src.trim()) return p.src.trim();

  // Or resolve from storage bucket/path
  const bucket = typeof p?.bucket === "string" ? p.bucket.trim() : "";
  const path = typeof p?.path === "string" ? p.path.trim() : "";
  if (bucket && path) return getPublicStorageUrl(bucket, path);

  return "";
}
