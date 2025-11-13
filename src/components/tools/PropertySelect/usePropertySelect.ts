// hooks/useShell.ts
import { useState, useRef, useEffect, useCallback } from "react";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import { useMap } from "../../../context/useMap";
import type { TargetedEvent } from "@arcgis/map-components";
import type { MapMode } from "../../../context/MapContext";

type SketchTool =
  | "point"
  | "polyline"
  | "polygon"
  | "circle"
  | "rectangle"
  | "text"
  | "multipoint";

const SKETCH_TOOLS: SketchTool[] = [
  "point",
  "polyline",
  "polygon",
  "circle",
  "rectangle",
  "text",
  "multipoint",
];

export interface UsePropertySelectProps {
  mapMode: MapMode;
  bufferDistance: number;
  handleActionClick: (tool: MapMode) => void;
  handleBufferDistanceInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
  handleClear: () => void;
  handleToolClose: () => void;
}

export const usePropertySelect = (
  mapElement: React.RefObject<HTMLArcgisMapElement>,
  closed: boolean,
  onToolClose: () => void
): UsePropertySelectProps => {
  const { setGeometry, setCondos, setSelectedCondo, mapMode, setMapMode } =
    useMap();
  const [bufferDistance, setBufferDistance] = useState(0);

  const bufferDistanceRef = useRef(0);
  const graphicsLayer = useRef<GraphicsLayer>(undefined);
  const sketchViewModel = useRef<SketchViewModel>(undefined);

  const highlight = useRef<__esri.Handle>(undefined);

  const getLayerByTitle = (mapElement: HTMLArcgisMapElement, name: string) => {
    return mapElement.view.map?.allLayers.find(
      (layer: __esri.Layer) => layer.title === name && layer.type === "feature"
    );
  };

  const getFeatureLayerView = async (
    mapElement: HTMLArcgisMapElement
  ): Promise<__esri.FeatureLayerView> => {
    const layer = getLayerByTitle(
      mapElement,
      "Property"
    ) as __esri.FeatureLayer;
    if (!layer) throw new Error("Property layer not found");

    const layerView = (await mapElement.whenLayerView(
      layer
    )) as __esri.FeatureLayerView;

    if (!layerView) throw new Error("FeatureLayerView for Property not found");

    return layerView;
  };

  const cancelSelect = () => {
    sketchViewModel.current?.cancel();
    if (highlight) {
      highlight.current?.remove();
    }
    graphicsLayer.current?.removeAll();
  };

  // Handle sketch tool actions
  const handleActionClick = useCallback(
    (tool: MapMode) => {
      if (!mapElement.current || !sketchViewModel.current) return;

      if (tool === mapMode || !tool) {
        mapElement.current.popupDisabled = false;
        setMapMode(null);
        cancelSelect();
        return;
      }

      setMapMode(tool);

      if (tool && SKETCH_TOOLS.includes(tool as SketchTool)) {
        mapElement.current.popupDisabled = true;
        sketchViewModel.current.create(tool as SketchTool);
      } else {
        mapElement.current.popupDisabled = tool === "streetview";
      }
    },
    [mapElement, mapMode, setMapMode]
  );

  const highlightProperties = async (
    geometry: __esri.Geometry
  ): Promise<__esri.Handle> => {
    const propertyLayerView = await getFeatureLayerView(mapElement.current);
    const result = await propertyLayerView.queryFeatures({
      geometry: geometry,
      outSpatialReference: mapElement.current.spatialReference,
    });
    return propertyLayerView.highlight(result.features);
  };

  // Handle SketchViewModel create events
  const handleCreate = useCallback(
    async (event: __esri.SketchViewModelCreateEvent) => {
      if (!event.graphic.geometry) return;
      if (!geodesicBufferOperator.isLoaded())
        await geodesicBufferOperator.load();

      const addBufferGraphic = (geometry: __esri.Geometry) => {
        sketchViewModel.current?.addGraphic(
          new Graphic({
            geometry,
            symbol: {
              type: "simple-fill",
              style: "none",
              outline: {
                type: "simple-line",
                width: 2,
                style: "dash",
              },
            },
          })
        );
      };

      if (event.state === "start" || event.state === "cancel") {
        graphicsLayer.current?.removeAll();
        if (highlight) {
          highlight.current?.remove();
          highlight.current = undefined;
        }
      }
      if (event.state === "complete") {
        sketchViewModel.current?.removeAllGraphics();

        if (bufferDistanceRef.current > 0) {
          const buffer = geodesicBufferOperator.execute(
            event.graphic.geometry,
            bufferDistanceRef.current,
            { unit: "feet" }
          ) as __esri.Geometry;
          setGeometry(buffer);
          addBufferGraphic(buffer);
        } else {
          setGeometry(event.graphic.geometry);
        }
        setTimeout(() => {
          highlight.current?.remove();
          highlight.current = undefined;
        }, 100);
      }
      let highlightGeometry: __esri.Geometry = event.graphic.geometry;
      if (event.state === "active") {
        sketchViewModel.current?.removeAllGraphics();
        if (bufferDistanceRef.current > 0) {
          const buffer = geodesicBufferOperator.execute(
            event.graphic.geometry,
            bufferDistanceRef.current,
            { unit: "feet" }
          ) as __esri.Geometry;
          highlightGeometry = buffer;
          addBufferGraphic(buffer);
        }
        const newHighlight = await highlightProperties(highlightGeometry);
        highlight.current?.remove();
        highlight.current = newHighlight;
      }
    },
    [setGeometry]
  );

  // Handle buffer distance input
  const handleBufferDistanceInput = (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => {
    const val = parseInt(event.target.value);
    setBufferDistance(val);
  };

  // Clear all graphics and reset
  const handleClear = useCallback(() => {
    cancelSelect();
    setMapMode(null);
    setCondos([]);
    setSelectedCondo(null);
  }, [setCondos, setSelectedCondo, setMapMode]);

  // Close tool
  const handleToolClose = useCallback(() => {
    cancelSelect();
    setMapMode(null);
    onToolClose();
  }, [onToolClose, setMapMode]);

  // -----------------------------
  // Initialize SketchViewModel after view is ready
  // -----------------------------
  useEffect(() => {
    const view = mapElement.current?.view;
    const mapRef = mapElement.current; // local copy for cleanup
    if (!view || !mapRef) return;

    // Add graphics layer
    const layer = new GraphicsLayer();
    mapRef.map?.add(layer);
    graphicsLayer.current = layer;

    const vm = new SketchViewModel({
      view,
      layer,
      creationMode: "continuous",
    });
    sketchViewModel.current = vm;

    // Attach create event
    const handle = vm.on("create", handleCreate);

    return () => {
      handle.remove();
      mapRef.map?.remove(layer);
    };
  }, [mapElement, handleCreate]);

  // Keep bufferDistanceRef in sync
  useEffect(() => {
    bufferDistanceRef.current = bufferDistance;
  }, [bufferDistance]);

  // Close tool when `closed` prop changes
  useEffect(() => {
    if (closed) handleToolClose();
  }, [closed, handleToolClose]);

  return {
    mapMode,
    bufferDistance,
    handleActionClick,
    handleBufferDistanceInput,
    handleClear,
    handleToolClose,
  };
};
