import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import "@arcgis/map-components/components/arcgis-distance-measurement-2d";
import "@arcgis/map-components/components/arcgis-area-measurement-2d";

import { useMeasure } from "./useMeasure";

interface MeasureProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  closed: boolean;
  onToolClose: () => void;
}

const Measure: React.FC<MeasureProps> = ({ mapElement, closed, onToolClose }) => {
  const { areaMeasure, distanceMeasure, activeTool, handleActionClick } =
    useMeasure(mapElement);

  return (
    <calcite-panel
      heading="Measure"
      closable
      oncalcitePanelClose={() => onToolClose()}
      closed={closed}
      collapsible
    >
      <calcite-action-bar layout="horizontal" expandDisabled>
        <calcite-action
          text="Distance"
          icon="measure-line"
          textEnabled
          active={activeTool === "distance"}
          onClick={() => handleActionClick("distance")}
        ></calcite-action>
        <calcite-action
          text="Area"
          icon="measure-area"
          textEnabled
          active={activeTool === "area"}
          onClick={() => handleActionClick("area")}
        ></calcite-action>
        <calcite-action
          text="Clear"
          icon="trash"
          textEnabled
          onClick={() => handleActionClick(null)}
        ></calcite-action>
      </calcite-action-bar>
      <arcgis-distance-measurement-2d
        ref={distanceMeasure}
        referenceElement={mapElement.current}
        style={{ display: activeTool === "distance" ? "block" : "none" }}
      ></arcgis-distance-measurement-2d>

      <arcgis-area-measurement-2d
        ref={areaMeasure}
        referenceElement={mapElement.current}
        style={{ display: activeTool === "area" ? "block" : "none" }}
      ></arcgis-area-measurement-2d>
    </calcite-panel>
  );
};

export default Measure;
