import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import { usePointSymbolPicker } from "./usePointSymbolPicker";

interface PointSymbolPickerProps {
  symbol:
    | __esri.SimpleFillSymbol
    | __esri.SimpleLineSymbol
    | __esri.SimpleMarkerSymbol
    | __esri.TextSymbol;
  onSymbolChange: (
    symbol:
      | __esri.SimpleFillSymbol
      | __esri.SimpleLineSymbol
      | __esri.SimpleMarkerSymbol
      | __esri.TextSymbol
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
