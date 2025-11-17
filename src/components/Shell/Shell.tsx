import React, { Suspense, useEffect } from "react";

import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-tooltip";

import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-action-group";
import "@esri/calcite-components/components/calcite-action";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-track";
import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-expand";

import "@arcgis/map-components/components/arcgis-scale-bar";

import { useShell } from "./useShell";
import { lazyWithPreload } from "../../utils/lazyLoad";
import Header from "../Header/Header";
import OverviewMap from "../tools/OverviewMap/OverviewMap";
import CoodinateConversion from "../tools/CoodinateConversion/CoodinateConversion";

// -------------------- Panels --------------------
interface PanelProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  onPanelClose: () => void;
  closed: boolean;
}

// Lazy-loaded panels with preload
export const PropertySearch = lazyWithPreload<PanelProps>(
  () => import("../panels/PropertySearch/PropertySearch")
);

export const LayerList = lazyWithPreload<PanelProps>(
  () => import("../panels/LayerList/LayerList")
);

export const Legend = lazyWithPreload<PanelProps>(
  () => import("../panels/Legend/Legend")
);

export const Basemaps = lazyWithPreload<PanelProps>(
  () => import("../panels/Basemaps/Basemaps")
);

export const Bookmarks = lazyWithPreload<PanelProps>(
  () => import("../panels/Bookmarks/Bookmarks")
);

// -------------------- Tools --------------------
interface ToolProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  onToolClose: () => void;
  closed: boolean;
}

// Lazy-loaded tools with preload
export const PropertySelect = lazyWithPreload<ToolProps>(
  () => import("../tools/PropertySelect/PropertySelect")
);

export const LocationSearch = lazyWithPreload<ToolProps>(
  () => import("../tools/LocationSearch/LocationSearch")
);

export const Measure = lazyWithPreload<ToolProps>(
  () => import("../tools/Measure/Measure")
);

export const Sketch = lazyWithPreload<ToolProps>(
  () => import("../tools/Sketch/Sketch")
);

export const Print = lazyWithPreload<ToolProps>(
  () => import("../tools/Print/Print")
);

const Shell: React.FC = () => {
  const {
    theme,
    activePanel,
    activeTool,
    openedPanels,
    openedTools,
    mapMode,
    appSize,
    coordinateConversionOpen,
    handleThemeClick,
    handlePanelActionClick,
    handlePanelClose,
    handleToolActionClick,
    handleCustomActionClick,
    handleToolClose,
    handleViewReady,
    handleViewHold,
    handleGoToHome,
    handleCoordinateExpandChange,
    mapElement,
    mapReady,
  } = useShell();
  // -------------------- Prefetch all lazy panels/tools --------------------
  useEffect(() => {
    const panels = [PropertySearch, LayerList, Legend, Basemaps, Bookmarks];
    const tools = [PropertySelect, LocationSearch, Measure, Sketch, Print];

    panels.forEach((p) => p.preload?.());
    tools.forEach((t) => t.preload?.());
  }, []);

  return (
    <calcite-shell className={appSize}>
      <Header theme={theme}></Header>
      <calcite-shell-panel
        slot="panel-end"
        position="end"
        collapsed={!activePanel}
        width="l"
        resizable
      >
        {openedPanels.includes("propertySearch") && mapReady && (
          <div hidden={activePanel !== "propertySearch"}>
            <Suspense fallback={null}>
              <PropertySearch
                mapElement={mapElement}
                onPanelClose={handlePanelClose}
                closed={activePanel !== "propertySearch"}
              />
            </Suspense>
          </div>
        )}
        {openedPanels.includes("bookmarks") && mapReady && (
          <div hidden={activePanel !== "bookmarks"}>

          <Suspense fallback={null}>
            <Bookmarks
              mapElement={mapElement}
              onPanelClose={handleToolClose}
              closed={activePanel !== "bookmarks"}
            ></Bookmarks>
          </Suspense>
          </div>
        )}
        {openedPanels.includes("layerList") && (
          <div hidden={activePanel !== "layerList"}>
            <Suspense fallback={null}>
              <LayerList
                mapElement={mapElement}
                onPanelClose={handlePanelClose}
                closed={activePanel !== "layerList"}
              />
            </Suspense>
          </div>
        )}
        {openedPanels.includes("legend") && (
          <div hidden={activePanel !== "legend"}>
            <Suspense fallback={null}>
              <Legend
                mapElement={mapElement}
                onPanelClose={handlePanelClose}
                closed={activePanel !== "legend"}
              />
            </Suspense>
          </div>
        )}

        {openedPanels.includes("basemap") && (
          <div hidden={activePanel !== "basemap"}>
            <Suspense fallback={null}>
              <Basemaps
                mapElement={mapElement}
                onPanelClose={handlePanelClose}
                closed={activePanel !== "basemap"}
              />
            </Suspense>
          </div>
        )}

        <calcite-action-bar slot="action-bar">
          <calcite-action-group>
            <calcite-action
              id="property-search-action"
              scale="m"
              text={"Property Search"}
              icon="search"
              active={activePanel === "propertySearch"}
              onClick={() => handlePanelActionClick("propertySearch")}
            ></calcite-action>
            <calcite-tooltip reference-element="property-search-action">
              Property Search
            </calcite-tooltip>

            <calcite-action
              id="layerlist-action"
              scale="m"
              text={"Layer List"}
              icon="layers"
              active={activePanel === "layerList"}
              onClick={() => handlePanelActionClick("layerList")}
            ></calcite-action>
            <calcite-tooltip reference-element="layerlist-action">
              Layer List
            </calcite-tooltip>
            <calcite-action
              id="legend-action"
              scale="m"
              text={"Legend"}
              icon="legend"
              active={activePanel === "legend"}
              onClick={() => handlePanelActionClick("legend")}
            ></calcite-action>
            <calcite-tooltip reference-element="legend-action">
              Legend
            </calcite-tooltip>
            <calcite-action
              id="basemaps-action"
              scale="m"
              text={"Basemaps"}
              icon="basemap"
              active={activePanel === "basemap"}
              onClick={() => handlePanelActionClick("basemap")}
            ></calcite-action>
            <calcite-tooltip reference-element="basemaps-action">
              Basemaps
            </calcite-tooltip>
            <calcite-action
              id="bookmarks-action"
              scale="m"
              text={"Bookmarks"}
              icon="bookmark"
              onClick={() => handlePanelActionClick("bookmarks")}
            ></calcite-action>
            <calcite-tooltip reference-element="bookmarks-action">
              Bookmarks
            </calcite-tooltip>
          </calcite-action-group>
          <calcite-action-group>
            <calcite-action
              id="property-select-action"
              scale="m"
              text={"Property Select"}
              icon="select"
              active={activeTool === "select"}
              onClick={() => handleToolActionClick("select")}
            ></calcite-action>
            <calcite-tooltip reference-element="property-select-action">
              Property Select
            </calcite-tooltip>
            <calcite-action
              id="location-search-action"
              scale="m"
              text={"Location Search"}
              icon="pin"
              active={activeTool === "location"}
              onClick={() => handleToolActionClick("location")}
            ></calcite-action>
            <calcite-tooltip reference-element="location-search-action">
              Location Search
            </calcite-tooltip>
            <calcite-action
              id="measure-action"
              scale="m"
              text={"Measure"}
              icon="measure"
              active={activeTool === "measure"}
              onClick={() => handleToolActionClick("measure")}
            ></calcite-action>
            <calcite-tooltip reference-element="measure-action">
              Measure
            </calcite-tooltip>
            <calcite-action
              id="sketch-action"
              scale="m"
              text={"Sketch"}
              icon="pencil"
              active={activeTool === "sketch"}
              onClick={() => handleToolActionClick("sketch")}
            ></calcite-action>
            <calcite-tooltip reference-element="sketch-action">
              Sketch
            </calcite-tooltip>

            <calcite-action
              id="print-action"
              scale="m"
              text={"Print"}
              icon="print"
              active={activeTool === "print"}
              onClick={() => handleToolActionClick("print")}
            ></calcite-action>
            <calcite-tooltip reference-element="print-action">
              Print
            </calcite-tooltip>
          </calcite-action-group>
          <calcite-action-group slot="actions-end">
            <calcite-action
              id="theme-action"
              scale="m"
              text={theme === "light" ? "Light" : "Dark"}
              icon={theme === "light" ? "brightness" : "moon"}
              onClick={handleThemeClick}
            ></calcite-action>
            <calcite-tooltip reference-element="theme-action">
              Toggle {theme === "light" ? "dark" : "light"} theme
            </calcite-tooltip>
          </calcite-action-group>
        </calcite-action-bar>
      </calcite-shell-panel>
      <arcgis-map
        ref={mapElement}
        // item-id="95092428774c4b1fb6a3b6f5fed9fbc4"
        onarcgisViewReadyChange={handleViewReady}
        onarcgisViewHold={handleViewHold}
      >
        <arcgis-zoom slot="top-left"></arcgis-zoom>
        <arcgis-home
          slot="top-left"
          goToOverride={handleGoToHome}
        ></arcgis-home>
        <arcgis-compass slot="top-left"></arcgis-compass>
        <arcgis-track slot="top-left"></arcgis-track>
        <div slot="top-left" id="custom-actions">
          <calcite-action
            id="identify-action"
            scale="s"
            label="identify"
            slot="top-left"
            text={"identify"}
            icon="information"
            active={mapMode === "identify"}
            onClick={() => handleCustomActionClick("identify")}
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
            slot="top-left"
            text={"streetview"}
            icon="360-view"
            active={mapMode === "streetview"}
            onClick={() => handleCustomActionClick("streetview")}
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
          onarcgisPropertyChange={handleCoordinateExpandChange}
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
        >
          <OverviewMap mapElement={mapElement}></OverviewMap>
        </arcgis-expand>

        <div slot="top-right">
          {openedTools.includes("select") && (
            <Suspense fallback={null}>
              <PropertySelect
                mapElement={mapElement}
                onToolClose={handleToolClose}
                closed={activeTool !== "select"}
              ></PropertySelect>
            </Suspense>
          )}
          {openedTools.includes("location") && (
            <Suspense fallback={null}>
              <LocationSearch
                mapElement={mapElement}
                onToolClose={handleToolClose}
                closed={activeTool !== "location"}
              />
            </Suspense>
          )}
          {openedTools.includes("measure") && (
            <Suspense fallback={null}>
              <Measure
                onToolClose={handleToolClose}
                mapElement={mapElement}
                closed={activeTool !== "measure"}
              ></Measure>
            </Suspense>
          )}
          {openedTools.includes("sketch") && (
            <Suspense fallback={null}>
              <Sketch
                onToolClose={handleToolClose}
                closed={activeTool !== "sketch"}
                mapElement={mapElement}
              ></Sketch>
            </Suspense>
          )}
          {openedTools.includes("print") && (
            <Suspense fallback={null}>
              <Print
                mapElement={mapElement}
                onToolClose={handleToolClose}
                closed={activeTool !== "print"}
              ></Print>
            </Suspense>
          )}
        </div>
      </arcgis-map>
      <calcite-tooltip reference-element="overview-action">
        Overview
      </calcite-tooltip>
      <calcite-tooltip reference-element="coordinate-action" placement="top">
        Coordinates
      </calcite-tooltip>
    </calcite-shell>
  );
};

export default Shell;
