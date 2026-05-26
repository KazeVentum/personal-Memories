"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export function BottomNav() {
  const pathname = usePathname();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        pathname === href
          ? "text-[var(--fg)] font-medium"
          : "text-[var(--muted)] hover:text-[var(--fg)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-8 py-4 bg-[var(--bg)] border-t border-[var(--border)]">
      {link("/library", "Biblioteca")}
      {link("/", "Inicio")}
      {link("/books", "Libros")}
      <ThemeToggle />
    </nav>
  );
}
