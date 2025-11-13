// src/utils/mapLayerService.ts
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Layer from "@arcgis/core/layers/Layer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

export interface LayerPersist {
  id: string;
  visible: boolean;
  opacity: number;
  type: string;
  sublayers?: {
    id: number | string;
    visible: boolean;
    opacity?: number;
  }[];
}

export interface PersistState {
  layers: LayerPersist[];
}

class LayerService {
  view: MapView | null = null;
  map: WebMap | null = null;
  webmapTemplate: WebMap | null = null;
  persistKey = "imaps_<webmap id>_layerVisibility";

  REQUIRED_LAYER_TITLES = ["Property"]; // adjust as needed

  attachView(view: MapView) {
    this.view = view;
  }

  async loadWebMap(id: string) {
    const webmap = new WebMap({ portalItem: { id } });
    await webmap.load();
    this.map = webmap;
    return webmap;
  }

  async createWebMapWithRequiredAndPersisted(
    id: string
  ): Promise<{ webmap: WebMap; webmapTemplate: WebMap }> {
    this.persistKey = `imaps_${id}_layerVisibility`;
    this.webmapTemplate = new WebMap({ portalItem: { id } });
    await this.webmapTemplate.load();
    const storedBookmarks = localStorage.getItem(`imaps_${id}_bookmarks`) ;
    const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : this.webmapTemplate.bookmarks;
    const webmap = new WebMap({
      basemap: this.webmapTemplate.basemap,
      initialViewProperties: this.webmapTemplate.initialViewProperties,
      bookmarks: bookmarks,
      applicationProperties: this.webmapTemplate.applicationProperties,
    });
    this.map = webmap;

    const searchIds =
      this.webmapTemplate.applicationProperties?.viewing?.search?.layers
        .toArray()
        .map((layer: __esri.SearchLayer) => layer.id);

    // Load persisted layer state
    const raw = localStorage.getItem(this.persistKey);
    const persisted: PersistState = raw ? JSON.parse(raw) : { layers: [] };
    const isVisibleLastSession = (title: string) =>
      persisted.layers.some((l) => l.id === title && l.visible);

    // Recursive function to find required layers and their siblings, preserving group hierarchy
    const addLayerWithSiblingsRecursive = (
      sourceLayer: Layer,
      parent: WebMap | GroupLayer
    ): boolean => {
      // If the source layer is a group layer, process its children recursively
      if (sourceLayer.type === "group") {
        const groupLayer = sourceLayer as GroupLayer;

        // Create a new GroupLayer to hold filtered children
        const newGroup = new GroupLayer({
          title: groupLayer.title,
          id: groupLayer.id,
          opacity: groupLayer.opacity,
          visible: groupLayer.visible,
        });

        //let hasRequiredOrSibling = false;

        // Iterate over each child layer in the group
        const childLayers = groupLayer.layers.toArray();

        // Determine if any child qualifies
        const childQualifies = childLayers.some((childLayer) => {
          if (childLayer.type === "group") {
            return addLayerWithSiblingsRecursive(childLayer, newGroup);
          } else {
            const childIsRequired =
              this.REQUIRED_LAYER_TITLES.includes(childLayer.title || "") ||
              searchIds?.includes(childLayer.id);
            const childWasVisible = isVisibleLastSession(
              childLayer.title || ""
            );
            return childIsRequired || childWasVisible;
          }
        });

        if (childQualifies) {
          // Add all siblings regardless of type
          childLayers.forEach((siblingLayer) => {
            // Avoid adding duplicates
            if (!newGroup.layers.find((l) => l.title === siblingLayer.title)) {
              if (siblingLayer.type === "group") {
                // Recursively add group layers preserving hierarchy
                addLayerWithSiblingsRecursive(siblingLayer, newGroup);
              } else if (siblingLayer.type === "map-image") {
                // Add MapImageLayer as is (no clone)
                newGroup.layers.add(siblingLayer);
              } else {
                // For other layers (e.g., FeatureLayer), add as is
                newGroup.layers.add(siblingLayer);
              }

              // Set visibility according to required or persisted-visible
              const siblingIsRequired =
                this.REQUIRED_LAYER_TITLES.includes(siblingLayer.title || "") ||
                searchIds?.includes(siblingLayer.id);
              const siblingWasVisible = isVisibleLastSession(
                siblingLayer.title || ""
              );
              siblingLayer.visible = siblingIsRequired || siblingWasVisible;
            }
          });

          if (!parent.layers.find((l) => l.title === newGroup.title)) {
            parent.layers.add(newGroup);
          }
          return true;
        }

        // No required or visible layers found in this group or its children
        return false;
      }

      // For MapImageLayer and other layer types, handle separately (no changes here)
      if (sourceLayer.type === "map-image") {
        const mil = sourceLayer as MapImageLayer;
        // Add entire MapImageLayer if any sublayer is required or visible last session
        const sublayersToAdd =
          mil.sublayers?.toArray().filter((sl) => {
            const slIsRequired = this.REQUIRED_LAYER_TITLES.includes(
              sl.title || ""
            );
            const slWasVisible = persisted.layers.some((lp) =>
              lp.sublayers?.some(
                (s) => String(s.id) === String(sl.id) && s.visible
              )
            );
            return slIsRequired || slWasVisible;
          }) || [];

        if (sublayersToAdd.length > 0) {
          // Add MapImageLayer as is (no clone), with all sublayers (no filtering)
          if (!parent.layers.find((l) => l.title === mil.title)) {
            parent.layers.add(mil);
          }
          return true;
        }
        return false;
      }

      // For leaf layers, add if required or was visible last session
      const isRequiredLeaf =
        this.REQUIRED_LAYER_TITLES.includes(sourceLayer.title || "") ||
        searchIds?.includes(sourceLayer.id);
      const wasVisible = isVisibleLastSession(sourceLayer.title || "");

      if (isRequiredLeaf || wasVisible) {
        if (!parent.layers.find((l) => l.title === sourceLayer.title)) {
          parent.layers.add(sourceLayer);
        }
        return true;
      }

      // Layer does not meet criteria to be added
      return false;
    };

    // Instead of adding layers one by one, process all top-level layers in template
    this.webmapTemplate.layers.toArray().forEach((layer) => {
      addLayerWithSiblingsRecursive(layer, webmap);
    });

    // Add tables
    this.webmapTemplate.tables.toArray().forEach((table) => {
      if (!webmap.tables.find((t) => t.title === table.title)) {
        webmap.tables.add(table);
      }
    });

    return { webmap, webmapTemplate: this.webmapTemplate };
  }

  async initLayersFromWebMap(webMap: WebMap) {
    if (!webMap || !this.view) return;

    webMap.layers.toArray().forEach((layer, idx) => {
      if (!this.view?.map?.layers.find((l) => l.title === layer.title)) {
        this.view?.map?.layers.add(layer, idx);
      }
    });

    webMap.tables.toArray().forEach((table) => {
      if (!this.view?.map?.tables.find((t) => t.title === table.title)) {
        this.view?.map?.tables.add(table);
      }
    });

    const raw = localStorage.getItem(this.persistKey);
    if (!raw) return;

    const state: PersistState = JSON.parse(raw);
    for (const lp of state.layers) {
      await this.applyLayerSettings(lp);
    }
  }

  async persistState() {
    if (!this.view?.map) return;

    const layers: LayerPersist[] = [];

    for (const layer of this.view.map.allLayers.toArray()) {
      if (layer instanceof MapImageLayer) {
        await layer.load();
      }
      layers.push(this.serializeLayer(layer));
    }

    localStorage.setItem(this.persistKey, JSON.stringify({ layers }));
  }

  restorePersistedState() {
    if (!this.view?.map) return;
    const raw = localStorage.getItem(this.persistKey);
    if (!raw) return;
    const state: PersistState = JSON.parse(raw);
    state.layers.forEach((lp) => this.applyLayerSettings(lp));
  }

  serializeLayer(layer: Layer): LayerPersist {
    const lp: LayerPersist = {
      id: layer.title!,
      visible: layer.visible,
      opacity: layer.opacity,
      type: layer.type,
    };

    if (layer instanceof MapImageLayer && layer.sublayers) {
      lp.sublayers = layer.sublayers.toArray().map((sl) => ({
        id: sl.id,
        visible: sl.visible,
        opacity: sl.opacity,
      }));
    } else if (layer instanceof GroupLayer && layer.layers) {
      lp.sublayers = layer.layers.toArray().map((sl) => ({
        id: sl.title || sl.id,
        visible: sl.visible,
        opacity: sl.opacity,
      }));
    }

    return lp;
  }

  async applyLayerSettings(lp: LayerPersist) {
    if (!this.view?.map) return;

    const layer = this.view.map.allLayers.find((l) => l.title === lp.id);
    if (!layer) return;

    layer.visible = lp.visible;
    layer.opacity = lp.opacity;

    if (layer instanceof MapImageLayer && lp.sublayers) {
      if (!layer.loaded) await layer.load();
      layer.sublayers?.toArray().forEach((sl) => {
        const slPersist = lp.sublayers?.find(
          (s) => String(s.id) === String(sl.id)
        );
        if (slPersist) {
          sl.visible = slPersist.visible;
          if (layer.capabilities.exportMap?.supportsDynamicLayers) {
            if (slPersist.opacity != null) sl.opacity = slPersist.opacity;
          }
        }
      });
    } else if (layer instanceof GroupLayer && layer.layers && lp.sublayers) {
      layer.layers.toArray().forEach((sl, idx) => {
        const slPersist = lp.sublayers?.[idx];
        if (slPersist) {
          sl.visible = slPersist.visible;
          if (slPersist.opacity != null) sl.opacity = slPersist.opacity;
        }
      });
    }
  }

  getOrLoadLayer(title: string): __esri.FeatureLayer | undefined {
   
    if (!this.map || !this.webmapTemplate) return undefined;

    // check if already in map
    const existing = this.map.allLayers.find((l) => l.title === title) as
      | __esri.FeatureLayer
      | undefined;
    if (existing) return existing;

    // fallback to webmapTemplate
    const templateLayer = this.webmapTemplate.allLayers.find(
      (l) => l.title === title
    ) as __esri.FeatureLayer | undefined;

    if (!templateLayer) return undefined;

    // add to map
    this.map.add(templateLayer);
    return templateLayer;
  }

  watchLayerChanges() {
    if (!this.view?.map) return;

    const watchLayer = (layer: Layer) => {
      layer.watch("visible", () => this.persistState());
      layer.watch("opacity", () => this.persistState());

      if (layer instanceof MapImageLayer && layer.sublayers) {
        layer.sublayers.toArray().forEach((sl) => {
          sl.watch("visible", () => this.persistState());
          sl.watch("opacity", () => this.persistState());
        });
      }

      if (layer instanceof GroupLayer && layer.layers) {
        layer.layers.toArray().forEach((sl) => {
          sl.watch("visible", () => this.persistState());
          sl.watch("opacity", () => this.persistState());
        });
      }
    };

    this.view.map.allLayers.toArray().forEach(watchLayer);

    this.view.map.layers.on("after-add", (event) => {
      watchLayer(event.item);
    });
  }
}

export const layerService = new LayerService();
