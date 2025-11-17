import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import { useBasemaps } from "./useBasemaps";
import styles from "./Basemaps.module.css";

interface BasemapsProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  onPanelClose: () => void;
  closed: boolean;
  style?: React.CSSProperties;
}

const Basemaps: React.FC<BasemapsProps> = ({
  mapElement,
  closed,
  onPanelClose,
}) => {
  const { mapsSource, imageSource } = useBasemaps(mapElement);
  return (
    <calcite-panel
      heading="Basemaps"
      closable
      oncalcitePanelClose={() => onPanelClose()}
      closed={closed}
      className={styles.basemapsPanel}
    >
      <calcite-tabs
        position="bottom"
        scale="l"
        layout="center"
        style={{ height: "calc(100vh - 50px - 65px)" }}
      >
        <calcite-tab-nav slot="title-group">
          <calcite-tab-title selected iconStart="basemap">
            Maps
          </calcite-tab-title>
          <calcite-tab-title iconStart="image-layer">Images</calcite-tab-title>
          <calcite-tab-title iconStart="arcgis-online">Esri</calcite-tab-title>
        </calcite-tab-nav>
        <calcite-tab selected>
          <arcgis-basemap-gallery
            className={styles.basemapGallery}
            referenceElement={mapElement.current}
            source={mapsSource}
          ></arcgis-basemap-gallery>
        </calcite-tab>
        <calcite-tab>
          <arcgis-basemap-gallery
            className={styles.basemapGallery}
            referenceElement={mapElement.current}
            source={imageSource}
          ></arcgis-basemap-gallery>
        </calcite-tab>
        <calcite-tab>
          <arcgis-basemap-gallery
            className={styles.basemapGallery}
            referenceElement={mapElement.current}
          ></arcgis-basemap-gallery>
        </calcite-tab>
      </calcite-tabs>
    </calcite-panel>
  );
};

export default React.memo(
  Basemaps,
  (prev, next) =>
    prev.mapElement === next.mapElement &&
    prev.closed === next.closed &&
    prev.onPanelClose === next.onPanelClose
);
