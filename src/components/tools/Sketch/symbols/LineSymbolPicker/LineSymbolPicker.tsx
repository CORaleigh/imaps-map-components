import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import { useLineSymbolPicker } from "./useLineSymbolPicker";

interface LineSymbolPickerProps {
  symbol:
    | __esri.SimpleFillSymbol
    | __esri.SimpleLineSymbol
    | __esri.SimpleMarkerSymbol;
  onSymbolChange: (
    symbol:
      | __esri.SimpleFillSymbol
      | __esri.SimpleLineSymbol
      | __esri.SimpleMarkerSymbol
  ) => void;
}

const LineSymbolPicker: React.FC<LineSymbolPickerProps> = ({
  symbol,
  onSymbolChange,
}) => {
  const {
    lineColor,
    lineWidth,
    lineTransparency,
    handleLineColorChange,
    handleLineSliderInput,
    handleLineWidthInput,
    handleLineTransparencySliderInput,
    handleLineTransparencyInput,
  } = useLineSymbolPicker(symbol, onSymbolChange);
  return (
    <>
      <calcite-label>
        {symbol.type === "simple-line" ? "Color" : "Outline Color"}
        <calcite-button
          width="half"
          iconEnd="pencil"
          appearance="outline"
          kind="neutral"
          style={{ width: "130px" }}
          id="line-color"
        >
          <calcite-color-picker-swatch
            color={lineColor}
            style={{ width: "82px", opacity: (100 - lineTransparency) / 100 }}
          ></calcite-color-picker-swatch>
        </calcite-button>
      </calcite-label>
      <calcite-label>
        {symbol.type === "simple-line" ? "Width" : "Outline Width"}
        <div style={{ display: "flex" }}>
          <calcite-slider
            style={{ width: "90%" }}
            value={lineWidth}
            min={0.1}
            max={18}
            step={1}
            oncalciteSliderInput={handleLineSliderInput}
          ></calcite-slider>
          <calcite-input-number
            value={lineWidth.toString()}
            min={0.1}
            max={18}
            oncalciteInputNumberInput={handleLineWidthInput}
            suffixText="px"
          ></calcite-input-number>
        </div>
      </calcite-label>
      <calcite-label>
        {symbol.type === "simple-line"
          ? "Transparency"
          : "Outline Transparency"}

        <div style={{ display: "flex" }}>
          <calcite-slider
            style={{ width: "90%" }}
            value={lineTransparency}
            min={0}
            max={100}
            step={1}
            oncalciteSliderInput={handleLineTransparencySliderInput}
          ></calcite-slider>
          <calcite-input-number
            value={lineTransparency.toString()}
            min={0}
            max={100}
            oncalciteInputNumberInput={handleLineTransparencyInput}
            suffixText="%"
          ></calcite-input-number>
        </div>
      </calcite-label>
      <calcite-popover
        label={"Line Color"}
        referenceElement={"line-color"}
        pointerDisabled
        overlayPositioning="fixed"
        heading="Line Color"
        closable
      >
        <calcite-color-picker
          oncalciteColorPickerChange={handleLineColorChange}
          value={lineColor}
        ></calcite-color-picker>
      </calcite-popover>
    </>
  );
};

export default LineSymbolPicker;
