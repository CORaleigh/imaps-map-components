/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TargetedEvent } from "@arcgis/map-components";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkPin,
  clearAddressPoints,
  getProperty,
  getSearchSources,
  searchForCondosFromSearch,
  searchRelatedCondos,
  wildcardSearch,
} from "./search";
import { createTableLayer, getTableTemplate } from "./table";
import { useMap } from "../../../context/useMap";
import { createTemplate, getPhotos } from "./popupTemplate/popupTemplate";
import Collection from "@arcgis/core/core/Collection";
import TableTemplate from "@arcgis/core/widgets/FeatureTable/support/TableTemplate";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { useSearchParams } from "react-router-dom";
import { executeArcade } from "./popupTemplate/popupContent";
import { arcadeExpressionInfos } from "./popupTemplate/arcadeExpressions";
import { getTableByTitle } from "../../../utils/layerHelper";

export interface UsePropertySearchProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  tableElement: React.RefObject<HTMLArcgisFeatureTableElement>;
  addressTableElement: React.RefObject<HTMLArcgisFeatureTableElement>;
  searchElement: React.RefObject<HTMLArcgisSearchElement>;
  siteAddress: string;
  selectedTab: "list" | "info";
  selectedCondo: __esri.Graphic | null;
  condos: __esri.Graphic[];
  webMapId: React.RefObject<string>;
  handleSearchReady: (
    event: TargetedEvent<HTMLArcgisSearchElement, void>
  ) => void;
  handleTableReady: (
    event: TargetedEvent<HTMLArcgisFeatureTableElement, void>
  ) => void;
  handleSearchComplete: (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSearchCompleteEvent
    >
  ) => void;
  handleTableCellClick: (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      __esri.FeatureTableCellClickEvent
    >
  ) => void;
  handleTabChange: (
    event: TargetedEvent<HTMLCalciteTabNavElement, void>
  ) => void;
  handleAddressTableReady: (
    event: TargetedEvent<HTMLArcgisFeatureTableElement, void>
  ) => void;
  handleAddressTableChange: (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      {
        name:
          | "state"
          | "size"
          | "layerView"
          | "effectiveSize"
          | "isQueryingOrSyncing";
      }
    >
  ) => void;
  handleAddressCellClick: (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      __esri.FeatureTableCellClickEvent
    >
  ) => void;
  handleClearClick: () => void;
  handleHistoryClick: (
    event: React.MouseEvent<HTMLCalciteListItemElement>
  ) => void;
  handleExport: () => void;
  handleExportAddresses: () => void;
  handleSuggestStart: (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSuggestStartEvent
    >
  ) => void;
  handleNextPropertySelected: (feature: __esri.Graphic) => void;
  handleTabClick: () => void;
}
export const usePropertySearch = (
  mapElement: React.RefObject<HTMLArcgisMapElement>
): UsePropertySearchProps => {
  const [searchParams] = useSearchParams();

  const initializedRef = useRef(false);
  const tableElement = useRef<HTMLArcgisFeatureTableElement>(null!);
  const addressTableElement = useRef<HTMLArcgisFeatureTableElement>(null!);
  const searchElement = useRef<HTMLArcgisSearchElement>(null!);
  const tableLayerRef = useRef<__esri.FeatureLayer>(undefined);
  const {
    condos,
    setCondos,
    selectedCondo,
    setSelectedCondo,
    geometry,
    webMapId,
    setGeometry,
    setSearchReady
  } = useMap();

  const [siteAddress, setSiteAddress] = useState<string>("");

  const [selectedTab, setSelectedTab] = useState<"list" | "info">("list");
  const handleSearchReady = async (
    event: TargetedEvent<HTMLArcgisSearchElement, void>
  ) => {
    if (!mapElement.current) return;
    await mapElement.current.view.when();
    console.log("Search ready");

    const sources = await getSearchSources(mapElement.current, event.target);
    if (!sources) return;
    event.target.sources = sources;
    if (searchParams.get("pin")) {
      //event.target.search(searchParams.get("pin")!);
    } else if (searchParams.get("search")) {
      event.target.search(searchParams.get("search")!);
    }

    setTimeout(() => {
      const input = searchElement.current.shadowRoot
        ?.querySelector("calcite-autocomplete")
        ?.shadowRoot?.querySelector("calcite-input")
        ?.shadowRoot?.querySelector("input");
      if (input) {
        input.style.fontSize = "16px";
        searchElement.current.allPlaceholder = "Address, owner, PIN or REID";
      }
    }, 500);
  };

  const handleTableReady = useCallback(
    async (event: TargetedEvent<HTMLArcgisFeatureTableElement, void>) => {
      const layer = await createTableLayer(mapElement.current);
      (event.target as any).viewModel.messages.header = `0 properties selected`;

      if (!layer) return;
      event.target.layer = layer;
      tableLayerRef.current = layer;
      event.target.tableTemplate = getTableTemplate(layer, webMapId.current);
      const grid =
        event.target.shadowRoot?.querySelector(".esri-grid__grid")?.shadowRoot;
      const style = document.createElement("style");
      style.textContent = `
        [part~="body-cell"] {
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          max-width: 150px;
        }

        [part~="header-cell"] {
          max-width: 150px;
        }         
      `;

      grid?.appendChild(style);
      await mapElement.current.whenLayerView(tableLayerRef.current);
      setSearchReady(true);
      reactiveUtils.watch(
        () => tableElement.current.visibleColumns,
        (columns) => {
          localStorage.setItem(
            `imaps_${webMapId.current}_visibleColumns`,
            JSON.stringify(columns.map((column) => column.fieldName))
          );
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapElement, webMapId]
  );

  const handleTableCellClick = async (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      __esri.FeatureTableCellClickEvent
    >
  ) => {
    if (event.detail.feature) {
      event.currentTarget.highlightIds = new Collection([
        event.detail.feature.getObjectId(),
      ]);
      const feature = event.detail.feature.clone();
      const propertyLayer = mapElement.current.map?.allLayers.find(
        (layer: __esri.Layer) =>
          layer.title === "Property" && layer.type === "feature"
      ) as __esri.FeatureLayer;
      if (propertyLayer) {
        const results = await propertyLayer.queryFeatures({
          where: `PIN_NUM = '${feature.getAttribute("PIN_NUM")}'`,
          returnGeometry: true,
          outFields: ["*"],
        });
        if (results.features.length) {
          feature.geometry = results.features[0].geometry;
        }
        const condoTable = getTableByTitle(mapElement.current, "Condos");
        if (condoTable) {
          feature.layer = condoTable as __esri.FeatureLayer;
        }
        setSelectedTab("info");
        updateFeature(feature);
      }
    }
  };

  const handleAddressTableReady = async (
    event: TargetedEvent<HTMLArcgisFeatureTableElement, void>
  ) => {
    console.log("address table ready");

    (event.target as any).viewModel.messages.header = `0 addresses`;

    const table = event.target;
    const tableTemplate: TableTemplate = new TableTemplate({
      columnTemplates: [
        {
          fieldName: "ADDRESS",
          label: "Address",
          type: "field",
          direction: "asc",
        },
        {
          fieldName: "FEATURETYPE",
          label: "Type",
          type: "field",
        },
      ],
    });
    table.tableTemplate = tableTemplate;

    const addresses = new FeatureLayer({
      portalItem: {
        id: "4d7f78186b0649d081ac56058b041fb7",
      },
      visible: false,
      listMode: "hide",
      outFields: ["ADDRESS", "FEATURETYPE"],
      title: "Addresses",
    });
    await addresses.load();
    table.layer = addresses;
    await table.refresh();
    if (!mapElement.current.map?.findLayerById("address-graphics")) {
      mapElement.current.map?.add(
        new GraphicsLayer({
          id: "address-graphics",
          listMode: "hide",
        })
      );
    }
    const grid =
      table.shadowRoot?.querySelector(".esri-grid__grid")?.shadowRoot;
    const style = document.createElement("style");
    style.textContent = `
        [part~="cell"] {
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          line-height: 1.3 !important;
          padding: 4px !important;
          max-width: 50%;
        }
                  
      `;

    grid?.appendChild(style);
  };
  const handleAddressTableChange = (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      {
        name:
          | "state"
          | "size"
          | "layerView"
          | "effectiveSize"
          | "isQueryingOrSyncing";
      }
    >
  ) => {
    if (event.detail.name === "size") {
      event.target.style.maxHeight = "500px";
      event.target.style.height = `${(event.target.size + 2) * 40 + 100}px`;
      (event.target as any).viewModel.messages.header = `${event.target.size} ${
        event.target.size === 1 ? "address" : "addresses"
      }`;
    }
  };

  const handleAddressCellClick = async (
    event: TargetedEvent<
      HTMLArcgisFeatureTableElement,
      __esri.FeatureTableCellClickEvent
    >
  ) => {
    event.target.highlightIds = new Collection([
      event.detail.objectId as number,
    ]);
    const results = await (
      event.target.layer as __esri.FeatureLayer
    ).queryFeatures({
      objectIds: [event.detail.objectId as number],
      outFields: [],
      returnGeometry: true,
    });
    if (results.features.length) {
      const feature = results.features.at(0);
      if (feature) {
        feature.symbol = new PictureMarkerSymbol({
          url: "pin.svg",
          height: 24,
          width: 24,
        });
        clearAddressPoints(mapElement.current);
        (
          mapElement.current.map?.findLayerById(
            "address-graphics"
          ) as __esri.GraphicsLayer
        ).add(feature);
        mapElement.current.goTo(feature);
      }
    }
  };
  const handleSearchComplete = async (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSearchCompleteEvent
    >
  ) => {
    if (mapElement.current) {
      if (event.detail.numResults === 0) {
        if (event.target.searchTerm.length > 2) {
          const searchFields: string[] = [
            "SITE_ADDRESS",
            "OWNER",
            "FULL_STREET_NAME",
            "PIN_NUM",
            "REID",
          ];
          const results = await wildcardSearch(
            mapElement.current,
            searchElement.current,
            searchFields,
            event.target.searchTerm
          );

          setCondos(results);
          return results;
        } else {
          console.log("search term must be 3 or more characters");
        }
      }
      const condos = await searchForCondosFromSearch(
        event.detail,
        event.target,
        mapElement.current,
        webMapId.current
      );
      setCondos(condos);

      //addRecentSearch(arcgisSearch.current?.searchTerm);
    }
  };

  const handleTabClick = useCallback(() => {
    setSelectedTab("list");
  }, []);

  const handleTabChange = useCallback(
    (event: TargetedEvent<HTMLCalciteTabNavElement, void>) => {
      setSelectedTab(
        event.target.selectedTitle.getAttribute("label") === "list"
          ? "list"
          : "info"
      );
    },
    []
  );

  const handleExport = async () => {
    tableElement.current.highlightIds = new Collection(
      await tableLayerRef.current?.queryObjectIds({ where: "1=1" })
    );
    tableElement.current.exportSelectionToCSV(false);

    tableElement.current.highlightIds = new Collection([]);
  };

  const handleExportAddresses = async () => {
    addressTableElement.current.highlightIds = new Collection(
      await addressTableElement.current.layer?.queryObjectIds({
        geometry: addressTableElement.current.filterGeometry,
      })
    );
    addressTableElement.current.exportSelectionToCSV(false);
    addressTableElement.current.highlightIds = new Collection([]);
  };

  const handleSuggestStart = (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchViewModelSuggestStartEvent
    >
  ) => {
    event.target.searchTerm = checkPin(event.target.searchTerm);
  };

  const updateFeature = useCallback(
    async (feature: __esri.Graphic) => {
      setSelectedTab("info");
      //check to see if the feature is coming from clicking on the list
      const tableLayer = tableLayerRef.current as __esri.FeatureLayer;
      const updates = await tableLayer.queryFeatures({
        where: `1=1`,
        outFields: ["*"],
        returnGeometry: true,
      });
      const selectedFeatures = updates?.features.filter(
        (selectedFeature) => selectedFeature.attributes["selected"] === "yes"
      );
      selectedFeatures?.forEach((selectedFeature) => {
        selectedFeature.setAttribute("selected", "no");
      });

      await tableLayer?.applyEdits({ updateFeatures: selectedFeatures });

      feature.setAttribute("selected", "yes");
      feature.setAttribute("OID", feature.getObjectId());

      await tableLayer?.applyEdits({ updateFeatures: [feature] });
      await tableLayer?.refresh();

      if (!(feature.layer as __esri.FeatureLayer).isTable) {
        const condoTable = getTableByTitle(
          mapElement.current,
          "Condos"
        ) as __esri.FeatureLayer;
        const condos = await condoTable.queryFeatures({
          where: `REID = '${feature.getAttribute("REID")}'`,
          outFields: ["OBJECTID"],
          returnGeometry: true,
        });
        if (condos.features.length) {
          feature = condos.features[0];
          feature.geometry = geometry;
        }
      }
      const photos = await getPhotos(feature, mapElement.current);

      feature.popupTemplate = createTemplate(
        mapElement.current,
        feature,
        photos
      );
      clearAddressPoints(mapElement.current);
      if (!feature.geometry) {
        const property = await getProperty(
          mapElement.current,
          [feature.getObjectId() as number],
          undefined
        );
        tableLayerRef.current?.refresh();
        if (property.length) {
          feature.geometry = property[0].geometry;
        }
      }
      if (feature.geometry !== null && geometry === null) {
        mapElement.current?.goTo({
          target: feature.geometry?.extent?.clone()?.expand(2),
        });
      }

      setSelectedCondo(feature);
      setGeometry(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geometry]
  );

  const handleClearClick = () => {
    setSelectedCondo(null);
    setCondos([]);
    setSelectedTab("list");
  };

  const handleHistoryClick = (
    event: React.MouseEvent<HTMLCalciteListItemElement>
  ) => {
    if (!searchElement.current) return;
    searchElement.current.search(event.currentTarget.label);
  };

  const handleNextPropertySelected = (feature: __esri.Graphic) => {
    updateFeature(feature);
  };
  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
  }, [mapElement, searchParams]);

  useEffect(() => {
    if (geometry && mapElement) {
      const getPropertyByGeometry = async () => {
        const results = await getProperty(
          mapElement.current,
          undefined,
          geometry
        );

        if (results.length) {
          const oids = results.map((result) =>
            result.getObjectId()
          ) as number[];
          const layer = results[0].layer as __esri.FeatureLayer;
          const data = await searchRelatedCondos(
            oids,
            layer,
            "PROPERTY_CONDO",
            mapElement.current
          );
          setCondos(data);
        }
      };
      getPropertyByGeometry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  useEffect(() => {
    if (!condos || !tableLayerRef.current) return;

    //condosSelected(condos);
    const updateTableLayer = async () => {
      const deletes = await (
        tableLayerRef.current as __esri.FeatureLayer
      ).queryFeatures({ where: "1=1" });
      await (tableLayerRef.current as __esri.FeatureLayer).applyEdits({
        deleteFeatures: deletes.features,
      });
      (tableLayerRef.current as __esri.FeatureLayer).refresh();
      condos.forEach((condo) => {
        condos[0].setAttribute("OID", condos[0].getObjectId());
        condo.setAttribute("selected", "no");
      });
      if (condos.length === 1) {
        condos[0].setAttribute("selected", "yes");
      }

      await (tableLayerRef.current as __esri.FeatureLayer).applyEdits({
        addFeatures: condos,
      });
      tableElement.current?.refresh();
    };
    updateTableLayer();
    if (condos.length === 1) {
      updateFeature(condos[0]);
      setSelectedTab("info");
    }
    if (condos.length > 1) {
      setSelectedCondo(null);
      clearAddressPoints(mapElement.current);
      setSelectedTab("list");
    }

    (tableElement.current as any).viewModel.messages.header = `${
      condos.length
    } ${condos.length === 1 ? "property" : "properties"} selected`;

    //onPropertiesSelected(condos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condos]);
  useEffect(() => {
    (async () => {
      if (!selectedCondo) return;
      const arcade = arcadeExpressionInfos.find((info) => {
        return info.title === "site-address";
      })?.expression;
      if (!arcade) return;
      const address = await executeArcade(arcade, selectedCondo);
      setSiteAddress(address);
    })();
  }, [mapElement, selectedCondo, setSiteAddress]);

  return {
    mapElement,
    tableElement,
    addressTableElement,
    searchElement,
    siteAddress,
    selectedTab,
    selectedCondo,
    condos,
    webMapId,
    handleSearchReady,
    handleSearchComplete,
    handleTableReady,
    handleTableCellClick,
    handleTabChange,
    handleAddressTableReady,
    handleAddressTableChange,
    handleAddressCellClick,
    handleClearClick,
    handleHistoryClick,
    handleExport,
    handleExportAddresses,
    handleSuggestStart,
    handleNextPropertySelected,
    handleTabClick,
  };
};
