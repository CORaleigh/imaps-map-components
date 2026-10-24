import { useEffect, useRef, useState, type RefObject } from "react";

export interface UseDisclaimerProps {
  open: boolean;
  checkbox: RefObject<HTMLCalciteCheckboxElement | null>;
  handleDialogClose: () => void;
  handleDialogClosed: () => void;
  handleDialogOpen: () => void; // Add this
}

export const useDisclaimer = (): UseDisclaimerProps => {
  const checkbox = useRef<HTMLCalciteCheckboxElement>(null);
  // control to return focus to after the dialog closes; null when it opened on page load
  const opener = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("imaps_hide_disclaimer");
    
    return stored !== "true" || !stored;
  });

  const handleDialogClose = () => {
    const isChecked = checkbox.current?.checked ?? false;
    setOpen(false);
    if (isChecked) {
      localStorage.setItem("imaps_hide_disclaimer", "true");
    } else {
      localStorage.removeItem("imaps_hide_disclaimer");
    }
  };

  const handleDialogOpen = () => {
    // opened from the header menu; its item is gone once the menu closes, so return to the menu button
    opener.current = document.getElementById("menu-button");
    setOpen(true);
  };

  // runs after the dialog has finished closing. Without this, focus is left on <body>: on page load
  // nothing had focus before the dialog opened, and from the menu the item that had focus is hidden.
  const handleDialogClosed = () => {
    requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        return;
      }
      const target = opener.current ?? document.getElementById("property-search-input");
      opener.current = null;
      if (!target?.checkVisibility()) {
        return;
      }
      // Calcite and ArcGIS components focus their inner control with setFocus()
      const component = target as HTMLElement & { setFocus?: () => Promise<void> };
      if (component.setFocus) {
        component.setFocus();
      } else {
        target.focus();
      }
    });
  };
  useEffect(() => {
    if (open && checkbox.current) {
      const stored = localStorage.getItem("imaps_hide_disclaimer");
      checkbox.current.checked = stored === "true";
    }
  }, [open]);

  return {
    open,
    checkbox,
    handleDialogClose,
    handleDialogClosed,
    handleDialogOpen,
  };
};
