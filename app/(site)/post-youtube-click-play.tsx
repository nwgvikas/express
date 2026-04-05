"use client";

import { useCallback, useState } from "react";

type Props = {
  videoId: string;
  title: string;
};

export function PostYoutubeClickPlay({ videoId, title }: Props) {
  const [play, setPlay] = useState(false);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPlay(true);
    }
  }, []);

  if (play) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      onKeyDown={onKeyDown}
      className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-zinc-900 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label={`Video chalayein: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- YouTube CDN thumbnail */}
      <img
        src={thumb}
        alt=""
        className="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl ring-4 ring-white/40 transition duration-200 group-hover:scale-110 group-hover:bg-red-500 sm:h-16 sm:w-16">
          <svg className="ml-1 h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white">
        Video
      </span>
    </button>
  );
}
