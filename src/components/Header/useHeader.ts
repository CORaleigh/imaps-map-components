import { useEffect, useRef } from "react";

interface HeaderLink {
  title: string;
  href: string;
}
interface HeaderLinkGroup {
  title: string;
  links: HeaderLink[];
}
export interface UseHeaderProps {
  links: React.RefObject<HeaderLinkGroup[]>;
  logo: React.RefObject<string>;
  handleDropdownOpen: (
    event: HTMLCalciteDropdownElement["calciteDropdownOpen"],
  ) => void;
  handleClearStorage: () => void;
}

export const useHeader = (webMapId: string): UseHeaderProps => {
  const links = useRef<HeaderLinkGroup[]>([]);

  const params = new URLSearchParams(window.location.search);
  const app = params.get("app") ?? "config";

  // inside component:
  const logo = useRef(app === "puma" ? "puma" : "logo");

  const handleDropdownOpen = (
    event: HTMLCalciteDropdownElement["calciteDropdownOpen"],
  ) => {
    const wrapper = event.target.shadowRoot?.querySelector(".content");
    const groups = event.target.querySelectorAll("calcite-dropdown-group");
    const items = event.target.querySelectorAll("calcite-dropdown-item");
    if (!groups.length || !items.length) return;
    const groupHeight = 41;
    const itemHeight = 36;
    const height = groupHeight * groups.length + itemHeight * items.length;
    wrapper?.setAttribute("style", `min-height: ${height}px`);
  };
  const handleClearStorage = () => {
    localStorage.removeItem(`imaps_${webMapId}_basemap`);
    localStorage.removeItem(`imaps_${webMapId}_bookmarks`);
    localStorage.removeItem(`imaps_${webMapId}_layerVisibility`);
    localStorage.removeItem(`imaps_${webMapId}_extent`);
    localStorage.removeItem(`imaps_${webMapId}_history`);

    localStorage.removeItem(`imaps_theme_mode`);
    window.location.reload();
  };
  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const app = params.get("app") ?? "config";
      const res = await fetch(`${app}.json`);
      const data = await res.json();
      if (data.links) {
        links.current = data.links;
      }
    })();
  }, []);
  return {
    links,
    logo,
    handleDropdownOpen,
    handleClearStorage,
  };
};
