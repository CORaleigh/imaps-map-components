import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  createItemPanel,
  createLabelToggles,
  propertyLabelExpressions,
  watchLayerList,
} from "./layers";
import { layerService } from "../../../utils/mapLayerService";
import { useMap } from "../../../context/useMap";
import LabelClass from "@arcgis/core/layers/support/LabelClass";

import type ActionToggle from "@arcgis/core/support/actions/ActionToggle";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import WebMap from "@arcgis/core/WebMap";
import type Layer from "@arcgis/core/layers/Layer";
import type ActionButton from "@arcgis/core/support/actions/ActionButton";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type {
  ListItemModifier,
  ListItemModifierEvent,
} from "@arcgis/core/widgets/LayerList/types.js";
import type { LayerListViewModelTriggerActionEvent } from "@arcgis/core/widgets/LayerList/LayerListViewModel";

export interface UseLayerListProps {
  layerListElement: RefObject<HTMLArcgisLayerListElement | null>;
  listItemCreatedFunction: ListItemModifier;
  handleTriggerAction: (
    event: CustomEvent<LayerListViewModelTriggerActionEvent>,
  ) => void;
  handleResetLayers: () => void;
  loaded: boolean;
}

export const useLayerList = (
  mapElement: React.RefObject<HTMLArcgisMapElement>,
): UseLayerListProps => {
  const { webMap, webMapId } = useMap();
  const initializedRef = useRef(false);
  const layerListElement = useRef<HTMLArcgisLayerListElement>(null);
  const webMapRef = useRef<WebMap>(undefined);
  const [loaded, setLoaded] = useState(false);
  const listItemCreatedFunction = useCallback(
    (event: ListItemModifierEvent) => {
      const item = event.item;

      if (item.visible && item.parent && item.layer?.type !== "sublayer") {
        item.parent.open = item.parent.visible;
      }
      watchLayerList(item, "");
      createItemPanel(item);
      createLabelToggles(item);
    },
    [],
  );
  const handleTriggerAction = useCallback(
    (event: CustomEvent<LayerListViewModelTriggerActionEvent>) => {
      const item = event.detail.item;
      if (
        event.detail.action.type !== "toggle" ||
        !item.layer ||
        item.layer.type !== "feature" ||
        item.actionsSections.length === 0
      )
        return;
      const action = event.detail.action;
      const layer = item.layer as FeatureLayer;
      action.icon = action.value ? "toggle-on" : "toggle-off";
      requestAnimationFrame(() => {
        event.detail.item.actionsOpen = true;
      });
      if (!layer.labelsVisible) {
        layer.labelsVisible = true;
      }

      const selected = item.actionsSections
        .getItemAt(0)
        ?.filter((toggle: ActionToggle | ActionButton) => {
          if (toggle.type !== "toggle") return false;
          toggle.icon = toggle.value ? "toggle-on" : "toggle-off";
          return toggle.value;
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedTitles = selected?.map((section: any) => {
        return (section as ActionToggle).title;
      });

      const selectedExpressions = propertyLabelExpressions.filter(
        (expression) => {
          return selectedTitles?.includes(expression.title);
        },
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
    },
    [],
  );

  const handleResetLayers = useCallback(() => {
    if (!mapElement.current || !mapElement.current.map) return;
    const map = mapElement.current.map;

    map.allLayers.forEach((layer: Layer) => {
      if (!map.basemap || !layer.title) return;
      if (
        map.basemap.baseLayers.includes(layer) ||
        map.basemap.referenceLayers.includes(layer)
      )
        return;
      layer.visible = layer.title.includes("Property");
    });
  }, [mapElement]);
  useEffect(() => {
    if (!mapElement || !webMap || initializedRef.current) return;

    initializedRef.current = true;
    (async () => {
      // 1. Load fresh template and addAllMissing in parallel
      const [freshWebMap] = await Promise.all([
        (async () => {
          const webmap = new WebMap({ portalItem: { id: webMapId.current } });
          await webmap.load();
          return webmap;
        })(),
        layerService.addAllMissingSiblingsAfterLayerList(),
      ]);
      setTimeout(() => {
        const filter = layerListElement.current?.shadowRoot
          ?.querySelector("calcite-list")
          ?.shadowRoot?.querySelector("calcite-filter")
          ?.shadowRoot?.querySelector("calcite-input")
          ?.shadowRoot?.querySelector("input");
        if (filter) {
          filter.style.fontSize = "16px";
        }
      }, 500);
      webMapRef.current = freshWebMap;

      // 2. Batch reorder operations
      const reorderOperations: Array<{
        parent: GroupLayer;
        layer: Layer;
        targetIndex: number;
      }> = [];

      mapElement.current.map?.allLayers.forEach((layer) => {
        if (layer.type !== "group" && layer.parent instanceof GroupLayer) {
          const currentIdx = layer.parent.layers.findIndex(
            (l) => l.title === layer.title,
          );

          const webLayer = webMapRef.current?.allLayers.find(
            (l) => l.title === layer.title && l.type === layer.type,
          );

          if (webLayer && webLayer.parent instanceof GroupLayer) {
            const sourceIdx = webLayer.parent.layers.findIndex(
              (l) => l.title === webLayer.title,
            );

            if (currentIdx !== sourceIdx) {
              reorderOperations.push({
                parent: layer.parent,
                layer: layer,
                targetIndex: sourceIdx,
              });
            }
          }
        }
      });

      // 3. Execute reorders sorted by target index (bottom-up)
      reorderOperations
        .sort((a, b) => b.targetIndex - a.targetIndex)
        .forEach(({ parent, layer, targetIndex }) => {
          parent.reorder(layer, targetIndex);
        });

      layerService.watchLayerChanges();
      setLoaded(true);
    })();
  }, [mapElement, webMap, webMapId]);

  return {
    layerListElement,
    listItemCreatedFunction,
    handleTriggerAction,
    handleResetLayers,
    loaded,
  };
};
