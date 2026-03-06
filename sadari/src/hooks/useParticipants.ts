"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function useParticipants() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [participants, setParticipants] = useState<string[]>([]);
  // To avoid hydration mismatch, optionally track if mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const namesParam = searchParams.get("names");
    if (namesParam) {
      const parsedNames = namesParam.split(",").map(n => n.trim()).filter(Boolean);
      setParticipants(parsedNames);
    }
  }, [searchParams]);

  const updateParticipants = useCallback((names: string[]) => {
    setParticipants(names);
    const params = new URLSearchParams(searchParams.toString());
    if (names.length > 0) {
      params.set("names", names.join(","));
    } else {
      params.delete("names");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return {
    isMounted,
    participants,
    updateParticipants
  };
}
