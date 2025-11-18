import React from "react";
import "@esri/calcite-components/components/calcite-panel";
import { useSketch } from "./useSketch";
import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-action-group";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-color-picker";
import "@esri/calcite-components/components/calcite-color-picker-swatch";
import "@esri/calcite-components/components/calcite-icon";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-popover";
import "@esri/calcite-components/components/calcite-slider";
import "@esri/calcite-components/components/calcite-input-number";
import "@esri/calcite-components/components/calcite-tooltip";

import "@esri/calcite-components/components/calcite-text-area";
import LineSymbolPicker from "./symbols/LineSymbolPicker";
import FillSymbolPicker from "./symbols/FillSymbolPicker";
import TextSymbolPicker from "./symbols/TextSymbolPicker";
import PointSymbolPicker from "./symbols/PointSymbolPicker";

import styles from "./Sketch.module.css";

interface SketchProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  closed: boolean;
  onToolClose: () => void;
}

const Sketch: React.FC<SketchProps> = ({ mapElement, closed, onToolClose }) => {
  const {
    mapMode,
    pointSymbol,
    polylineSymbol,
    polygonSymbol,
    textSymbol,
    selectedGraphicIds,
    selectedGraphicsType,
    handleActionClick,
    handleToolClose,
    handlePointSymbolChange,
    handlePolylineSymbolChange,
    handlePolygonSymbolChange,
    handleTextSymbolChange,
    clearSketches,
    handleDeleteSelectedGraphics,
  } = useSketch(mapElement, closed);

  return (
    <>
      <div>
        <calcite-panel
          heading="Sketch"
          closable
          oncalcitePanelClose={() => {
            onToolClose();
            handleToolClose();
          }}
          closed={closed}
          collapsible
          style={{ marginRight: "1em" }}
        >
          <div className={styles.panelContent}>
            <calcite-action-bar layout="horizontal" expandDisabled>
              <calcite-action
              id="sketch-point-action"
                text="point"
                icon="pin"
                onClick={() => handleActionClick("point")}
                active={mapMode === "point"}
              ></calcite-action>
              <calcite-action
                id="sketch-line-action"
                text="line"
                icon="line"
                onClick={() => handleActionClick("polyline")}
                active={mapMode === "polyline"}
              ></calcite-action>
              <calcite-action
                id="sketch-polygon-action"
                text="polygon"
                icon="polygon"
                onClick={() => handleActionClick("polygon")}
                active={mapMode === "polygon"}
              ></calcite-action>
              <calcite-action
                id="sketch-rectangle-action"  
                text="rectangle"
                icon="rectangle"
                onClick={() => handleActionClick("rectangle")}
                active={mapMode === "rectangle"}
              ></calcite-action>
              <calcite-action
                id="sketch-circle-action"
                text="circle"
                icon="circle"
                onClick={() => handleActionClick("circle")}
                active={mapMode === "circle"}
              ></calcite-action>
              <calcite-action
                id="sketch-text-action" 
                text="text"
                icon="text"
                onClick={() => handleActionClick("text")}
                active={mapMode === "text"}
              ></calcite-action>
            </calcite-action-bar>
            <calcite-action-bar layout="horizontal" expandDisabled>
              <calcite-action
                id="sketch-select-action"
                text="select"
                icon="select"
                onClick={() => handleActionClick("select")}
                active={mapMode === "select"}
              ></calcite-action>
              <calcite-action
                id="sketch-clear-action"
                text="clear"
                icon="trash"
                onClick={clearSketches}
              ></calcite-action>
            </calcite-action-bar>
          </div>
          {(mapMode === "point" || selectedGraphicsType === "point") && (
            <calcite-block heading="Point Style" label="Point Style" open>
              <PointSymbolPicker
                symbol={pointSymbol}
                onSymbolChange={handlePointSymbolChange}
              ></PointSymbolPicker>
              <FillSymbolPicker
                symbol={pointSymbol!}
                onSymbolChange={handlePointSymbolChange}
              ></FillSymbolPicker>

              <LineSymbolPicker
                symbol={pointSymbol!}
                onSymbolChange={handlePointSymbolChange}
              ></LineSymbolPicker>
            </calcite-block>
          )}
          {(mapMode === "polyline" || selectedGraphicsType === "polyline") && (
            <calcite-block heading="Point Style" label="Point Style" open>
              <LineSymbolPicker
                symbol={polylineSymbol}
                onSymbolChange={handlePolylineSymbolChange}
              ></LineSymbolPicker>
            </calcite-block>
          )}
          {(["polygon", "rectangle", "circle"].includes(mapMode as string) ||
            selectedGraphicsType === "polygon") && (
            <calcite-block heading="Polygon Style" label="Polygon Style" open>
              <FillSymbolPicker
                symbol={polygonSymbol}
                onSymbolChange={handlePolygonSymbolChange}
              />
              <LineSymbolPicker
                symbol={polygonSymbol}
                onSymbolChange={handlePolygonSymbolChange}
              />
            </calcite-block>
          )}
          {(mapMode === "text" || selectedGraphicsType === "text") && (
            <calcite-block heading="Text Style" label="Text Style" open>
              <TextSymbolPicker
                symbol={textSymbol}
                onSymbolChange={handleTextSymbolChange}
              />
            </calcite-block>
          )}
          <div slot="content-bottom">
            {mapMode === "select" && selectedGraphicIds.length > 0 && (
              <calcite-button
                iconStart="trash"
                round
                kind="danger"
                appearance="outline"
                onClick={handleDeleteSelectedGraphics}
              >
                Delete {selectedGraphicIds.length}{" "}
                {selectedGraphicIds.length === 1 ? "Graphic" : "Graphics"}
              </calcite-button>
            )}
          </div>
        </calcite-panel>
      </div>
      <calcite-tooltip
        reference-element="sketch-point-action"
        placement="bottom"
      >
        Point sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-line-action">
        Line sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-polygon-action">
        Polygon sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-rectangle-action">
        Rectangle sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-circle-action">
        Circle sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-text-action">
        Text sketch
      </calcite-tooltip>
      <calcite-tooltip closeOnClick reference-element="sketch-select-action">
        Select sketch
      </calcite-tooltip>      
      <calcite-tooltip closeOnClick reference-element="sketch-clear-action">
        Clear sketch
      </calcite-tooltip>
    </>
  );
};

export default Sketch;
