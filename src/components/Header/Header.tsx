import React from "react";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-dropdown";
import "@esri/calcite-components/components/calcite-dropdown-group";
import "@esri/calcite-components/components/calcite-dropdown-item";
import "@esri/calcite-components/components/calcite-tooltip";

import { useHeader } from "./useHeader";
import { useMap } from "../../context/useMap";

interface HeaderProps {
  theme: "dark" | "light";
}

const Header: React.FC<HeaderProps> = ({ theme }) => {
  const { webMapId } = useMap();

  const { links, handleDropdownOpen, handleClearStorage } = useHeader(
    webMapId.current
  );
  return (
    <>
      <calcite-navigation slot="header">
        <calcite-navigation-logo
          slot="logo"
          thumbnail={theme === "light" ? "logo.svg" : "logo_dark.svg"}
          description="Wake County and City of Raleigh"
          href="https://www.wake.gov/departments-government/geographic-information-services-gis/maps-apps-data/imaps-information"
        ></calcite-navigation-logo>

        <calcite-dropdown
          scale="m"
          label={"menu"}
          overlayPositioning="absolute"
          width="l"
          slot="content-end"
          oncalciteDropdownBeforeOpen={handleDropdownOpen}
        >
          <calcite-action
            id="menu-button"
            text="Menu"
            icon="hamburger"
            slot="trigger"
          ></calcite-action>

          {links.current.map((group, i) => (
            <calcite-dropdown-group
              groupTitle={group.title}
              key={`header-group-${i}`}
              selectionMode="none"
            >
              {group.links.map((link, j) => (
                <calcite-dropdown-item
                  key={`header-link-${i}-${j}`}
                  href={link.href}
                  target="_blank"
                >
                  {link.title}
                </calcite-dropdown-item>
              ))}
            </calcite-dropdown-group>
          ))}
          <calcite-dropdown-group groupTitle="Settings" selectionMode="none">
            <calcite-dropdown-item
              iconStart="reset"
              onClick={handleClearStorage}
            >
              Clear Stored Settings
            </calcite-dropdown-item>
          </calcite-dropdown-group>
        </calcite-dropdown>
      </calcite-navigation>
      <calcite-tooltip referenceElement="menu-button" placement="left" overlayPositioning="fixed">Menu</calcite-tooltip>
    </>
  );
};

export default Header;
