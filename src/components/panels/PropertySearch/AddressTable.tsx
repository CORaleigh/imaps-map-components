// PropertyInfo.tsx

import "@arcgis/map-components/components/arcgis-feature";
import React, { type RefObject } from "react";

import styles from "./PropertySearch.module.css";
import type { TargetedEvent } from "@arcgis/map-components";

interface AddressTableProps {
  addressTableElement: RefObject<HTMLArcgisFeatureTableElement>;
  mapElement: RefObject<HTMLArcgisMapElement>;
  feature: __esri.Graphic;
  onReady: (event: TargetedEvent<HTMLArcgisFeatureTableElement, void>) => void;
  onCellClick: (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      __esri.FeatureTableCellClickEvent
    >
  ) => void;
  onPropertyChange: (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      {
        name:
          | "state"
          | "size"
          | "layerView"
          | "effectiveSize"
          | "isQueryingOrSyncing";
      }
    >
  ) => void;
  onExportClick: () => void;
}

const AddressTable: React.FC<AddressTableProps> = ({
  addressTableElement,
  feature,
  mapElement,
  onReady,
  onCellClick,
  onPropertyChange,
  onExportClick,
}) => {
  return (
    <>
      <arcgis-feature-table
        className={styles.featureTable}
        ref={addressTableElement}
        filterGeometry={feature.geometry}
        referenceElement={mapElement.current}
        onarcgisReady={onReady}
        onarcgisPropertyChange={onPropertyChange}
        hideSelectionColumn
        onarcgisCellClick={onCellClick}
        noDataMessage={"No addresses found"}
        hideMenuItemsRefreshData
        hideMenuItemsToggleColumns
        style={{ marginBottom: "1em" }}
        menuConfig={{
          items: [
            {
              label: "Export CSV",
              icon: "export",
              clickFunction: onExportClick,
            },
          ],
        }}
      ></arcgis-feature-table>
    </>
  );
};

export default React.memo(
  AddressTable,
  (prev, next) => prev.feature === next.feature
);
