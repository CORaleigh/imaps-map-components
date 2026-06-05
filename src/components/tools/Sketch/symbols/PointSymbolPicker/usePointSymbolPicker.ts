// usePointSymbolPicker.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";
import type SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import type SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import type SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import type PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import type TextSymbol from "@arcgis/core/symbols/TextSymbol";
import Portal from "@arcgis/core/portal/Portal";
import PortalItem from "@arcgis/core/portal/PortalItem";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import Color from "@arcgis/core/Color";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol";
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils";

export type OnSymbolChange = (
  symbol:
    | SimpleFillSymbol
    | SimpleLineSymbol
    | SimpleMarkerSymbol
    | PictureMarkerSymbol
    | TextSymbol,
) => void;

export const applySymbolProperties = async (
  webSymbol: WebStyleSymbol,
  color: string,
  size: number,
  onSymbolSelect: OnSymbolChange,
) => {
  const fetchedSymbol = await webSymbol.fetchSymbol();
  const arcgisColor = new Color(color);
  const colorArray = [
    arcgisColor.r,
    arcgisColor.g,
    arcgisColor.b,
    Math.round(arcgisColor.a * 255),
  ];

  if (fetchedSymbol.type === "cim") {
    const json = fetchedSymbol.toJSON();

    const replaceColors = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj.color) && obj.color.length === 4) {
        obj.color = colorArray;
      }
      Object.values(obj).forEach((val) => {
        if (Array.isArray(val)) val.forEach(replaceColors);
        else if (typeof val === "object") replaceColors(val);
      });
    };

    const replaceSize = (obj: any) => {
      
      if (!obj || typeof obj !== "object") return;
      if (obj.symbolLayers && Array.isArray(obj.symbolLayers)) {
        const layers = obj.symbolLayers.filter(
          (l: any) => l.type === "CIMVectorMarker" || l.type === "CIMPictureMarker",
        );
        if (layers.length > 0) {
          const mainLayer = layers.reduce((prev: any, curr: any) =>
            curr.size > prev.size ? curr : prev,
          );
          mainLayer.size = size;
          return;
        }
      }
      Object.values(obj).forEach((val) => {
        if (Array.isArray(val)) val.forEach(replaceSize);
        else if (typeof val === "object") replaceSize(val);
      });
    };

    replaceColors(json);
    replaceSize(json);
    onSymbolSelect(CIMSymbol.fromJSON(json) as unknown as SimpleMarkerSymbol);
  } else {
    const sym = fetchedSymbol as unknown as SimpleMarkerSymbol;
    sym.color = arcgisColor;
    sym.size = size;
    onSymbolSelect(sym);
  }
};

export interface UsePointSymbolPicker {
  handleSizeInput: (
    event: HTMLCalciteInputNumberElement["calciteInputNumberChange"],
  ) => void;
  symbolGroups: SymbolGroup[];
  handleShowFlow: () => void;
  showFlow: boolean;
  handleSymbolGroupChange: (
    event: HTMLCalciteDropdownElement["calciteDropdownSelect"],
  ) => void;
  selectedGroup: SymbolGroup | undefined;
  previewCache: React.RefObject<Map<string, string>>;
  handlePointColorChange: (
    event: HTMLCalciteColorPickerElement["calciteColorPickerChange"],
  ) => void;
  selectedPreviewRef: React.RefObject<HTMLDivElement | null>;
}

export const usePointSymbolPicker = (
  symbol: SimpleMarkerSymbol,
  onSymbolChange: OnSymbolChange,
  selectedWebSymbol: WebStyleSymbol | undefined,
  setSelectedWebSymbol: React.Dispatch<React.SetStateAction<WebStyleSymbol | undefined>>,
  pointColor: string,
  setPointColor: React.Dispatch<React.SetStateAction<string>>,
  size: number,
  setSize: React.Dispatch<React.SetStateAction<number>>,
): UsePointSymbolPicker => {
  const [symbolGroups, setSymbolGroups] = useState<SymbolGroup[]>([]);
  const [showFlow, setShowFlow] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SymbolGroup | undefined>(undefined);
  const previewCache = useRef<Map<string, string>>(new Map());
  const selectedPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPreviewRef.current || !selectedWebSymbol) return;

    selectedWebSymbol.fetchSymbol().then(async (fetchedSymbol) => {
      const arcgisColor = new Color(pointColor);
      const colorArray = [
        arcgisColor.r,
        arcgisColor.g,
        arcgisColor.b,
        Math.round(arcgisColor.a * 255),
      ];

      let symbolToRender = fetchedSymbol;

      if (fetchedSymbol.type === "cim") {
        const json = fetchedSymbol.toJSON();
        const replaceColors = (obj: any) => {
          if (!obj || typeof obj !== "object") return;
          if (Array.isArray(obj.color) && obj.color.length === 4) {
            obj.color = colorArray;
          }
          Object.values(obj).forEach((val) => {
            if (Array.isArray(val)) val.forEach(replaceColors);
            else if (typeof val === "object") replaceColors(val);
          });
        };
        replaceColors(json);
        symbolToRender = CIMSymbol.fromJSON(json);
      } else {
        (symbolToRender as unknown as SimpleMarkerSymbol).color = arcgisColor;
      }

      const html = await symbolUtils.renderPreviewHTML(symbolToRender, { size: 12 });
      if (html && selectedPreviewRef.current) {
        selectedPreviewRef.current.innerHTML = "";
        selectedPreviewRef.current.appendChild(html);
      }
    });
  }, [selectedWebSymbol, pointColor]);

  const handleShowFlow = useCallback(() => {
    setShowFlow((prev) => !prev);
  }, []);

  const handlePointColorChange = useCallback(
    (event: HTMLCalciteColorPickerElement["calciteColorPickerChange"]) => {
      setPointColor(event.target.value as string);
    },
    [setPointColor],
  );

  const handleSymbolGroupChange = useCallback(
    (event: HTMLCalciteDropdownElement["calciteDropdownSelect"]) => {
      const group = symbolGroups.find(
        (group) => group.name === event.target.selectedItems[0].textContent,
      );
      if (group) {
        setSelectedGroup(group);
      }
    },
    [symbolGroups],
  );

  const handleSizeInput = useCallback(
    (event: HTMLCalciteInputNumberElement["calciteInputNumberChange"]) => {
      if (!symbol) return;
      const newSize = Number(event.target.value);
      setSize(newSize);
      if (selectedWebSymbol) {
        applySymbolProperties(selectedWebSymbol, pointColor, newSize, onSymbolChange);
      } else if (symbol.type === "simple-marker") {
        const newSymbol = symbol.clone();
        newSymbol.size = newSize;
        onSymbolChange(newSymbol);
      }
    },
    [onSymbolChange, symbol, selectedWebSymbol, pointColor, setSize],
  );

  useEffect(() => {
    if (selectedWebSymbol) return;
    if (symbol && symbol.type === "simple-marker" && symbol.size) {
      setSize(symbol.size);
    }
  }, [symbol]);

  useEffect(() => {
    if (!selectedWebSymbol) return;
    applySymbolProperties(selectedWebSymbol, pointColor, size, onSymbolChange);
  }, [selectedWebSymbol]);

  const getSymbols = async () => {
    const ids = [
      "a63b3a4631ae41d4a1bc3ba6d9c85bfe",
      "70ccf6bcbd304773a164be896e76edd3",
    ];
    const portal = new Portal({ url: "https://www.arcgis.com" });

    const symbols: SymbolGroup[] = await Promise.all(
      ids.map(async (id: string) => {
        const item = new PortalItem({ portal, id });
        await item.load();
        const data = (await item.fetchData()) as PortalStyleData;

        const webSymbols: SymbolItem[] = data.items.map((symbol) => ({
          symbol: new WebStyleSymbol({
            styleUrl: `https://www.arcgis.com/sharing/rest/content/items/${item.id}/data`,
            name: symbol.name,
          }),
          title: symbol.title,
        }));

        return { name: item.title, symbols: webSymbols };
      }),
    );

    setSymbolGroups(symbols);
    setSelectedGroup(symbols[0]);
    setSelectedWebSymbol(symbols[0]?.symbols[0]?.symbol);
  };

  useEffect(() => {
    if (symbolGroups.length > 0) return;
    getSymbols();
  }, []);

  return {
    handleSizeInput,
    symbolGroups,
    handleShowFlow,
    showFlow,
    handleSymbolGroupChange,
    selectedGroup,
    previewCache,
    handlePointColorChange,
    selectedPreviewRef,
  };
};

export interface SymbolItem {
  symbol: WebStyleSymbol;
  title: string;
}

export interface SymbolGroup {
  name: string | null | undefined;
  symbols: SymbolItem[];
}

interface PortalItemThumbnail {
  href: string;
}

interface PortalStyleItem {
  name: string;
  title: string;
  itemType: "pointSymbol" | "polygonSymbol" | "lineSymbol" | "textSymbol";
  dimensionality: "flat" | "volumetric";
  category: string;
  tags: string[];
  formats: ("web2d" | "cim")[];
  cimRef: string;
  thumbnail: PortalItemThumbnail;
}

interface PortalStyleData {
  cimVersion: string;
  items: PortalStyleItem[];
}