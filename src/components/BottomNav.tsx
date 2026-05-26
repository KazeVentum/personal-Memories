"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, BookOpen, Library } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItem = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-full transition-colors ${
          active
            ? "text-[var(--accent)] bg-[var(--bg)]"
            : "text-[var(--muted)] hover:text-[var(--fg)]"
        }`}
      >
        {icon}
        <span className="text-[11px] font-medium leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]"
      style={{
        boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItem("/library", <Library size={22} strokeWidth={1.8} />, "Biblioteca")}
      {navItem("/", <Mic size={22} strokeWidth={1.8} />, "Grabar")}
      {navItem("/books", <BookOpen size={22} strokeWidth={1.8} />, "Libros")}
    </nav>
  );
}
