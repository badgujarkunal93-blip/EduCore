import { useEffect, useState } from "react";

export function useLiveSubscription(subscribe, deps, initialValue = null) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribe((value) => {
      setData(value);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, deps);

  return { data, loading };
}
