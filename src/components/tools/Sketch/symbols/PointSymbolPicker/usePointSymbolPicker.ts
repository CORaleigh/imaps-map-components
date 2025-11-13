// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import type { TargetedEvent } from "@arcgis/map-components";

export interface UsePointSymbolPicker {
  size: number;

  handleSizeInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
}

export const usePointSymbolPicker = (
  symbol:
    | __esri.SimpleFillSymbol
    | __esri.SimpleLineSymbol
    | __esri.SimpleMarkerSymbol
    | __esri.TextSymbol,
  onSymbolChange: (
    symbol:
      | __esri.SimpleFillSymbol
      | __esri.SimpleLineSymbol
      | __esri.SimpleMarkerSymbol
      | __esri.TextSymbol
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
