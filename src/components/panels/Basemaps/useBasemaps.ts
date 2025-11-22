import PortalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource.js";
import type { TargetedEvent } from "@arcgis/map-components";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import * as intersectsOperator from "@arcgis/core/geometry/operators/intersectsOperator.js";
import { raleighBoundary } from "./boundary";
import { useMap } from "../../../context/useMap";

export interface UseBasemapsProps {
  mapsSource: PortalBasemapsSource;
  imageSource: PortalBasemapsSource;
  mapsGallery: RefObject<HTMLArcgisBasemapGalleryElement | null>;
  imagesGallery: RefObject<HTMLArcgisBasemapGalleryElement | null>;
  esriGallery: RefObject<HTMLArcgisBasemapGalleryElement | null>;
  selectedTab: "basemap" | "images" | "esri";
  handleGalleryReady: (
    event: TargetedEvent<HTMLArcgisBasemapGalleryElement, void>
  ) => void;
  handleTabChange: (
    event: TargetedEvent<HTMLCalciteTabNavElement, void>
  ) => void;
}

export const useBasemaps = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UseBasemapsProps => {
  const initializedRef = useRef(false);
  const mapsGallery = useRef<HTMLArcgisBasemapGalleryElement>(null);
  const imagesGallery = useRef<HTMLArcgisBasemapGalleryElement>(null);
  const esriGallery = useRef<HTMLArcgisBasemapGalleryElement>(null);
  const wasInRaleigh = useRef<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"basemap" | "images" | "esri">(
    "basemap"
  );
  const { setAlert } = useMap();

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
    filterFunction: async (item: __esri.Basemap) => {
      await item.load();
      if (item.portalItem?.tags?.includes("countywide")) return true;
      const inRaleigh = intersectsOperator.execute(
        raleighBoundary,
        mapElement.current.extent
      );
      return inRaleigh;
    },
  });

  const handleGalleryReady = async (
    event: TargetedEvent<HTMLArcgisBasemapGalleryElement, void>
  ) => {
    const gallery = event.target;
    await reactiveUtils.whenOnce(() => gallery.source.basemaps.length > 0);

    const selected = gallery.source.basemaps.find(
      (basemap) =>
        basemap.portalItem?.title === mapElement.current.map?.basemap?.title
    );

    if (selected) {
      gallery.activeBasemap = selected;
      if (gallery.source === imageSource) {
        setSelectedTab("images");
        setTimeout(() => sortImageBasemaps(), 1000);
      }
      if (gallery.source === esriGallery.current?.source) {
        setSelectedTab("esri");
      }
    }
  };

  const sortImageBasemaps = () => {
    imagesGallery.current?.source.basemaps.sort((a, b) =>
      (b.portalItem?.title ?? "").localeCompare(a.portalItem?.title ?? "")
    );
  };
  const refreshImageBasemaps = async () => {
    if (imagesGallery.current?.source instanceof PortalBasemapsSource) {
      await imagesGallery.current?.source.refresh();
    }
  };

  const imageBasemapSelected = (
    source: PortalBasemapsSource,
    activeBasemap: __esri.Basemap
  ) => {
    return (
      source.basemaps.find(
        (b) => b.portalItem?.title === activeBasemap.portalItem?.title
      ) !== undefined
    );
  };
  const handleTabChange = async (
    event: TargetedEvent<HTMLCalciteTabNavElement, void>
  ) => {
    if (!imagesGallery.current) return;
    setSelectedTab(
      event.target.selectedTitle.getAttribute("label") as
        | "basemap"
        | "images"
        | "esri"
    );
    if (
      event.target.selectedTitle.getAttribute("label") === "images" &&
      imagesGallery.current.source instanceof PortalBasemapsSource
    ) {
      await refreshImageBasemaps();
      setTimeout(() => sortImageBasemaps(), 1000);
    }
  };

  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    // Initialize basemap logic only once
    initializedRef.current = true;

    reactiveUtils.watch(
      () => mapElement.current.stationary,
      async (stationary) => {
        if (!imagesGallery.current) return;
        if (stationary) {
          const isImageSelected = imageBasemapSelected(
            imagesGallery.current.source as PortalBasemapsSource,
            mapElement.current.basemap as __esri.Basemap
          );
          const inRaleigh = intersectsOperator.execute(
            raleighBoundary,
            mapElement.current.extent
          );

          if (wasInRaleigh.current === inRaleigh) {
            wasInRaleigh.current = inRaleigh;
            return;
          }
          wasInRaleigh.current = inRaleigh;
          await refreshImageBasemaps();
          setTimeout(() => sortImageBasemaps(), 1000);
          const countywide = (
            imagesGallery.current.activeBasemap as __esri.Basemap
          ).portalItem?.tags?.includes("countywide");
          if (!inRaleigh && !countywide && isImageSelected) {
            imagesGallery.current.activeBasemap =
              imagesGallery.current.source.basemaps.at(0);

            setAlert({
              show: true,
              message: `Map extent outside of Raleigh, switching to latest county imagery (${imagesGallery.current.activeBasemap?.portalItem?.title})`,
              id: Date.now(),
              title: "Basemap Not Available",
              autoCloseDuration: "fast",
              autoClose: true,
              kind: "warning",
              icon: "imagery-layer",
            });
          }
        }
      }
    );
    // return () => handle.remove(); // cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapElement]);

  return {
    mapsSource,
    imageSource,
    mapsGallery,
    imagesGallery,
    esriGallery,
    selectedTab,
    handleGalleryReady,
    handleTabChange,
  };
};
