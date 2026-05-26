"use client";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/RecordButton";
import { ReflectionForm } from "@/components/ReflectionForm";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  const { state, audioBlob, duration, elapsed, start, stop, reset } = useRecorder();

  if (state === "done" && audioBlob) {
    return (
      <main className="min-h-screen flex flex-col px-5 pt-16 pb-36 max-w-md mx-auto w-full">
        <ReflectionForm audioBlob={audioBlob} duration={duration} onSaved={reset} onCancel={reset} />
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center px-6">
      <div className="mt-16 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-xl text-[var(--fg)]">
          Reflexiones
        </h1>
      </div>

      <div className="mt-auto mb-0 pb-44 flex flex-col items-center gap-6">
        {state === "recording" && (
          <p className="text-sm text-[var(--muted)] tracking-wide">
            Grabando… {elapsed}s
          </p>
        )}
        {state === "idle" && (
          <p className="text-sm text-[var(--muted)]">
            Grabá un pensamiento sobre lo que estás leyendo
          </p>
        )}
        <RecordButton state={state} onStart={start} onStop={stop} />
        {state === "idle" && (
          <p className="text-xs text-[var(--accent)] tracking-widest uppercase">
            Tocá para grabar
          </p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
