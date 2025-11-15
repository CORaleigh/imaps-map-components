import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-scrim";
import "@esri/calcite-components/components/calcite-tooltip";

import "@arcgis/map-components/components/arcgis-layer-list";
import { useLayerList } from "./useLayerList";
import React from "react";

interface LayerListProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  onPanelClose: () => void;
  closed: boolean;
  style?: React.CSSProperties;
}

const LayerList: React.FC<LayerListProps> = ({
  mapElement,
  closed,
  onPanelClose,
}) => {
  const {
    listItemCreatedFunction,
    handleTriggerAction,
    handleResetLayers,
    loaded,
  } = useLayerList(mapElement);
  return (
    <>
    <calcite-panel
      heading={loaded ? "layers" : ""}
      closable
      oncalcitePanelClose={() => onPanelClose()}
      closed={closed}
    >
      <calcite-action
        
        text="Reset Layers"
        icon="reset"
        slot="header-actions-end"
        onClick={handleResetLayers}
      ></calcite-action>
      <calcite-tooltip reference-element="reset-layers-action">
        Reset Layers
      </calcite-tooltip>

      {loaded && (
        <arcgis-layer-list
          referenceElement={mapElement.current}
          showFilter
          visibilityAppearance="checkbox"
          listItemCreatedFunction={listItemCreatedFunction}
          onarcgisTriggerAction={handleTriggerAction}
        ></arcgis-layer-list>
      )}
    </calcite-panel>
          {!loaded && <calcite-scrim loading style={{width: "100%", height: "100vh"}}></calcite-scrim>}

    </>
  );
};

export default React.memo(
  LayerList,
  (prev, next) => prev.mapElement === next.mapElement
);
