import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import "@arcgis/map-components/components/arcgis-search";
import "@esri/calcite-components/components/calcite-combobox";
import "@esri/calcite-components/components/calcite-combobox-item";
import { useLocationSearch } from "./useLocationSearch";
import styles from "./LocationSearch.module.css";

interface LocationSearchProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  closed: boolean;
  onToolClose: () => void;
  style?: React.CSSProperties;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  mapElement,
  closed,
  onToolClose,
}) => {
  const {
    showIntersection,
    intersectingStreets,
    handleSearchReady,
    handleSelectResult,
    handleSearchClear,
    handleIntersectingStreetChange
  } = useLocationSearch(mapElement, closed);

  return (
    <calcite-panel
      heading="Location Search"
      closable
      oncalcitePanelClose={() => onToolClose()}
      closed={closed}
      collapsible
    >
      <arcgis-search
        className={styles.searchContainer}
        referenceElement={mapElement.current}
        onarcgisReady={handleSearchReady}
        onarcgisSelectResult={handleSelectResult}
        onarcgisSearchClear={handleSearchClear}
      ></arcgis-search>
      <br />
      {showIntersection && (
        <calcite-combobox
          scale="m"
          overlayPositioning="fixed"
          label={"intersecting street"}
          selectionMode="single"
          placeholder="Select intersecting street"
          oncalciteComboboxChange={handleIntersectingStreetChange}
        >
          {intersectingStreets.map((street) => (
            <calcite-combobox-item
              key={street.getAttribute("CARTONAME")}
              value={street}
              heading={street.getAttribute("CARTONAME")}
            ></calcite-combobox-item>
          ))}
        </calcite-combobox>
      )}
    </calcite-panel>
  );
};

export default LocationSearch;
