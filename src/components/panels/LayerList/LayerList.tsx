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
    <calcite-panel
      heading="Layers"
      closable
      oncalcitePanelClose={() => onPanelClose()}
      closed={closed}
    >
      <calcite-action
        id="reset-layers-action"
        text="Reset Layers"
        icon="reset"
        slot="header-actions-end"
        onClick={handleResetLayers}
      ></calcite-action>
      <calcite-tooltip reference-element="reset-layers-action">
        Reset Layers
      </calcite-tooltip>
      {!loaded && <calcite-scrim loading></calcite-scrim>}

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
  );
};

export default React.memo(
  LayerList,
  (prev, next) => prev.mapElement === next.mapElement
);
