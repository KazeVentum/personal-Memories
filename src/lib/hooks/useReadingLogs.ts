"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { DailyActivity } from "@/types";

const supabase = createClient();

async function fetchReadingLogs(): Promise<DailyActivity[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const since = new Date();
  since.setDate(since.getDate() - 364);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reading_logs")
    .select("logged_at, pages_read")
    .eq("user_id", user.id)
    .gte("logged_at", sinceStr)
    .order("logged_at", { ascending: true });

  if (error || !data) return [];

  const byDate = new Map<string, number>();
  for (const row of data) {
    const prev = byDate.get(row.logged_at) ?? 0;
    byDate.set(row.logged_at, prev + row.pages_read);
  }

  return Array.from(byDate.entries()).map(([date, count]) => ({ date, count }));
}

export function useReadingLogs() {
  const { data: logs = [], isLoading, mutate } = useSWR<DailyActivity[]>(
    "reading_logs",
    fetchReadingLogs,
    { revalidateOnFocus: false }
  );

  const logReading = async (bookId: string, delta: number): Promise<void> => {
    if (delta <= 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    await supabase.rpc("upsert_reading_log", {
      p_user_id: user.id,
      p_book_id: bookId,
      p_pages_read: delta,
      p_logged_at: today,
    });

    await mutate();
  };

  return { logs, isLoading, logReading };
}
