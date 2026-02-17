import { useEffect, useRef } from "react";

export default function useIdleLogout(
  logoutFn: () => void,
  timeout: number = 1 * 60 * 1000
): void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      logoutFn();
    }, timeout);
  };

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeout, logoutFn]);
}
