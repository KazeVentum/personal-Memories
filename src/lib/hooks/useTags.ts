"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function fetchTags(): Promise<string[]> {
  const { data } = await supabase.from("reflections").select("tags");
  const set = new Set<string>();
  data?.forEach((r) => r.tags?.forEach((t: string) => set.add(t.toLowerCase())));
  return Array.from(set).sort();
}

export function useTags() {
  const { data: tags = [], mutate } = useSWR<string[]>(
    "tags",
    fetchTags,
    { revalidateOnFocus: false }
  );

  return { tags, refetch: () => mutate() };
}
