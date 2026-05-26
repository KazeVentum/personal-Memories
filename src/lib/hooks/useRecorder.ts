"use client";
import { useState, useRef, useCallback, useEffect } from "react";

type RecorderState = "idle" | "recording" | "done";

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = useCallback(async () => {
    chunksRef.current = [];
    setElapsed(0);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const mr = new MediaRecorder(stream, { mimeType });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      setAudioBlob(blob);
      setDuration(finalDuration);
      stream.getTracks().forEach((t) => t.stop());
      setState("done");
    };
    mr.start(100);
    startTimeRef.current = Date.now();
    mediaRecorderRef.current = mr;
    setState("recording");

    intervalRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setElapsed(0);
    setState("idle");
  }, []);

  return { state, audioBlob, duration, elapsed, start, stop, reset };
}
