"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function fetchTags(): Promise<string[]> {
  const set = new Set<string>();
  
  // Obtener etiquetas de reflexiones
  const { data: reflectionsData } = await supabase.from("reflections").select("tags");
  reflectionsData?.forEach((r) => r.tags?.forEach((t: string) => set.add(t.toLowerCase())));

  // Obtener etiquetas de citas (con control de errores por si no se ha ejecutado la migración)
  try {
    const { data: quotesData, error } = await supabase.from("quotes").select("tags");
    if (!error && quotesData) {
      quotesData.forEach((q) => q.tags?.forEach((t: string) => set.add(t.toLowerCase())));
    }
  } catch (e) {
    console.warn("Quotes table may not exist yet:", e);
  }

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
