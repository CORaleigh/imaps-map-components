/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useShell.ts
import type { TargetedEvent } from "@arcgis/map-components";
import { useState, useRef, useEffect, type RefObject } from "react";
import {
  getLayouts,
  getScales,
  type Layout,
  type MapScale,
} from "./printLayouts";
import { prepareExport, type Export } from "./printService";
import { useMap } from "../../../context/useMap";
import { getPrintTemplate, hidePrintFrame, showPrintFrame } from "./printFrame";

interface PrintOptions {
  title: string;
  scale: number;
  scaleType: "current" | "custom";
  userDefined: boolean;
  showLegend: boolean;
  showAttributes: boolean;
  showPrintArea: boolean;
  format?: Format;
  layout?: Layout;
}

export type Format =
  | "PDF"
  | "PNG32"
  | "PNG8"
  | "JPG"
  | "GIF"
  | "EPS"
  | "SVG"
  | "SVGZ"
  | "AAIX"
  | "TIFF";

export interface UsePrintProps {
  printOptions: PrintOptions;
  exports: Export[];
  formats: RefObject<Format[]>;
  scales: MapScale[];
  layouts: Layout[];
  selectedTab: "layout" | "exports";
  selectedCondo: __esri.Graphic | null;
  handleTitleChange: (
    event: TargetedEvent<HTMLCalciteInputTextElement, void>
  ) => void;
  handleScaleTypeChange: (
    event: TargetedEvent<HTMLCalciteRadioButtonGroupElement, void>
  ) => void;
  handleRemovePrintResult: (
    event: TargetedEvent<HTMLCalciteListItemElement, void>
  ) => void;
  handleLayoutSelected: (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => void;
  handleFormatSelected: (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => void;
  handleTabChange: (
    event: TargetedEvent<HTMLCalciteTabNavElement, void>
  ) => void;
  handleExportClick: () => void;
  handleShowAttributesChange: (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => void;
  handleShowLegendChange: (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => void;
  handleShowPrintAreaChange: (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => void;
  handleCustomScaleChange: (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => void;
  handleUserDefinedInput: (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => void;

}

export const usePrint = (
  mapElement: React.RefObject<HTMLArcgisMapElement>,
  closed: boolean
): UsePrintProps => {
  const { selectedCondo } = useMap();
  const printUrl = useRef("");
  const initializedRef = useRef(false);
  const formats = useRef<Format[]>([
    "PDF",
    "PNG32",
    "PNG8",
    "JPG",
    "GIF",
    "EPS",
    "SVG",
    "SVGZ",
    "AAIX",
    "TIFF",
  ]);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    title: "",
    scale: mapElement.current.scale,
    scaleType: "current",
    userDefined: false,
    showAttributes: false,
    showLegend: false,
    showPrintArea: false,
    format: formats.current.at(0),
  });

  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [scales, setScales] = useState<MapScale[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [selectedTab, setSelectedTab] = useState<"layout" | "exports">(
    "layout"
  );

  const handleTitleChange = (
    event: TargetedEvent<HTMLCalciteInputTextElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      title: event.target.value,
    }));
  };

  const handleScaleTypeChange = (
    event: TargetedEvent<HTMLCalciteRadioButtonGroupElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      scaleType: event.target.selectedItem.value,
    }));
  };

  const handleLayoutSelected = (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      layout: event.target.selectedOption.value,
    }));
  };
  const handleFormatSelected = (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      format: event.target.selectedOption.value,
    }));
  };

  const handleShowAttributesChange = (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      showAttributes: event.target.checked,
    }));
  };

  const handleShowLegendChange = (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      showLegend: event.target.checked,
    }));
  };

  const handleCustomScaleChange = (
    event: TargetedEvent<HTMLCalciteSelectElement, void>
  ) => {
    const selected = event.target.selectedOption.value; // this is a string
    setPrintOptions((prev) => ({
      ...prev,
      userDefined: selected === "custom",
      scale: selected === "custom" ? prev.scale : selected, // keep previous scale if "custom"
    }));
  };

  const handleUserDefinedInput = (
    event: TargetedEvent<HTMLCalciteInputNumberElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      scale: parseInt(event.target.value),
    }));
  };

  const handleShowPrintAreaChange = (
    event: TargetedEvent<HTMLCalciteSwitchElement, void>
  ) => {
    setPrintOptions((prev) => ({
      ...prev,
      showPrintArea: event.target.checked,
    }));

    if (event.target.checked) {
      if (!printOptions.layout) return;
      showPrintFrame(
        mapElement.current,
        printOptions.layout,
        printOptions.scale,
        printOptions.showAttributes,
        printOptions.showLegend
      );
    } else {
      hidePrintFrame(mapElement.current);
    }
  };

  const handleTabChange = (
    event: TargetedEvent<HTMLCalciteTabNavElement, void>
  ) => {
    setSelectedTab(
      event.target.selectedTitle.textContent.toLowerCase() as
        | "layout"
        | "exports"
    );
  };

  const handleExportClick = () => {
    if (!printUrl.current) return;
    prepareExport(
      mapElement.current,
      printOptions.scale,
      printOptions.layout,
      printOptions.format,
      printOptions.title,
      printOptions.showLegend,
      printOptions.showAttributes,
      selectedCondo,
      printUrl.current,
      setExports
    );
    setSelectedTab("exports");
  };

  const handleRemovePrintResult = (
    event: TargetedEvent<HTMLCalciteListItemElement, void>
  ) => {
    setExports((prev) =>
      prev.filter((result) => result.id.toString() !== event.target.value)
    );
  };



  useEffect(() => {
    (async () => {
      const config = await fetch("config.json");
      const data = await config.json();
      if (data.printUrl) {
        printUrl.current = data.printUrl;
      }
      setScales(getScales());
      const layoutsLoaded = await getLayouts();
      setLayouts(layoutsLoaded);

      if (layoutsLoaded.at(0)) {
        setPrintOptions((prev) => ({
          ...prev,
          layout: layoutsLoaded.at(0),
        }));
      }
    })();
  }, []);

  useEffect(() => {
    if (!printOptions.showPrintArea) {
      hidePrintFrame(mapElement.current);
      return;
    }

    const { layout, scale, showAttributes, showLegend } = printOptions;
    if (!layout) return;

    const template = getPrintTemplate(layout, showAttributes, showLegend);
    if (!template) return;

    showPrintFrame(
      mapElement.current,
      layout,
      scale,
      showAttributes,
      showLegend
    );
  }, [
    printOptions.showPrintArea,
    printOptions.layout,
    printOptions.scale,
    printOptions.showAttributes,
    printOptions.showLegend,
  ]);

  useEffect(() => {
    if (closed) {
      hidePrintFrame(mapElement.current);
      setPrintOptions((prev) => ({
        ...prev,
        showPrintArea: false,
      }));
    }
  }, [closed]);

  useEffect(() => {
    if (!mapElement.current || initializedRef.current) return;
    initializedRef.current = true;
  }, [mapElement]);

  return {
    printOptions,
    exports,
    formats,
    scales,
    layouts,
    selectedTab,
    selectedCondo,
    handleTitleChange,
    handleScaleTypeChange,
    handleRemovePrintResult,
    handleLayoutSelected,
    handleFormatSelected,
    handleTabChange,
    handleExportClick,
    handleShowAttributesChange,
    handleShowLegendChange,
    handleShowPrintAreaChange,
    handleCustomScaleChange,
    handleUserDefinedInput
  };
};
