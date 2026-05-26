"use client";

interface Props {
  state: "idle" | "recording" | "done";
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ state, onStart, onStop }: Props) {
  const handleClick = () => {
    if (state === "idle") onStart();
    else if (state === "recording") onStop();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-24 h-24 rounded-full flex items-center justify-center
        select-none transition-all duration-200 cursor-pointer
        ${state === "recording"
          ? "bg-[var(--danger)] animate-pulse scale-110"
          : "bg-[var(--accent)] active:scale-95"
        }
      `}
      aria-label={state === "recording" ? "Tocá para terminar" : "Tocá para grabar"}
    >
      {state === "recording" ? (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 15.93V21h2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
        </svg>
      )}
    </button>
  );
}
