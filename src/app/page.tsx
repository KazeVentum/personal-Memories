"use client";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/RecordButton";
import { ReflectionForm } from "@/components/ReflectionForm";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  const { state, audioBlob, duration, elapsed, start, stop, reset } = useRecorder();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-20">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {state !== "done" && (
          <>
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-lora)] text-2xl text-[var(--fg)] mb-2">
                Reflexiones
              </h1>
              {state === "idle" && (
                <p className="text-sm text-[var(--muted)]">
                  Grabá un pensamiento sobre lo que estás leyendo
                </p>
              )}
              {state === "recording" && (
                <p className="text-sm text-[var(--muted)]">
                  Grabando... {elapsed}s
                </p>
              )}
            </div>
            <RecordButton state={state} onStart={start} onStop={stop} />
            {state === "idle" && (
              <p className="text-xs text-[var(--accent)]">
                Tocá para grabar
              </p>
            )}
          </>
        )}

        {state === "done" && audioBlob && (
          <ReflectionForm
            audioBlob={audioBlob}
            duration={duration}
            onSaved={reset}
            onCancel={reset}
          />
        )}
      </div>
      <BottomNav />
    </main>
  );
}
