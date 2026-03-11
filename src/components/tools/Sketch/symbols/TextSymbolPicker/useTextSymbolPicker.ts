// hooks/useShell.ts
import { useState, useCallback, useEffect } from "react";

import Color from "@arcgis/core/Color";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type TextSymbol from "@arcgis/core/symbols/TextSymbol";

export interface UseTextSymbolPicker {
  color: string;
  size: number;
  text: string;
  handleColorChange: (
    event: HTMLCalciteColorPickerElement["calciteColorPickerChange"]
  ) => void;

  handleSizeInput: (
    event: HTMLCalciteInputNumberElement["calciteInputNumberChange"]
  ) => void;
  handleTextInput: (
    event: HTMLCalciteTextAreaElement["calciteTextAreaChange"]
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
    (event: HTMLCalciteColorPickerElement["calciteColorPickerChange"]) => {
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
    (event: HTMLCalciteInputNumberElement["calciteInputNumberChange"]) => {
      if (symbol.type === "text" && symbol.font.size) {
        symbol.font.size = event.target.value;
        onSymbolChange(symbol);
      }
    },
    [onSymbolChange, symbol]
  );

  const handleTextInput = useCallback(
    (event: HTMLCalciteTextAreaElement["calciteTextAreaChange"]) => {
  
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
