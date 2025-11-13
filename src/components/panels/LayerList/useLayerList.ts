import { useEffect, useRef, useState } from "react";
import {
  createItemPanel,
  createLabelToggles,
  propertyLabelExpressions,
  watchLayerList,
} from "./layers";
import { layerService } from "../../../utils/mapLayerService";
import { useMap } from "../../../context/useMap";
import LabelClass from "@arcgis/core/layers/support/LabelClass";

import type { TargetedEvent } from "@arcgis/map-components";
import type ActionToggle from "@arcgis/core/support/actions/ActionToggle";

export interface UseLayerListProps {
  listItemCreatedFunction: __esri.LayerListListItemCreatedHandler;
  handleTriggerAction: (
    event: TargetedEvent<
      HTMLArcgisLayerListElement,
      __esri.LayerListTriggerActionEvent
    >
  ) => void;
  handleResetLayers: () => void;
  loaded: boolean;
}

export const useLayerList = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseLayerListProps => {
  const { webMap } = useMap();
  const initializedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const listItemCreatedFunction = (
    event: __esri.LayerListListItemCreatedHandlerEvent
  ) => {
    const item = event.item;
    if (item.visible && item.parent && item.layer?.type !== "sublayer") {
      item.parent.open = item.parent.visible;
    }
    watchLayerList(item, "");
    createItemPanel(item);
    createLabelToggles(item);
  };

  const handleTriggerAction = (
    event: TargetedEvent<
      HTMLArcgisLayerListElement,
      __esri.LayerListTriggerActionEvent
    >
  ) => {
    const item = event.detail.item;
    if (
      event.detail.action.type !== "toggle" ||
      !item.layer ||
      item.layer.type !== "feature" ||
      item.actionsSections.length === 0
    )
      return;
    const action = event.detail.action;
    const layer = item.layer as __esri.FeatureLayer;
    action.icon = action.value ? "toggle-on" : "toggle-off";
    requestAnimationFrame(() => {
      event.detail.item.actionsOpen = true;
    });
    if (!layer.labelsVisible) {
      layer.labelsVisible = true;
    }

    const selected = item.actionsSections
      .getItemAt(0)
      ?.filter((toggle: ActionToggle | __esri.ActionButton) => {
        if (toggle.type !== "toggle") return false;
        toggle.icon = toggle.value ? "toggle-on" : "toggle-off";
        return toggle.value;
      });

    const selectedTitles = selected?.map((section) => {
      return (section as ActionToggle).title;
    });

    const selectedExpressions = propertyLabelExpressions.filter(
      (expression) => {
        return selectedTitles?.includes(expression.title);
      }
    );
    const expressions = selectedExpressions.map((expression) => {
      return expression.expression;
    });
    const expression = expressions.join("+ TextFormatting.NewLine+");
    layer.labelingInfo = [];

    layer.labelingInfo = [
      new LabelClass({
        symbol: {
          type: "text",
          color: "black",
          haloColor: "white",
          haloSize: 1,
          font: {
            family: "AvenirNext LT Pro Regular",
            style: "normal",
            weight: "bold",
          },
        },
        labelExpressionInfo: {
          expression: expression,
        },
        maxScale: 0,
        minScale: 5000,
      }),
    ];
  };

  const handleResetLayers = () => {
    if (!mapElement.current || !mapElement.current.map) return;
    const map = mapElement.current.map;

    map.allLayers.forEach((layer: __esri.Layer) => {
      if (!map.basemap || !layer.title) return;
      if (
        map.basemap.baseLayers.includes(layer) ||
        map.basemap.referenceLayers.includes(layer)
      )
        return;
      layer.visible = layer.title.includes("Property");
    });
  };
  useEffect(() => {
    if (!mapElement || !webMap || initializedRef.current) return;
    // Initialize basemap logic only once
    initializedRef.current = true;
    layerService.initLayersFromWebMap(webMap);
    layerService.watchLayerChanges();
    setLoaded(true);
  }, [mapElement, webMap]);

  return {
    listItemCreatedFunction,
    handleTriggerAction,
    handleResetLayers,
    loaded,
  };
};
