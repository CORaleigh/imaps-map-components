import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import { usePointSymbolPicker } from "./usePointSymbolPicker";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type TextSymbol from "@arcgis/core/symbols/TextSymbol";

interface PointSymbolPickerProps {
  symbol:
    | SimpleFillSymbol
    | SimpleLineSymbol
    | SimpleMarkerSymbol
    | TextSymbol;
  onSymbolChange: (
    symbol:
      | SimpleFillSymbol
      | SimpleLineSymbol
      | SimpleMarkerSymbol
      | TextSymbol
  ) => void;
}

const PointSymbolPicker: React.FC<PointSymbolPickerProps> = ({
  symbol,
  onSymbolChange,
}) => {
  const { size, handleSizeInput } = usePointSymbolPicker(
    symbol,
    onSymbolChange
  );
  return (
    <>
      <calcite-label>
        Size
        <calcite-input-number
          value={size.toString()}
          min={6}
          max={100}
          oncalciteInputNumberInput={handleSizeInput}
          suffixText="px"
        ></calcite-input-number>
      </calcite-label>
    </>
  );
};

export default PointSymbolPicker;
