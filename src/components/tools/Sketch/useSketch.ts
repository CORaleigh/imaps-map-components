// hooks/useShell.ts
import { useState, useRef, useEffect, useCallback } from "react";
import MapNotesLayer from "@arcgis/core/layers/MapNotesLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import { useMap } from "../../../context/useMap";
import type { MapMode } from "../../../context/MapContext";
import type Graphic from "@arcgis/core/Graphic";
import type GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import type { CreateEvent } from "@arcgis/core/widgets/Sketch/types";
import type PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import type WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import { updateSketchSymbol, loadSketchSymbols } from "./utils/symbolStore";

export interface UseSketchProps {
  mapMode: MapMode;
  pointSymbol: SimpleMarkerSymbol | undefined;
  polylineSymbol: SimpleLineSymbol;
  polygonSymbol: SimpleFillSymbol;
  textSymbol: TextSymbol;
  selectedGraphicsType: string | undefined;
  selectedGraphicIds: string[];
  handleActionClick: (tool: MapMode) => void;
  handleToolClose: () => void;
  handlePointSymbolChange: (
    symbol:
      | SimpleMarkerSymbol
      | PictureMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => void;
  handlePolylineSymbolChange: (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => void;
  handlePolygonSymbolChange: (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => void;
  handleTextSymbolChange: (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => void;
  clearSketches: () => void;
  handleDeleteSelectedGraphics: () => void;
  selectedWebSymbol: WebStyleSymbol | undefined;
  setSelectedWebSymbol: React.Dispatch<
    React.SetStateAction<WebStyleSymbol | undefined>
  >;
  pointColor: string;
  setPointColor: React.Dispatch<React.SetStateAction<string>>;
  pointSize: number;
  setPointSize: React.Dispatch<React.SetStateAction<number>>;
  pointSymbolInitialized: boolean;
  setPointSymbolInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useSketch = (
  mapElement: React.RefObject<HTMLArcgisMapElement>,
  closed: boolean,
): UseSketchProps => {
  const { mapMode, setMapMode } = useMap();
  const { webMapId } = useMap();

  const mapNotesLayer = useRef<MapNotesLayer>(
    new MapNotesLayer({
      id: "sketch-layer",
      listMode: "hide",
    }),
  );

  const pointSketchVm = useRef<SketchViewModel>(null);
  const lineSketchVm = useRef<SketchViewModel>(null);
  const polygonSketchVm = useRef<SketchViewModel>(null);
  const textSketchVm = useRef<SketchViewModel>(null);
  const [selectedWebSymbol, setSelectedWebSymbol] = useState<
    WebStyleSymbol | undefined
  >(undefined);
  const [pointColor, setPointColor] = useState<string>("#ff0000");
  const [pointSize, setPointSize] = useState<number>(12);
  const [pointSymbol, setPointSymbol] = useState<
    SimpleMarkerSymbol | undefined
  >();
  const [polylineSymbol, setLineSymbol] = useState<SimpleLineSymbol>(
    new SimpleLineSymbol({ color: "#FF0000", width: 2 }),
  );
  const [polygonSymbol, setPolygonSymbol] = useState<SimpleFillSymbol>(
    new SimpleFillSymbol({
      color: [255, 0, 0, 0.5],
      outline: { color: "#FF0000", width: 2 },
    }),
  );
  const [textSymbol, setTextSymbol] = useState<TextSymbol>(
    new TextSymbol({
      color: "#000000",
      text: "",
      font: { size: 12, family: "Arial", weight: "normal" },
      haloSize: 2,
      haloColor: "#FFFFFF",
    }),
  );
  const [pointSymbolInitialized, setPointSymbolInitialized] = useState(false);

  const selectedGraphics = useRef<Graphic[]>([]);
  const [selectedGraphicIds, setSelectedGraphicIds] = useState<string[]>([]);
  const [selectedGraphicsType, setSelectedGraphicsType] = useState<
    string | undefined
  >(undefined);
  const initializedRef = useRef(false);

  const handleToolClose = useCallback(() => {
    setMapMode("identify");
  }, [setMapMode]);

  const handleActionClick = useCallback(
    (tool: MapMode) => {
      if (!mapElement.current) return;

      // Determine new mode
      let newMode: MapMode;

      if (mapMode === tool) {
        // toggle off the same tool → go back to identify
        newMode = "identify";
      } else {
        // activate the selected tool
        newMode = tool;
      }

      setMapMode(newMode);

      // Ensure all sketch VMs exist
      if (
        !pointSketchVm.current ||
        !lineSketchVm.current ||
        !polygonSketchVm.current ||
        !textSketchVm.current
      )
        return;

      // Cancel all current sketches
      pointSketchVm.current.cancel();
      lineSketchVm.current.cancel();
      polygonSketchVm.current.cancel();
      textSketchVm.current.cancel();

      // Start the selected sketch tool if applicable
      switch (tool) {
        case "point":
          pointSketchVm.current.create(tool);
          break;
        case "polyline":
          lineSketchVm.current.create(tool);
          break;
        case "circle":
        case "rectangle":
        case "polygon":
          polygonSketchVm.current.create(tool);
          break;
        case "text":
          textSketchVm.current.create("text");
          break;
        case "select":
          pointSketchVm.current.updateOnGraphicClick = true;
          lineSketchVm.current.updateOnGraphicClick = true;
          polygonSketchVm.current.updateOnGraphicClick = true;
          textSketchVm.current.updateOnGraphicClick = true;
          break;
        default:
          break;
      }
    },
    [mapElement, mapMode, setMapMode],
  );

  const createSketchVm = (layer: GraphicsLayer | null | undefined) => {
    const sketchVm = new SketchViewModel({
      view: mapElement.current.view,
      layer: layer,
      creationMode: "continuous",
      updateOnGraphicClick: false,
      pointSymbol: pointSymbol,
      polylineSymbol: polylineSymbol,
      polygonSymbol: polygonSymbol,
      textSymbol: textSymbol,
    });

    sketchVm.on("create", handleSketchCreate);

    sketchVm.on("update", (event) => {
      if (event.state === "start" || event.state === "active") {
        // mapElement.current.popupDisabled = true;

        for (const g of event.graphics) {
          if (!selectedGraphics.current.includes(g)) {
            selectedGraphics.current.push(g);
            setSelectedGraphicIds((ids: string[]) => [
              ...ids,
              g.getAttribute("id"),
            ]);
          }
        }
        const graphic = event.graphics.at(0);
        if (
          graphic?.geometry?.type === "point" &&
          graphic?.symbol?.type === "text"
        ) {
          setSelectedGraphicsType("text");
        } else {
          setSelectedGraphicsType(graphic?.geometry?.type);
        }
      }
      if (event.state === "complete") {
        selectedGraphics.current = [];
        setSelectedGraphicIds([]);
        setSelectedGraphicsType(undefined);
      }
    });
    sketchVm.on("delete", (event) => {
      sketchVm.removeGraphics(event.graphics);

      selectedGraphics.current = [];
      setSelectedGraphicIds([]);
    });

    return sketchVm;
  };

  const handleSketchCreate = (event: CreateEvent) => {
    //   mapElement.current.popupDisabled = true;
    // }
    if (event.state === "complete") {
      event.graphic?.setAttribute("id", crypto.randomUUID());
      switch (event.graphic?.geometry?.type) {
        case "point":
          if (mapMode === "point") {
            mapNotesLayer.current.pointLayer?.add(event.graphic);
          }
          if (mapMode === "text") {
            const clone = event.graphic.symbol?.clone();
            event.graphic.symbol = clone;
            mapNotesLayer.current.textLayer?.add(event.graphic);
          }
          break;
        case "polyline":
          mapNotesLayer.current.polylineLayer?.add(event.graphic);

          break;
        case "polygon":
          mapNotesLayer.current.polygonLayer?.add(event.graphic);

          break;
      }
    }
  };
  const handlePointSymbolChange = (
    symbol:
      | SimpleMarkerSymbol
      | PictureMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => {
    if (!pointSketchVm.current) return;
    pointSketchVm.current.pointSymbol = symbol as SimpleMarkerSymbol;
    setPointSymbol(symbol as SimpleMarkerSymbol);
    selectedGraphics.current.forEach((graphic) => {
      graphic.symbol = symbol.clone();
      symbol.toJSON();
    });
   // updateSketchSymbol(webMapId.current, "point", symbol.toJSON());
  };

  const handlePolylineSymbolChange = (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => {
    if (!lineSketchVm.current) return;
    lineSketchVm.current.polylineSymbol = symbol as SimpleLineSymbol;
    setLineSymbol(symbol as SimpleLineSymbol);
    selectedGraphics.current.forEach((graphic) => {
      graphic.symbol = symbol.clone();
    });
    updateSketchSymbol(webMapId.current, "line", symbol.toJSON());
  };

  const handlePolygonSymbolChange = (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => {
    if (!polygonSketchVm.current) return;
    polygonSketchVm.current.polygonSymbol = symbol as SimpleFillSymbol;
    setPolygonSymbol(symbol as SimpleFillSymbol);
    selectedGraphics.current.forEach((graphic) => {
      graphic.symbol = symbol.clone();
    });
    updateSketchSymbol(webMapId.current, "polygon", symbol.toJSON());
  };

  const handleTextSymbolChange = (
    symbol:
      | SimpleMarkerSymbol
      | SimpleLineSymbol
      | SimpleFillSymbol
      | TextSymbol,
  ) => {
    if (!textSketchVm.current) return;

    // update the sketch tool
    textSketchVm.current.textSymbol = symbol as TextSymbol;
    setTextSymbol(symbol as TextSymbol);

    // update all selected graphics
    selectedGraphics.current.forEach((graphic) => {
      graphic.symbol = new TextSymbol({
        text: (symbol as TextSymbol).text,
        color: (symbol as TextSymbol).color,
        font: (symbol as TextSymbol).font,
        haloColor: (symbol as TextSymbol).haloColor,
        haloSize: (symbol as TextSymbol).haloSize,
        xoffset: (symbol as TextSymbol).xoffset,
        yoffset: (symbol as TextSymbol).yoffset,
      });
    });
    updateSketchSymbol(webMapId.current, "text", symbol.toJSON());
  };

  const clearSketches = () => {
    pointSketchVm.current?.removeAllGraphics();
    polygonSketchVm.current?.removeAllGraphics();
    lineSketchVm.current?.removeAllGraphics();
    textSketchVm.current?.removeAllGraphics();
  };

  const handleDeleteSelectedGraphics = useCallback(() => {
    switch (selectedGraphicsType) {
      case "point":
        pointSketchVm.current?.removeGraphics(selectedGraphics.current);
        (pointSketchVm.current?.layer as GraphicsLayer).removeMany(
          selectedGraphics.current,
        );
        break;
      case "polyline":
        lineSketchVm.current?.removeGraphics(selectedGraphics.current);
        (lineSketchVm.current?.layer as GraphicsLayer).removeMany(
          selectedGraphics.current,
        );
        break;
      case "polygon":
        polygonSketchVm.current?.removeGraphics(selectedGraphics.current);
        (polygonSketchVm.current?.layer as GraphicsLayer).removeMany(
          selectedGraphics.current,
        );
        break;
      case "text":
        textSketchVm.current?.removeGraphics(selectedGraphics.current);
        (textSketchVm.current?.layer as GraphicsLayer).removeMany(
          selectedGraphics.current,
        );
        break;
    }
  }, [selectedGraphicsType]);
  useEffect(() => {
    if (!mapMode || mapMode === "streetview" || mapMode === "identify") {
      pointSketchVm.current?.cancel();
      lineSketchVm.current?.cancel();
      polygonSketchVm.current?.cancel();
      textSketchVm.current?.cancel();
    }
  }, [mapMode]);

  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
    mapElement.current.map?.add(mapNotesLayer.current);
    pointSketchVm.current = createSketchVm(mapNotesLayer.current.pointLayer);
    polygonSketchVm.current = createSketchVm(
      mapNotesLayer.current.polygonLayer,
    );
    lineSketchVm.current = createSketchVm(mapNotesLayer.current.polylineLayer);
    textSketchVm.current = createSketchVm(mapNotesLayer.current.textLayer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapElement]);

  useEffect(() => {
    const stored = loadSketchSymbols(webMapId.current);
    if (!stored) return;

    // if (stored.point) {
    //   const symbol = CIMSymbol.fromJSON(stored.point) as SimpleMarkerSymbol;
    //   setPointSymbol(symbol);

    //   pointSketchVm.current!.pointSymbol = symbol;
    // }

    if (stored.line) {
      const symbol = SimpleLineSymbol.fromJSON(stored.line);
      setLineSymbol(symbol);

      lineSketchVm.current!.polylineSymbol = symbol;
    }

    if (stored.polygon) {
      const symbol = SimpleFillSymbol.fromJSON(stored.polygon);
      setPolygonSymbol(symbol);

      polygonSketchVm.current!.polygonSymbol = symbol;
    }

    if (stored.text) {
      const symbol = TextSymbol.fromJSON(stored.text);
      setTextSymbol(symbol);
      textSketchVm.current!.textSymbol = symbol;
    }
  }, [webMapId]);

  useEffect(() => {
    if (closed) {
      handleToolClose();
    }
  }, [closed, handleToolClose]);

  return {
    mapMode,
    pointSymbol,
    polylineSymbol,
    polygonSymbol,
    textSymbol,
    selectedGraphicIds,
    selectedGraphicsType,
    handleActionClick,
    handleToolClose,
    handlePointSymbolChange,
    handlePolylineSymbolChange,
    handlePolygonSymbolChange,
    handleTextSymbolChange,
    clearSketches,
    handleDeleteSelectedGraphics,
    selectedWebSymbol,
    setSelectedWebSymbol,
    pointColor,
    setPointColor,
    pointSize,
    setPointSize,
    pointSymbolInitialized,
    setPointSymbolInitialized,
  };
};
