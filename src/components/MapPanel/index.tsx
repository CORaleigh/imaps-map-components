import React, { Suspense, useEffect } from "react";

import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-track";
import "@arcgis/map-components/components/arcgis-scale-bar";

import { lazyWithPreload } from "../../utils/lazyLoad";
import OverviewMap from "../tools/OverviewMap";
import CoodinateConversion from "../tools/CoodinateConversion";
import type { TargetedEvent } from "@arcgis/map-components";
import type { MapMode } from "../../context/MapContext";
import type { ToolType } from "../Shell/useShell";

import styles from "./MapPanel.module.css";
import TipManager from "../TipsManager";
import type { HoldEvent } from "@arcgis/core/views/input/types";

interface MapPanelProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  activeTool: ToolType;
  openedTools: ToolType[];
  mapMode: MapMode;
  coordinateConversionOpen: boolean;
  onMapReady: (event: TargetedEvent<HTMLArcgisMapElement, void>) => void;
  onViewHold: (event: CustomEvent<HoldEvent>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onGoHome: any;
  onCustomActionClick: (action: "identify" | "streetview" | null) => void;
  onCoordinateExpand: (
    event: TargetedEvent<
      HTMLArcgisExpandElement,
      {
        name: "expanded";
      }
    >,
  ) => void;
  onToolClose: () => void;
}

// -------------------- Tools --------------------
interface ToolProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  onToolClose: () => void;
  closed: boolean;
}

// Lazy-loaded tools with preload
export const PropertySelect = lazyWithPreload<ToolProps>(
  () => import("../tools/PropertySelect"),
);

export const LocationSearch = lazyWithPreload<ToolProps>(
  () => import("../tools/LocationSearch"),
);

export const Measure = lazyWithPreload<ToolProps>(
  () => import("../tools/Measure"),
);

export const Sketch = lazyWithPreload<ToolProps>(
  () => import("../tools/Sketch/Sketch"),
);

export const Print = lazyWithPreload<ToolProps>(() => import("../tools/Print"));

const MapPanel: React.FC<MapPanelProps> = ({
  mapElement,
  activeTool,
  openedTools,
  mapMode,
  coordinateConversionOpen,
  onMapReady,
  onViewHold,
  onGoHome,
  onCustomActionClick,
  onCoordinateExpand,
  onToolClose,
}) => {
  useEffect(() => {
    const tools = [PropertySelect, LocationSearch, Measure, Sketch, Print];
    tools.forEach((t) => t.preload?.());
  }, []);

  return (
    <>
      <arcgis-map
        ref={mapElement}
        onarcgisViewReadyChange={onMapReady}
        onarcgisViewHold={onViewHold}
      >

        <arcgis-zoom slot="top-left"></arcgis-zoom>
        <arcgis-home slot="top-left" goToOverride={onGoHome}></arcgis-home>
        <arcgis-compass slot="top-left"></arcgis-compass>
        <arcgis-track slot="top-left"></arcgis-track>
        <div slot="top-left">
          <TipManager name="map" scale="s"></TipManager>
        </div>
        <div slot="top-left" className={styles.customActions}>
          <calcite-action
            id="identify-action"
            scale="s"
            label="identify"
            text={"identify"}
            icon="information"
            active={mapMode === "identify"}
            onClick={() => onCustomActionClick("identify")}
          ></calcite-action>
          <calcite-tooltip
            reference-element="identify-action"
            placement="right"
          >
            Identify
          </calcite-tooltip>
          <calcite-action
            id="streetview-action"
            scale="s"
            label="streetview"
            text={"streetview"}
            icon="i360-view"
            active={mapMode === "streetview"}
            onClick={() => onCustomActionClick("streetview")}
          ></calcite-action>
          <calcite-tooltip
            reference-element="streetview-action"
            placement="right"
          >
            Streetview
          </calcite-tooltip>
        </div>
        <arcgis-expand
          id="coordinate-action"
          slot="bottom-left"
          expandIcon="crosshair"
          onarcgisPropertyChange={onCoordinateExpand}
          mode="floating"
        >
          {mapElement.current?.map && (
            <CoodinateConversion
              mapElement={mapElement}
              isOpen={coordinateConversionOpen}
            ></CoodinateConversion>
          )}
        </arcgis-expand>

        <arcgis-scale-bar slot="bottom-left"></arcgis-scale-bar>
        <arcgis-expand
          slot="bottom-right"
          expandIcon="arrow-up-left"
          collapseIcon="arrow-down-right"
          id="overview-action"
          mode="floating"
        >
          <OverviewMap mapElement={mapElement}></OverviewMap>
        </arcgis-expand>

        <div slot="top-right">
          {openedTools.includes("select") && (
            <Suspense fallback={null}>
              <PropertySelect
                mapElement={mapElement}
                onToolClose={onToolClose}
                closed={activeTool !== "select"}
              ></PropertySelect>
            </Suspense>
          )}
          {openedTools.includes("location") && (
            <Suspense fallback={null}>
              <LocationSearch
                mapElement={mapElement}
                onToolClose={onToolClose}
                closed={activeTool !== "location"}
              />
            </Suspense>
          )}
          {openedTools.includes("measure") && (
            <Suspense fallback={null}>
              <Measure
                onToolClose={onToolClose}
                mapElement={mapElement}
                closed={activeTool !== "measure"}
              ></Measure>
            </Suspense>
          )}
          {openedTools.includes("sketch") && (
            <Suspense fallback={null}>
              <Sketch
                onToolClose={onToolClose}
                closed={activeTool !== "sketch"}
                mapElement={mapElement}
              ></Sketch>
            </Suspense>
          )}
          {openedTools.includes("print") && (
            <Suspense fallback={null}>
              <Print
                mapElement={mapElement}
                onToolClose={onToolClose}
                closed={activeTool !== "print"}
              ></Print>
            </Suspense>
          )}
        </div>
      </arcgis-map>
    </>
  );
};

export default MapPanel;
