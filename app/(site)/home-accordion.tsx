"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicNavCategory } from "@/helper/public-category-nav";

type Props = {
  categories: PublicNavCategory[];
  activeSubSlug?: string;
  activeCatSlug?: string;
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

function openIdForNav(
  categories: PublicNavCategory[],
  activeSubSlug: string,
  activeCatSlug: string,
): string {
  const sub = norm(activeSubSlug);
  const cat = norm(activeCatSlug);
  if (sub) {
    for (const c of categories) {
      if (c.subcategories.some((s) => norm(s.slug) === sub)) {
        return c.id;
      }
    }
  }
  if (cat) {
    const found = categories.find((c) => norm(c.slug) === cat);
    if (found) return found.id;
  }
  return categories[0]?.id ?? "";
}

export function HomeAccordion({
  categories,
  activeSubSlug = "",
  activeCatSlug = "",
}: Props) {
  const [open, setOpen] = useState(() =>
    openIdForNav(categories, activeSubSlug, activeCatSlug),
  );
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  const catKey = categories.map((c) => c.id).join("|");

  useEffect(() => {
    setOpen(
      openIdForNav(categoriesRef.current, activeSubSlug, activeCatSlug),
    );
  }, [catKey, activeSubSlug, activeCatSlug]);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
        No categories or subcategories yet. Add categories from the back office.
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
      {categories.map((c) => {
        const isOpen = open === c.id;
        return (
          <div key={c.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? "" : c.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              <span className="pr-2">{c.name}</span>
              <span className="shrink-0 text-zinc-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? (
              <ul className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-2">
                <li>
                  <Link
                    href={`/?cat=${encodeURIComponent(c.slug)}`}
                    className={`block rounded-md py-1.5 text-sm hover:text-blue-600 ${
                      norm(activeCatSlug) === norm(c.slug) && !norm(activeSubSlug)
                        ? "font-medium text-blue-700"
                        : "text-zinc-600"
                    }`}
                  >
                    All stories — {c.name}
                  </Link>
                </li>
                {c.subcategories.length === 0 ? (
                  <li className="py-2 text-sm text-zinc-500">No cities / subcategories in this category yet.</li>
                ) : (
                  c.subcategories.map((sub) => {
                    const subActive = norm(activeSubSlug) === norm(sub.slug);
                    return (
                      <li key={sub.id}>
                        <Link
                          href={`/?sub=${encodeURIComponent(sub.slug)}`}
                          className={`block rounded-md py-1.5 text-sm hover:text-blue-600 ${
                            subActive ? "font-medium text-blue-700" : "text-zinc-600"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
