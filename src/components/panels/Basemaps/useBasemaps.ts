import PortalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource.js";
import { useEffect, useRef } from "react";

export interface UseBasemapsProps {
  mapsSource: PortalBasemapsSource;
  imageSource: PortalBasemapsSource;
}

export const useBasemaps = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseBasemapsProps => {
    
  const initializedRef = useRef(false);
  

  const mapsSource = new PortalBasemapsSource({
    portal: {
      url: "https://ral.maps.arcgis.com",
    },
    query: "id: f6329364e80c438a958ce74aadc3a89f",
  });
  const imageSource = new PortalBasemapsSource({
    portal: {
      url: "https://ral.maps.arcgis.com",
    },
    query: "id: 492386759d264d49948bf7f83957ddb9",
  });
  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    // Initialize basemap logic only once
    initializedRef.current = true;
  }, [mapElement]);

  return {
    mapsSource,
    imageSource,
  };
};
