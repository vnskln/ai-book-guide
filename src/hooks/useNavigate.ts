import { useCallback } from "react";

export const useNavigate = () => {
  const navigate = useCallback((path: string) => {
    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = path;
      });
    } else {
      window.location.href = path;
    }
  }, []);

  return navigate;
};
