// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import Color from "@arcgis/core/Color";
import type { TargetedEvent } from "@arcgis/map-components";

export interface UseFillSymbolPicker {
  fillColor: string;
  fillTransparency: number;
  handleFillColorChange: (
    event: TargetedEvent<HTMLCalciteColorPickerElement, void>
  ) => void;

  handleFillTransparencySliderInput: (
    event: TargetedEvent<HTMLCalciteSliderElement, void>
  ) => void;
  handleFillTransparencyInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
}

export const useFillSymbolPicker = (
  symbol:
    | __esri.SimpleFillSymbol
    | __esri.SimpleLineSymbol
    | __esri.SimpleMarkerSymbol,
  onSymbolChange: (
    symbol:
      | __esri.SimpleFillSymbol
      | __esri.SimpleLineSymbol
      | __esri.SimpleMarkerSymbol
  ) => void
): UseFillSymbolPicker => {
  const [fillColor, setFillColor] = useState("#FF0000");
  const [fillTransparency, setFillTransparency] = useState(50);

  const handleFillColorChange = useCallback(
    (event: TargetedEvent<HTMLCalciteColorPickerElement, void>) => {
      if (!event.target.value) return;
      const hexColor = event.target.value.toString();
      setFillColor(hexColor);
      const color = new Color(hexColor);
      color.a = (100 - fillTransparency) / 100;

      (symbol as __esri.SimpleFillSymbol | __esri.SimpleMarkerSymbol).color =
        color;
      onSymbolChange(symbol);
    },
    [fillTransparency, onSymbolChange, symbol]
  );

  const handleFillTransparencySliderInput = useCallback(
    (event: TargetedEvent<HTMLCalciteSliderElement, void>) => {
      let v = event.target.value;
      if (Array.isArray(v)) v = v[0];

      if (v == null) return;

      setFillTransparency(v);
      const color = symbol.color?.clone();
      color!.a = (100 - v) / 100;

      symbol.color = color;
      onSymbolChange(symbol);
    },
    [onSymbolChange, symbol]
  );

  const handleFillTransparencyInput = useCallback(
    (event: TargetedEvent<HTMLCalciteInputNumberElement, void>) => {
      const v = event.target.value;
      if (v == null) return;

      setFillTransparency(parseInt(v));
      const color = symbol.color?.clone();
      color!.a = (100 - parseInt(v)) / 100;

      symbol.color = color!;
      onSymbolChange(symbol);
    },
    [onSymbolChange, symbol]
  );

  useEffect(() => {
    if (symbol && symbol.color) {
      setFillColor(symbol.color.toHex());
      setFillTransparency(100 - (symbol.color.a * 100));
    }
  }, [symbol]);

  return {
    fillColor,
    fillTransparency,
    handleFillColorChange,
    handleFillTransparencySliderInput,
    handleFillTransparencyInput,
  };
};
