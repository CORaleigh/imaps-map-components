// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import Color from "@arcgis/core/Color";
import type { TargetedEvent } from "@arcgis/map-components";

export interface UseTextSymbolPicker {
  color: string;
  size: number;
  text: string;
  handleColorChange: (
    event: TargetedEvent<HTMLCalciteColorPickerElement, void>
  ) => void;

  handleSizeInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;
  handleTextInput: (
    event: TargetedEvent<HTMLCalciteTextAreaElement, void>
  ) => void;
}

export const useTextSymbolPicker = (
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
): UseTextSymbolPicker => {
  const [color, setColor] = useState("#FF0000");
  const [size, setSize] = useState(12);
  const [text, setText] = useState("");

  const handleColorChange = useCallback(
    (event: TargetedEvent<HTMLCalciteColorPickerElement, void>) => {
      if (!event.target.value) return;
      const hexColor = event.target.value.toString();
      setColor(hexColor);
      const color = new Color(hexColor);

      (symbol as __esri.SimpleFillSymbol | __esri.SimpleMarkerSymbol).color =
        color;
      onSymbolChange(symbol);
    },
    [onSymbolChange, symbol]
  );

  const handleSizeInput = useCallback(
    (event: TargetedEvent<HTMLCalciteInputNumberElement, void>) => {
      if (symbol.type === "text" && symbol.font.size) {
        symbol.font.size = event.target.value;
        onSymbolChange(symbol);
      }
    },
    [onSymbolChange, symbol]
  );

  const handleTextInput = useCallback(
    (event: TargetedEvent<HTMLCalciteTextAreaElement, void>) => {
  
      if (symbol.type === "text") {
        symbol.text = event.target.value;
        onSymbolChange(symbol);
      }
    },
    [onSymbolChange, symbol]
  );

  useEffect(() => {
    if (symbol && symbol.type === "text" && symbol.font.size && symbol.color) {
      setColor(symbol.color.toHex());
      setSize(symbol.font.size);
      setText(symbol.text);
    }
  }, [symbol]);

  return {
    color,
    size,
    text,
    handleColorChange,
    handleSizeInput,
    handleTextInput,
  };
};
