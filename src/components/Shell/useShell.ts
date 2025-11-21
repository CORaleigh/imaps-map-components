// hooks/useShell.ts
import type { TargetedEvent } from "@arcgis/map-components";
import { useState, useCallback, useEffect } from "react";
import { useMap } from "../../context/useMap";
import { useAppSize, type AppSize } from "../../utils/useAppSize";
import Extent from "@arcgis/core/geometry/Extent";
import type { MapMode } from "../../context/MapContext";
import { constraints } from "../../utils/constraints";
export type PanelType =
  | "propertySearch"
  | "bookmarks"
  | "layerList"
  | "legend"
  | "basemap"
  | null;
export type ToolType =
  | "select"
  | "measure"
  | "location"
  | "print"
  | "sketch"
  | null;

export interface UseShellProps {
  mapElement: React.RefObject<HTMLArcgisMapElement>;
  theme: "light" | "dark";
  activePanel: PanelType;
  activeTool: ToolType;
  openedPanels: PanelType[];
  openedTools: ToolType[];
  mapMode: MapMode;
  appSize: AppSize;
  coordinateConversionOpen: boolean;
  handleThemeClick: () => void;
  handlePanelClose: () => void;
  handleToolClose: () => void;
  handlePanelActionClick: (panel: PanelType) => void;
  handleToolActionClick: (panel: ToolType) => void;
  handleCustomActionClick: (action: "identify" | "streetview" | null) => void;
  handleViewReady: (event: TargetedEvent<HTMLArcgisMapElement, void>) => void;
  handleViewHold: (
    event: TargetedEvent<HTMLArcgisMapElement, __esri.ViewHoldEvent>
  ) => void;
  handleGoToHome: (
    view: __esri.MapView | __esri.SceneView,
    goToParameters: __esri.GoToParameters
  ) => void;
  handleCoordinateExpandChange: (
    event: TargetedEvent<
      HTMLArcgisExpandElement,
      {
        name: "expanded";
      }
    >
  ) => void;
  mapReady: boolean;
}

export const useShell = (): UseShellProps => {
  const appSize = useAppSize();

  const {
    mapElement,
    mapReady,
    setMapReady,
    setGeometry,
    webMapId,
    selectedCondo,
    mapMode,
    handleCustomActionClick,
  } = useMap();

  const [theme, setTheme] = useState<"light" | "dark">(
    localStorage.getItem("imaps_theme_mode") === "dark" ? "dark" : "light"
  );
  const [activePanel, setActivePanel] = useState<PanelType>("propertySearch");
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [openedPanels, setOpenedPanels] = useState<PanelType[]>([
    "propertySearch",
  ]);
  const [openedTools, setOpenedTools] = useState<ToolType[]>([]);
  const [coordinateConversionOpen, setCoordinateConversionOpen] =
    useState<boolean>(false);

  const handleThemeClick = useCallback(() => {
    setTheme((prev: "light" | "dark") => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("imaps_theme_mode", newTheme);
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      body.classList.remove(
        theme === "light" ? "calcite-mode-dark" : "calcite-mode-light"
      );
      body.classList.add(
        theme === "light" ? "calcite-mode-light" : "calcite-mode-dark"
      );
    }
  }, [theme]);
  const handlePanelActionClick = useCallback(
    (panel: PanelType) => {
      setOpenedPanels((prev) =>
        prev.includes(panel) ? prev : [...prev, panel]
      );
      setActivePanel(panel === activePanel ? null : panel);
      if (appSize !== "large" && panel) {
        setActiveTool(null);
      }
    },
    [activePanel, appSize]
  );

  const handlePanelClose = useCallback(() => {
    setActivePanel(null);
  }, []);
  const handleToolActionClick = useCallback(
    (tool: ToolType) => {
      setOpenedTools((prev) => (prev.includes(tool) ? prev : [...prev, tool]));
      setActiveTool(tool === activeTool ? null : tool);

      if (appSize !== "large" && tool) {
        setActivePanel(null);
      }
    },
    [activeTool, appSize]
  );

  const handleToolClose = useCallback(() => {
    setActiveTool(null);
  }, []);

  const handleViewReady = async (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => {
    event.target.constraints = constraints as __esri.View2DConstraints;

    const storedExtent = localStorage.getItem(
      `imaps_${webMapId.current}_extent`
    );
    if (storedExtent) {
      event.target.view.extent = JSON.parse(storedExtent);
    }
    await event.target.view.when();

    setMapReady(true);
    event.target.addEventListener("arcgisViewChange", handleViewChange);
  };
  const handleViewHold = useCallback(
    async (
      event: TargetedEvent<HTMLArcgisMapElement, __esri.ViewHoldEvent>
    ) => {
      setGeometry(event.detail.mapPoint);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleViewChange = useCallback(
    (event: TargetedEvent<HTMLArcgisMapElement, void>) => {
      //if (!mapReady) return;
      if (!event.target.extent) return;
      localStorage.setItem(
        `imaps_${webMapId.current}_extent`,
        JSON.stringify(event.target.extent.toJSON())
      );
    },
    [webMapId]
  );
  const handleGoToHome = (
    view: __esri.MapView | __esri.SceneView,
    goToParameters: __esri.GoToParameters
  ) => {
    console.log(goToParameters);
    view.goTo(
      new Extent({
        xmin: -8810106.471332055,
        ymin: 4207611.929668259,
        xmax: -8689947.462867815,
        ymax: 4333580.152282169,
        spatialReference: {
          wkid: 102100,
        },
      })
    );
  };

  const handleCoordinateExpandChange = (
    event: TargetedEvent<
      HTMLArcgisExpandElement,
      {
        name: "expanded";
      }
    >
  ) => {
    setCoordinateConversionOpen(event.target.expanded);
  };

  useEffect(() => {
    if (appSize !== "large" && activePanel && activeTool) {
      setActiveTool(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSize]);

  useEffect(() => {
    setActivePanel("propertySearch");
  }, [selectedCondo]);

  return {
    mapElement,
    theme,
    activePanel,
    activeTool,
    openedPanels,
    openedTools,
    mapMode,
    appSize,
    coordinateConversionOpen,
    handleThemeClick,
    handlePanelActionClick,
    handlePanelClose,
    handleToolActionClick,
    handleCustomActionClick,
    handleToolClose,
    handleViewReady,
    handleViewHold,
    handleGoToHome,
    handleCoordinateExpandChange,
    mapReady,
  };
};
