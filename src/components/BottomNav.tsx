"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, BookOpen, Library, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeToggleIcon() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored === "dark" || (!stored && prefersDark));
    if (stored === "dark") document.documentElement.classList.add("dark");
    if (stored === "light") document.documentElement.classList.add("light");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="flex flex-col items-center gap-1 min-w-[52px] py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
    >
      {dark ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
      <span className="text-[10px] leading-none">{dark ? "Claro" : "Oscuro"}</span>
    </button>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const navItem = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 min-w-[52px] py-2 transition-colors ${
          active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
        }`}
      >
        {icon}
        <span className="text-[10px] leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]"
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItem("/library", <Library size={20} strokeWidth={1.8} />, "Biblioteca")}
      {navItem("/", <Mic size={20} strokeWidth={1.8} />, "Grabar")}
      {navItem("/books", <BookOpen size={20} strokeWidth={1.8} />, "Libros")}
      <ThemeToggleIcon />
    </nav>
  );
}
