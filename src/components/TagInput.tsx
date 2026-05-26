"use client";
import { useState, useRef } from "react";
import { useTags } from "@/lib/hooks/useTags";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: Props) {
  const { tags: existingTags } = useTags();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = input.trim()
    ? existingTags.filter(
        (t) => t.includes(input.toLowerCase()) && !value.includes(t)
      )
    : existingTags.filter((t) => !value.includes(t));

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || value.includes(normalized)) return;
    onChange([...value, normalized]);
    setInput("");
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-[var(--border)] rounded-lg focus-within:border-[var(--accent)] transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--surface)] text-[var(--fg)] rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="text-[var(--muted)] hover:text-[var(--danger)] leading-none transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "filosofía, identidad, ..." : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="px-2 py-0.5 text-xs border border-[var(--border)] text-[var(--muted)] rounded-full hover:border-[var(--accent)] hover:text-[var(--fg)] transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
