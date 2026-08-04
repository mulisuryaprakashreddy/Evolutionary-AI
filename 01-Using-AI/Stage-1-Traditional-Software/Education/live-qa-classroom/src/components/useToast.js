import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToast({ id, message });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 2400);
  }, []);

  return { toast, show };
}
