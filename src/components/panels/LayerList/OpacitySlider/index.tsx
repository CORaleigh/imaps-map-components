import React from "react";
import "@esri/calcite-components/components/calcite-slider";
import type { TargetedEvent } from "@arcgis/map-components";
interface Props {
  layer: __esri.Layer;
  value: number;
}
export const OpacitySlider: React.FC<Props> = ({ layer, value }) => {
  return (
    <calcite-label scale="s">
      Transparency
    <calcite-slider
      value={value}
      max={1}
      min={0}
      step={0.05}
      oncalciteSliderInput={(
        event: TargetedEvent<HTMLCalciteSliderElement, void>
      ) => {
        layer.opacity = event.target.value as number;
      }}
      maxLabel="100%"
      minLabel="0%"
    ></calcite-slider>
    </calcite-label>
  );
};
export default OpacitySlider;
