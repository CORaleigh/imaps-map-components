import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import WebMap from "@arcgis/core/WebMap";
import { useSearchParams } from "react-router-dom";
import Basemap from "@arcgis/core/Basemap";
import type { TargetedEvent } from "@arcgis/map-components";
import { layerService } from "../utils/mapLayerService";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

export type MapMode =
  | "identify"
  | "streetview"
  | "point"
  | "polyline"
  | "polygon"
  | "circle"
  | "rectangle"
  | "text"
  | "select"
  | "multipoint"
  | "coordinate"
  | null;

export interface MapContextType {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  webMap: WebMap | null;
  setWebMap: (webMap: WebMap) => void;
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
  geometry: __esri.Geometry | null;
  setGeometry: (geom: __esri.Geometry | null) => void;
  condos: __esri.Graphic[];
  setCondos: (condos: __esri.Graphic[]) => void;
  selectedCondo: __esri.Graphic | null;
  setSelectedCondo: (condos: __esri.Graphic | null) => void;
  webMapId: React.RefObject<string>;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  handleCustomActionClick: (action: "identify" | "streetview" | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  /** -------------------- Refs -------------------- **/
  const mapElement = useRef<HTMLArcgisMapElement>(null!);
  const webMapId = useRef<string>("95092428774c4b1fb6a3b6f5fed9fbc4");
  const initialized = useRef<boolean>(false);

  /** -------------------- State -------------------- **/
  const [webMap, setWebMap] = useState<WebMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [geometry, setGeometry] = useState<__esri.Geometry | null>(null);
  const [condos, setCondos] = useState<__esri.Graphic[]>([]);
  const [selectedCondo, setSelectedCondo] = useState<__esri.Graphic | null>(
    null
  );
  const [mapMode, setMapMode] = useState<MapMode>("identify");

  /** -------------------- Callbacks / Functions -------------------- **/

  // Persist basemap in localStorage
  const persistBasemap = useCallback(() => {
    const view = mapElement.current.view;
    if (!view.map || !view.map.basemap) return;

    reactiveUtils.watch(() => view.map!.basemap!, (basemap: __esri.Basemap) => {
      localStorage.setItem(
        `imaps_${webMapId.current}_basemap`,
        JSON.stringify(basemap.toJSON())
      );
    });

    const storedBasemap = localStorage.getItem(
      `imaps_${webMapId.current}_basemap`
    );
    if (storedBasemap) {
      const basemap = Basemap.fromJSON(JSON.parse(storedBasemap));
      view.map.basemap = basemap;
    }
  }, []);

  // Handle Google StreetView click
  const handleStreetViewMapClick = useCallback(
    (event: TargetedEvent<HTMLArcgisMapElement, __esri.ViewClickEvent>) => {
      const cbll = `${event.detail.mapPoint.latitude},${event.detail.mapPoint.longitude}`;
      const url = `https://maps.google.com?layer=c&cbll=${cbll}&cbp=0,0,0,0,0`;
      window.open(url, "streetview");
    },
    []
  );

  // Called once the map view is ready
  const viewReady = useCallback(() => {
    const view = mapElement.current.view;
    if (!view) return;

    layerService.attachView(view);
    layerService.restorePersistedState();
    persistBasemap();
  }, [persistBasemap]);

  // Handle custom actions like identify / streetview
  const handleCustomActionClick = useCallback(
    (action: "identify" | "streetview" | null) => {
      setMapMode(action);
    },
    []
  );

  /** -------------------- Effects -------------------- **/

  // Handle enabling/disabling popup and StreetView click listener
  useEffect(() => {
    const viewEl = mapElement.current;
    if (!viewEl) return;

    if (mapMode === "streetview") {
      viewEl.popupDisabled = true;
      viewEl.addEventListener("arcgisViewClick", handleStreetViewMapClick);
    } else {
      viewEl.removeEventListener("arcgisViewClick", handleStreetViewMapClick);
      viewEl.popupDisabled = mapMode === "identify" || !mapMode ? false : true;
    }

    if (!mapMode) {
      setMapMode("identify");
    }

    return () => {
      viewEl.removeEventListener("arcgisViewClick", handleStreetViewMapClick);
    };
  }, [mapMode, handleStreetViewMapClick]);

  // Initialize the map once
  useEffect(() => {
    if (!mapElement.current || initialized.current) return;
    initialized.current = true;

    async function initMap() {
      const app = searchParams.get("app");
      const id = searchParams.get("id");
      const mapId =
        app === "puma"
          ? "1feff5b9d152475b828c8483b12a86bb"
          : id || "95092428774c4b1fb6a3b6f5fed9fbc4";

      const { webmap, webmapTemplate } =
        await layerService.createWebMapWithRequiredAndPersisted(mapId);
      webMapId.current = mapId;

      mapElement.current.map = webmap;
      setWebMap(webmapTemplate);

      mapElement.current.view.when(() => {
        viewReady();

        const storedExtent = localStorage.getItem(
          `imaps_${webMapId.current}_extent`
        );
        if (storedExtent) {
          mapElement.current.view.extent = JSON.parse(storedExtent);
        }

        setMapReady(true);
      });
    }

    initMap();
  }, [searchParams, viewReady]);
  useEffect(() => {
    if (selectedCondo && selectedCondo.getAttribute("PIN_NUM")) {
      const pin = selectedCondo?.getAttribute("PIN_NUM");
      setSearchParams((prev) => {
        prev.set("pin", pin);
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete("pin");
        return prev;
      });
    }
  }, [selectedCondo, searchParams, setSearchParams]);

  /** -------------------- Provider -------------------- **/
  return (
    <MapContext.Provider
      value={{
        mapElement,
        webMap,
        setWebMap,
        mapReady,
        setMapReady,
        geometry,
        setGeometry,
        condos,
        setCondos,
        selectedCondo,
        setSelectedCondo,
        webMapId,
        mapMode,
        setMapMode,
        handleCustomActionClick,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export default MapContext;
