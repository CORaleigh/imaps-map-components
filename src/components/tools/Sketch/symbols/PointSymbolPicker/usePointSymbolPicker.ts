// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import type { TargetedEvent } from "@arcgis/map-components";

import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type TextSymbol from "@arcgis/core/symbols/TextSymbol";

export interface UsePointSymbolPicker {
  size: number;

  handleSizeInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
}

export const usePointSymbolPicker = (
  symbol:
    | SimpleFillSymbol
    | SimpleLineSymbol
    | SimpleMarkerSymbol
    | TextSymbol,
  onSymbolChange: (
    symbol:
      | SimpleFillSymbol
      | SimpleLineSymbol
      | SimpleMarkerSymbol
      | TextSymbol
  ) => void
): UsePointSymbolPicker => {
  const [size, setSize] = useState(12);

  const handleSizeInput = useCallback(
    (event: TargetedEvent<HTMLCalciteInputNumberElement, void>) => {
      if (symbol.type === "simple-marker" && symbol.size) {
        symbol.size = event.target.value;
        onSymbolChange(symbol);
      }
    },
    [onSymbolChange, symbol]
  );

  useEffect(() => {
    if (symbol && symbol.type === "simple-marker" && symbol.size) {
      setSize(symbol.size);
    }
  }, [symbol]);

  return {
    size,
    handleSizeInput,
  };
};
