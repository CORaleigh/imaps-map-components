// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import Color from "@arcgis/core/Color";
import type { TargetedEvent } from "@arcgis/map-components";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export interface UseLineSymbolPicker {
  lineColor: string;
  lineWidth: number;
  lineTransparency: number;
  handleLineColorChange: (
    event: TargetedEvent<HTMLCalciteColorPickerElement, void>
  ) => void;
  handleLineSliderInput: (
    event: TargetedEvent<HTMLCalciteSliderElement, void>
  ) => void;
  handleLineWidthInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
  handleLineTransparencySliderInput: (
    event: TargetedEvent<HTMLCalciteSliderElement, void>
  ) => void;
  handleLineTransparencyInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
}

export const useLineSymbolPicker = (
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
): UseLineSymbolPicker => {
  const [lineColor, setLineColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(2);
  const [lineTransparency, setLineTransparency] = useState(0);

  const handleLineColorChange = useCallback(
    (event: TargetedEvent<HTMLCalciteColorPickerElement, void>) => {
      if (!event.target.value) return;
      const hexColor = event.target.value.toString();
      setLineColor(hexColor);
      const color = new Color(hexColor);
      color.a = (100 - lineTransparency) / 100;

      if (symbol.type === "simple-line") {
        symbol.color = color;
      }

      if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
        if (
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline !== null
        ) {
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline!.color =
            color;
        }
      }
      onSymbolChange(symbol);
    },
    [lineTransparency, onSymbolChange, symbol]
  );

  const handleLineSliderInput = (
    event: TargetedEvent<HTMLCalciteSliderElement, void>
  ) => {
    if (!event.target.value) return;
    const width = parseFloat(event.target.value.toString());
    setLineWidth(width);

    if (symbol.type === "simple-line") {
      symbol.width = width;
    }

    if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
      if ((symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline !== null) {
        symbol.outline!.width = width;
      }
    }
    onSymbolChange(symbol);
  };

  const handleLineWidthInput = (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => {
    if (!event.target.value) return;
    const width = parseFloat(event.target.value.toString());
    setLineWidth(width);

    if (!event.target.value) return;
    setLineWidth(parseFloat(event.target.value.toString()));

    if (symbol.type === "simple-line") {
      symbol.width = width;
    }

    if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
      if ((symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline !== null) {
        symbol.outline!.width = width;
      }
    }
    onSymbolChange(symbol);
  };

  const handleLineTransparencySliderInput = useCallback(
    (event: TargetedEvent<HTMLCalciteSliderElement, void>) => {
      let v = event.target.value;
      if (Array.isArray(v)) v = v[0];

      if (v == null) return;

      setLineTransparency(v);

      const color =
        symbol.type === "simple-line"
          ? symbol.color?.clone()
          : (
              symbol as __esri.SimpleFillSymbol | __esri.SimpleMarkerSymbol
            ).outline?.color?.clone();

      color!.a = (100 - v) / 100;

      if (symbol.type === "simple-line") {
        symbol.color = color;
      }

      if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
        if (
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline !== null
        ) {
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline!.color =
            color;
        }
      }
      onSymbolChange(symbol);
    },
    [onSymbolChange, symbol]
  );

  const handleLineTransparencyInput = useCallback(
    (event: TargetedEvent<HTMLCalciteInputNumberElement, void>) => {
      const v = event.target.value;
      if (v == null) return;

      setLineTransparency(parseInt(v));
      const color =
        symbol.type === "simple-line"
          ? symbol.color?.clone()
          : (
              symbol as __esri.SimpleFillSymbol | __esri.SimpleMarkerSymbol
            ).outline?.color?.clone();

      color!.a = (100 - parseInt(v)) / 100;
      if (symbol.type === "simple-line") {
        symbol.color = color;
      }

      if (symbol.type === "simple-fill" || symbol.type === "simple-marker") {
        if (
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline !== null
        ) {
          (symbol as SimpleFillSymbol | SimpleMarkerSymbol).outline!.color =
            color;
        }
      }
      onSymbolChange(symbol);
    },
    [onSymbolChange, symbol]
  );
  useEffect(() => {
    if (symbol.type === "simple-line" && symbol.color) {
      setLineColor(symbol.color.toHex());
      setLineTransparency(100 - symbol.color.a * 100);
      setLineWidth(symbol.width);
    }
    if (
      symbol.type !== "simple-line" &&
      symbol.outline &&
      symbol.outline.color
    ) {
      setLineColor(symbol.outline.color.toHex());
      setLineTransparency(100 - symbol.outline.color.a * 100);
      setLineWidth(symbol.outline.width);
    }
  }, [symbol]);

  return {
    lineColor,
    lineWidth,
    lineTransparency,
    handleLineColorChange,
    handleLineSliderInput,
    handleLineWidthInput,
    handleLineTransparencySliderInput,
    handleLineTransparencyInput,
  };
};
