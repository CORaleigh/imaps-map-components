// hooks/useShell.ts
import { useRef, useEffect, useState } from "react";
import type { TargetedEvent } from "@arcgis/map-components";
import LocatorSearchSource from "@arcgis/core/widgets/Search/LocatorSearchSource.js";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import LayerSearchSource from "@arcgis/core/widgets/Search/LayerSearchSource";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

export interface UseLocationSearchProps {
  showIntersection: boolean;
  intersectingStreets: __esri.Graphic[];
  handleSearchReady: (
    event: TargetedEvent<HTMLArcgisSearchElement, void>
  ) => void;
  handleSelectResult: (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSelectResultEvent
    >
  ) => void;
  handleSearchClear: (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSearchClearEvent
    >
  ) => void;
  handleIntersectingStreetChange: (
    event: TargetedEvent<HTMLCalciteComboboxElement, void>
  ) => void;
}

export const useLocationSearch = (
  mapElement: React.RefObject<HTMLArcgisMapElement>,
  closed: boolean
): UseLocationSearchProps => {
  const initializedRef = useRef(false);
  const [showIntersection, setShowIntersection] = useState<boolean>(false);
  const [intersectingStreets, setIntersectingStreets] = useState<
    __esri.Graphic[]
  >([]);
  const intersectionLayer = useRef<FeatureLayer>(undefined);
  const selectedStreet = useRef<__esri.Graphic>(undefined);
  const graphicsLayer = useRef<GraphicsLayer>(undefined);

  const marker: PictureMarkerSymbol = new PictureMarkerSymbol({
    url: "pin.svg",
    height: 20,
    width: 20,
  });
  const addGeocodingSource = async (searchElement: HTMLArcgisSearchElement) => {
    const config = await fetch("config.json");
    const data = await config.json();
    if (data.printUrl) {
      const geocodeUrl = data.geocodeUrl;
      searchElement.sources.add(
        new LocatorSearchSource({
          name: "Street Address",
          placeholder: "Enter an address",
          url: geocodeUrl,
          autoNavigate: true,
          resultSymbol: marker,
        })
      );
    }
  };

  const addIntersectionSource = async (
    searchElement: HTMLArcgisSearchElement
  ) => {
    const config = await fetch("config.json");
    const data = await config.json();
    if (data.intersectionItem) {
      intersectionLayer.current = new FeatureLayer({
        portalItem: {
          id: data.intersectionItem,
        },
        title: "Intersection",
        layerId: 0,
      });
      await intersectionLayer.current.load();
      const source = new LayerSearchSource({
        name: "Intersection",
        placeholder: "Enter first street name",
        layer: intersectionLayer.current,
        autoNavigate: false,
        resultGraphicEnabled: false,
        popupEnabled: false,
      });
      searchElement.sources.add(source);
    }
  };

  const handleSearchReady = (
    event: TargetedEvent<HTMLArcgisSearchElement, void>
  ) => {
    event.target.sources = event.target.allSources.filter((source) => {
      source.name = source.name.split(":")[0];
      source.resultSymbol = marker;
      return source.name !== "ArcGIS World Geocoding Service";
    });
    event.target.includeDefaultSourcesDisabled = true;
    addGeocodingSource(event.target);
    addIntersectionSource(event.target);
  };

  const handleSelectResult = async (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSelectResultEvent
    >
  ) => {
    const source = event.detail.source.name;
    setShowIntersection(source === "Intersection");
    if (!intersectionLayer.current) return;
    if (source === "Intersection") {
      selectedStreet.current = event.detail.result.feature;
      const result = await intersectionLayer.current.queryFeatures({
        where: `CARTONAME <> '${event.detail.result.feature.getAttribute(
          "CARTONAME"
        )}'`,
        geometry: event.detail.result.feature.geometry,
        outFields: ["CARTONAME"],
        returnGeometry: true,
        orderByFields: ["CARTONAME"],
      });
      setIntersectingStreets(() => [...result.features]);
    }
  };

  const handleIntersectingStreetChange = (
    event: TargetedEvent<HTMLCalciteComboboxElement, void>
  ) => {
    if (
      !selectedStreet.current?.geometry ||
      event.target.selectedItems.length === 0
    )
      return;

    const intersection = intersectionOperator.executeMany(
      [event.target.selectedItems.at(0).value.geometry],
      selectedStreet.current.geometry
    );
    if (intersection.length) {
      mapElement.current.goTo(intersection.at(0));
      graphicsLayer.current?.removeAll();
      graphicsLayer.current?.add(
        new Graphic({ geometry: intersection.at(0), symbol: marker })
      );
    }
  };

  const handleSearchClear = (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSearchClearEvent
    >
  ) => {
    console.log(event.detail);
    setShowIntersection(false);
    selectedStreet.current = undefined;
    graphicsLayer.current?.removeAll();
  };
  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
    graphicsLayer.current = new GraphicsLayer({
      id: "location-graphics",
      listMode: "hide",
    });
    mapElement.current.map?.add(graphicsLayer.current);
  }, [mapElement]);

  useEffect(() => {
    if (closed) {
      graphicsLayer.current?.removeAll();
    }
  }, [closed]);

  return {
    showIntersection,
    intersectingStreets,
    handleSearchReady,
    handleSelectResult,
    handleSearchClear,
    handleIntersectingStreetChange,
  };
};
