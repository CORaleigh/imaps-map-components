import type TextSymbol from "@arcgis/core/symbols/TextSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

export type SketchSymbolStore = {
  text?: TextSymbol["toJSON"];
  point?: SimpleMarkerSymbol["toJSON"];
  line?: SimpleLineSymbol["toJSON"];
  polygon?: SimpleFillSymbol["toJSON"];
};

const getKey = (webMapId: string) =>
  `imaps_${webMapId}_sketch_symbols`;


export const loadSketchSymbols = (
  webMapId: string
): SketchSymbolStore => {
  const raw = localStorage.getItem(getKey(webMapId));

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveSketchSymbols = (
  webMapId: string,
  data: SketchSymbolStore
) => {
  localStorage.setItem(getKey(webMapId), JSON.stringify(data));
};

export const updateSketchSymbol = <
  K extends keyof SketchSymbolStore
>(
  webMapId: string,
  type: K,
  symbol: SketchSymbolStore[K]
) => {
  const existing = loadSketchSymbols(webMapId);

  const updated: SketchSymbolStore = {
    ...existing,
    [type]: symbol,
  };

  saveSketchSymbols(webMapId, updated);
};
