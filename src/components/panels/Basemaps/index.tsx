import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-alert";

import "@arcgis/map-components/components/arcgis-basemap-gallery";
import { useBasemaps } from "./useBasemaps";
import styles from "./Basemaps.module.css";
import TipManager from "../../TipsManager";

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
  const {
    mapsSource,
    imageSource,
    mapsGallery,
    imagesGallery,
    esriGallery,
    handleGalleryReady,
    handleTabChange,
  } = useBasemaps(mapElement);
  return (
    <>
      <calcite-panel
        heading="Basemaps"
        closable
        oncalcitePanelClose={() => onPanelClose()}
        closed={closed}
        className={styles.basemapsPanel}
      >
        <TipManager name="basemaps"></TipManager>

        <calcite-tabs
          position="bottom"
          scale="l"
          layout="center"
          style={{ height: "calc(100vh - 50px - 65px)" }}
        >
          <calcite-tab-nav
            slot="title-group"
            oncalciteTabChange={handleTabChange}
          >
            <calcite-tab-title selected iconStart="basemap" label="basemap">
              Maps
            </calcite-tab-title>
            <calcite-tab-title iconStart="image-layer" label="images">
              Images
            </calcite-tab-title>
            <calcite-tab-title iconStart="arcgis-online" label="esri">
              Esri
            </calcite-tab-title>
          </calcite-tab-nav>
          <calcite-tab selected>
            <arcgis-basemap-gallery
              ref={mapsGallery}
              className={styles.basemapGallery}
              referenceElement={mapElement.current}
              source={mapsSource}
              onarcgisReady={handleGalleryReady}
            ></arcgis-basemap-gallery>
          </calcite-tab>
          <calcite-tab>
            <arcgis-basemap-gallery
              ref={imagesGallery}
              className={styles.basemapGallery}
              referenceElement={mapElement.current}
              source={imageSource}
              onarcgisReady={handleGalleryReady}
            ></arcgis-basemap-gallery>
          </calcite-tab>
          <calcite-tab>
            <arcgis-basemap-gallery
              ref={esriGallery}
              className={styles.basemapGallery}
              referenceElement={mapElement.current}
              onarcgisReady={handleGalleryReady}
            ></arcgis-basemap-gallery>
          </calcite-tab>
        </calcite-tabs>
      </calcite-panel>
    </>
  );
};

export default React.memo(
  Basemaps,
  (prev, next) =>
    prev.mapElement === next.mapElement &&
    prev.closed === next.closed &&
    prev.onPanelClose === next.onPanelClose
);
 