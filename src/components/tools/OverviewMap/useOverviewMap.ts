// hooks/useShell.ts
import { useRef, useEffect, type RefObject } from "react";
import Graphic from "@arcgis/core/Graphic";
import type { TargetedEvent } from "@arcgis/map-components";
export type ToolType = "distance" | "area" | null;
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import type Extent from "@arcgis/core/geometry/Extent";

export interface UseOverviewMapProps {
  overviewMapElement: RefObject<HTMLArcgisMapElement | null>;
  handleOverviewReady: (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => void;
}

const addGraphic = (
  overviewMap: HTMLArcgisMapElement,
  mapExtent: Extent
) => {
  
  overviewMap.graphics.removeAll();
  overviewMap.graphics.add(
    new Graphic({
      geometry: mapExtent,
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0.25], // fully transparent fill
        outline: {
          type: "simple-line",
          color: [0, 0, 0, 0.5], // same blue as iOS highlight feel
          width: 2,
        },
      },
    })
  );
};

export const useOverviewMap = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseOverviewMapProps => {
  const overviewMapElement = useRef<HTMLArcgisMapElement | null>(null);
  const initializedRef = useRef(false);
  const handleOverviewReady =  async (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => {
    event.target.basemap = mapElement.current.basemap;
    await event.target.goTo(mapElement.current.extent.clone().expand(4));
    addGraphic(event.target, mapElement.current.extent);

    reactiveUtils.watch(
      () => mapElement.current.view.extent,
      async (mapExtent: Extent) => {
        if (!overviewMapElement.current) return;
        await overviewMapElement.current.goTo(mapExtent.clone().expand(4));
        addGraphic(overviewMapElement.current, mapExtent);
      }
    );
  };
  useEffect(() => {
    if (
      !mapElement.current ||
      !overviewMapElement.current ||
      initializedRef.current
    )
      return;
    initializedRef.current = true;
  }, [mapElement]);

  return {
    overviewMapElement,
    handleOverviewReady,
  };
};
