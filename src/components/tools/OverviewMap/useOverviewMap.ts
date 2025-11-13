// hooks/useShell.ts
import { useRef, useEffect, type RefObject } from "react";
import Graphic from "@arcgis/core/Graphic";
import type { TargetedEvent } from "@arcgis/map-components";
export type ToolType = "distance" | "area" | null;

export interface UseOverviewMapProps {
  overviewMapElement: RefObject<HTMLArcgisMapElement | null>;
  handleOverviewReady: (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => void;
}

export const useOverviewMap = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseOverviewMapProps => {
  const overviewMapElement = useRef<HTMLArcgisMapElement | null>(null);
  const initializedRef = useRef(false);
  const handleOverviewReady = (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => {
    event.target.basemap = mapElement.current.basemap;
    event.target.goTo(mapElement.current.extent.clone().expand(4));

    mapElement.current.view.watch("extent", (mapExtent: __esri.Extent) => {
      if (!overviewMapElement.current) return;
      overviewMapElement.current.goTo(mapExtent.clone().expand(4));
      overviewMapElement.current.graphics.removeAll();
      overviewMapElement.current.graphics.add(
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
    });
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
