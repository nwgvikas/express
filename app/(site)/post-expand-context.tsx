"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PostExpandContextValue = {
  expandedPostId: string | null;
  setExpandedPostId: (id: string | null) => void;
};

const PostExpandContext = createContext<PostExpandContextValue | null>(null);

export function PostExpandProvider({ children }: { children: ReactNode }) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const value = useMemo(
    () => ({ expandedPostId, setExpandedPostId }),
    [expandedPostId],
  );
  return (
    <PostExpandContext.Provider value={value}>{children}</PostExpandContext.Provider>
  );
}

export function usePostExpand(): PostExpandContextValue {
  const ctx = useContext(PostExpandContext);
  if (!ctx) {
    throw new Error("PostExpandProvider required");
  }
  return ctx;
}

/** Jahan provider optional ho (tests) — yahan use mat karo production feed ke liye. */
export function usePostExpandOptional(): PostExpandContextValue | null {
  return useContext(PostExpandContext);
}
