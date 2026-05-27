"use client";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import type { DailyActivity } from "@/types";

interface ReadingHeatmapProps {
  logs: DailyActivity[];
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function intensityClass(pages: number, max: number): string {
  if (pages === 0 || max === 0) return "opacity-10";
  const ratio = pages / max;
  if (ratio < 0.25) return "opacity-30";
  if (ratio < 0.5) return "opacity-55";
  if (ratio < 0.75) return "opacity-75";
  return "opacity-100";
}

function calcStreak(logs: DailyActivity[]): number {
  const today = toLocalDateStr(new Date());
  const activitySet = new Set(logs.filter((l) => l.count > 0).map((l) => l.date));

  let streak = 0;
  const cursor = new Date();

  // Si hoy no tiene actividad, empezamos desde ayer
  if (!activitySet.has(today)) cursor.setDate(cursor.getDate() - 1);

  while (activitySet.has(toLocalDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function ReadingHeatmap({ logs }: ReadingHeatmapProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) map.set(l.date, l.count);
    return map;
  }, [logs]);

  const maxPages = useMemo(() => Math.max(0, ...logs.map((l) => l.count)), [logs]);
  const streak = useMemo(() => calcStreak(logs), [logs]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = getMondayOf(today);
    monday.setDate(monday.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = toLocalDateStr(d);
      const pages = activityMap.get(dateStr) ?? 0;
      const isToday = dateStr === toLocalDateStr(new Date());
      const isFuture = d > new Date();
      return { dateStr, pages, isToday, isFuture, label: d.getDate() };
    });
  }, [weekOffset, activityMap]);

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return "Esta semana";
    if (weekOffset === -1) return "Semana pasada";
    const monday = weekDays[0];
    const sunday = weekDays[6];
    const fmt = (str: string) => {
      const d = new Date(str + "T00:00:00");
      return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    };
    return `${fmt(monday.dateStr)} – ${fmt(sunday.dateStr)}`;
  }, [weekOffset, weekDays]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--fg)]">Actividad lectora</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-[var(--accent)] font-medium">
              <Flame size={13} />
              {streak} {streak === 1 ? "día" : "días"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-[var(--muted)] w-28 text-center">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset === 0}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Semana siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] text-[var(--muted)]">
            {label}
          </div>
        ))}

        {weekDays.map(({ dateStr, pages, isToday, isFuture }) => (
          <div key={dateStr} className="flex flex-col items-center">
            <div
              title={pages > 0 ? `${pages} páginas leídas` : "Sin actividad"}
              className={[
                "w-full aspect-square rounded-md bg-[var(--accent)] transition-all",
                isFuture ? "opacity-5" : intensityClass(pages, maxPages),
                isToday ? "ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg)]" : "",
              ].join(" ")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
