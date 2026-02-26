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
    selectedTab,
    blendSlider,
    handleGalleryReady,
    handleTabChange,
    handleBlendChange
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
        {selectedTab === "images" && (
          <div slot="content-top">
            <calcite-label layout="inline">
              <calcite-switch oncalciteSwitchChange={handleBlendChange}></calcite-switch>
              Blend
            </calcite-label>
             <calcite-slider ref={blendSlider} hidden></calcite-slider>
          </div>
        )}
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
            <calcite-tab-title
              selected={selectedTab === "basemap"}
              iconStart="basemap"
              label="basemap"
            >
              Maps
            </calcite-tab-title>
            <calcite-tab-title
              selected={selectedTab === "images"}
              iconStart="image-layer"
              label="images"
            >
              Images
            </calcite-tab-title>
            <calcite-tab-title
              selected={selectedTab === "esri"}
              iconStart="arcgis-online"
              label="esri"
            >
              Esri
            </calcite-tab-title>
          </calcite-tab-nav>
          <calcite-tab selected={selectedTab === "basemap"}>
            <arcgis-basemap-gallery
              ref={mapsGallery}
              className={styles.basemapGallery}
              referenceElement={mapElement.current}
              source={mapsSource}
              onarcgisReady={handleGalleryReady}
            ></arcgis-basemap-gallery>
          </calcite-tab>
          <calcite-tab selected={selectedTab === "images"}>
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
              selected={selectedTab === "esri"}
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
