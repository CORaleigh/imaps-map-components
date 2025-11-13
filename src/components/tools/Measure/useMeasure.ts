// hooks/useShell.ts
import { useState, useCallback, useRef, useEffect } from "react";

export type ToolType = "distance" | "area" | null;

export interface UseMeasureProps {
  areaMeasure: React.RefObject<HTMLArcgisAreaMeasurement2dElement>;
  distanceMeasure: React.RefObject<HTMLArcgisDistanceMeasurement2dElement>;
  activeTool: ToolType;
  handleActionClick: (panel: ToolType) => void;
}

export const useMeasure = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseMeasureProps => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const areaMeasure = useRef<HTMLArcgisAreaMeasurement2dElement>(null!);
  const distanceMeasure = useRef<HTMLArcgisDistanceMeasurement2dElement>(null!);

  const handleActionClick = useCallback(
    (tool: ToolType) => {
      setActiveTool(tool === activeTool ? null : tool);
      if (!areaMeasure.current || !distanceMeasure.current) return;
      if (tool === "area") {
        areaMeasure.current.start();
      }
      if (tool === "distance") {
        distanceMeasure.current.start();
      }
      if (!tool) {
        areaMeasure.current.clear();
        distanceMeasure.current.clear();
      }
    },
    [activeTool]
  );

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
  }, [mapElement]);

  return {
    areaMeasure,
    distanceMeasure,
    activeTool,
    handleActionClick,
  };
};
