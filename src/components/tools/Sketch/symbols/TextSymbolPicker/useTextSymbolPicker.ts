// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import Color from "@arcgis/core/Color";
import type { TargetedEvent } from "@arcgis/map-components";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type TextSymbol from "@arcgis/core/symbols/TextSymbol";

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

      (symbol as SimpleFillSymbol | SimpleMarkerSymbol).color =
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
