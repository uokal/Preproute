import { useCallback, useEffect } from "react";

const MESSAGE = "You have unsaved changes. Are you sure you want to leave?";

export const useUnsavedChanges = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return undefined;

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = MESSAGE;
      return MESSAGE;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target || link.origin !== window.location.origin) return;
      if (window.confirm(MESSAGE)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [enabled]);

  return useCallback(
    (onConfirm: () => void) => {
      if (!enabled || window.confirm(MESSAGE)) onConfirm();
    },
    [enabled]
  );
};
