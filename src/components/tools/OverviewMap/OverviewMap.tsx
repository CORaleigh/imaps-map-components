import React from "react";
import "@arcgis/map-components/components/arcgis-map";
import { useOverviewMap } from "./useOverviewMap";

interface OverviewMapProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
}

const OverviewMap: React.FC<OverviewMapProps> = ({ mapElement }) => {
  const { overviewMapElement, handleOverviewReady } =
    useOverviewMap(mapElement);

  return (
    <>
      {mapElement.current && mapElement.current.basemap && (
        <arcgis-map
          id="overview-map"
          ref={overviewMapElement}
          style={{ height: "200px", width: "200px" }}
          onarcgisViewReadyChange={handleOverviewReady}
          basemap={mapElement.current?.basemap}
        ></arcgis-map>
      )}
    </>
  );
};

export default OverviewMap;
