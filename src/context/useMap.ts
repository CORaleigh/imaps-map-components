import { useContext } from "react";
import MapContext, { type MapContextType } from "./MapContext";

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};