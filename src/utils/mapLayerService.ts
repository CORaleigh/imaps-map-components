// src/utils/mapLayerService.ts
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Layer from "@arcgis/core/layers/Layer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";

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

  // Cache for persisted state to avoid repeated parsing
  private persistedStateCache: Map<string, boolean> | null = null;

  attachView(view: MapView) {
    this.view = view;
  }

  async loadWebMap(id: string) {
    const webmap = new WebMap({ portalItem: { id } });
    await webmap.load();
    this.map = webmap;
    return webmap;
  }

  // Helper to get/create persisted state cache
  private getPersistedStateCache(): Map<string, boolean> {
    if (this.persistedStateCache) return this.persistedStateCache;

    const raw = localStorage.getItem(this.persistKey);
    const persisted: PersistState = raw ? JSON.parse(raw) : { layers: [] };

    this.persistedStateCache = new Map(
      persisted.layers.map((l) => [l.id, l.visible])
    );

    return this.persistedStateCache;
  }

  private clearPersistedCache() {
    this.persistedStateCache = null;
  }

  async createWebMapWithRequiredAndPersisted(
    id: string
  ): Promise<{ webmap: WebMap; webmapTemplate: WebMap }> {
    this.persistKey = `imaps_${id}_layerVisibility`;
    this.clearPersistedCache();

    this.webmapTemplate = new WebMap({ portalItem: { id } });
    await this.webmapTemplate.load();

    const storedBookmarks = localStorage.getItem(`imaps_${id}_bookmarks`);
    const bookmarks = storedBookmarks
      ? JSON.parse(storedBookmarks)
      : this.webmapTemplate.bookmarks;

    const webmap = new WebMap({
      basemap: this.webmapTemplate.basemap,
      initialViewProperties: this.webmapTemplate.initialViewProperties,
      bookmarks: bookmarks,
      applicationProperties: this.webmapTemplate.applicationProperties,
    });
    this.map = webmap;

    const stateCache = this.getPersistedStateCache();
    const isVisibleLastSession = (title: string) =>
      stateCache.get(title) === true;
    const isRequired = (title: string) =>
      this.REQUIRED_LAYER_TITLES.includes(title);
    const searchIds =
      this.webmapTemplate.applicationProperties?.viewing?.search?.layers
        .toArray()
        .map((layer: __esri.SearchLayer) => layer.id);
    const isSearchable = (id: string) => searchIds?.includes(id);
    // Add top-level layers: required or persisted-visible only
    const addLayerRecursive = (
      layer: Layer,
      parent: WebMap | GroupLayer
    ): boolean => {
      if (layer.type === "group") {
        const groupLayer = layer as GroupLayer;
        const newGroup = new GroupLayer({
          title: groupLayer.title,
          id: groupLayer.id,
          opacity: groupLayer.opacity,
          visible: groupLayer.visible,
        });

        let anyChildAdded = false;

        // Add children in template order if required or persisted-visible
        for (const child of groupLayer.layers.toArray()) {
          const title = child.title || "";
          const shouldAdd =
            isRequired(title) ||
            isVisibleLastSession(title) ||
            isSearchable(child.id);

          if (child.type === "group") {
            if (addLayerRecursive(child, newGroup)) {
              anyChildAdded = true;
            }
          } else if (shouldAdd) {
            newGroup.layers.add(child);
            child.visible = shouldAdd;
            anyChildAdded = true;
          }
        }

        if (anyChildAdded) {
          parent.layers.add(newGroup);
          return true;
        }
        return false;
      }

      // Leaf layers outside groups
      const title = layer.title || "";
      const shouldAdd =
        isRequired(title) ||
        isVisibleLastSession(title) ||
        isSearchable(layer.id);

      if (shouldAdd) {
        parent.layers.add(layer);
        layer.visible = shouldAdd;
        return true;
      }

      return false;
    };

    // Use for loop instead of forEach for potential early exit
    for (const layer of this.webmapTemplate.layers.toArray()) {
      addLayerRecursive(layer, webmap);
    }

    // Add tables - use Set for faster lookup
    const existingTableTitles = new Set(
      webmap.tables.toArray().map((t) => t.title)
    );
    for (const table of this.webmapTemplate.tables.toArray()) {
      if (!existingTableTitles.has(table.title)) {
        webmap.tables.add(table);
      }
    }

    return { webmap, webmapTemplate: this.webmapTemplate };
  }

  /** Adds all missing siblings after the layer list has loaded */
  async addAllMissingSiblingsAfterLayerList() {
    //console.log("🔍 addAllMissingSiblingsAfterLayerList called");
    //console.log("🔍 this.map:", this.map);
    //console.log("🔍 this.webmapTemplate:", this.webmapTemplate);

    if (!this.map || !this.webmapTemplate) {
      //console.log("⚠️ Early return - map or webmapTemplate is null");
      return;
    }

    const stateCache = this.getPersistedStateCache();
    const isVisibleLastSession = (title: string) =>
      stateCache.get(title) === true;

    // Load all group layers in the template to access their children
    const loadAllGroups = async (
      parent: WebMap | GroupLayer,
      depth: number = 0
    ): Promise<void> => {
      //const indent = "  ".repeat(depth);
      const layers = parent.layers.toArray();

      //console.log(`${indent}loadAllGroups called with ${layers.length} layers`);

      for (const layer of layers) {
        if (layer.type === "group") {
          const groupLayer = layer as GroupLayer;
          //const childCountBefore = groupLayer.layers.length;

          //console.log(`${indent}Loading group "${groupLayer.title}" (${childCountBefore} children visible before load)`);

          if (!groupLayer.loaded) {
            await groupLayer.load();
          }

          //const childCountAfter = groupLayer.layers.length;
          //console.log(`${indent}  -> Loaded: ${groupLayer.loaded}, children after: ${childCountAfter}`);

          await loadAllGroups(groupLayer, depth + 1);
        }
      }
    };

    //console.log("=== Loading all template groups ===");
    await loadAllGroups(this.webmapTemplate);
    //console.log("=== Template groups loaded ===\n");

    // PHASE 1: Add all missing layers recursively
    const addMissingLayers = (
      templateLayer: Layer,
      parent: WebMap | GroupLayer
    ) => {
      // Find existing layer/group in parent
      let existingLayer = parent.layers.find(
        (l) => l.title === templateLayer.title
      );

      if (!existingLayer) {
        if (templateLayer.type === "group") {
          existingLayer = new GroupLayer({
            title: templateLayer.title,
            id: templateLayer.id,
            opacity: templateLayer.opacity,
            visible: templateLayer.visible,
          });
        } else {
          existingLayer = templateLayer;
        }
        parent.layers.add(existingLayer);
        //console.log(`Added missing layer "${templateLayer.title}" to "${(parent as __esri.Layer).title || 'Map'}"`);
      }

      // Handle group children recursively
      if (templateLayer.type === "group") {
        const templateGroup = templateLayer as GroupLayer;
        const existingGroup = existingLayer as GroupLayer;

        for (const childTemplate of templateGroup.layers.toArray()) {
          addMissingLayers(childTemplate, existingGroup);
        }
      }
    };

    // Execute Phase 1: Add all missing layers
    //console.log("=== PHASE 1: Adding missing layers ===");
    for (const layer of this.webmapTemplate.layers.toArray()) {
      addMissingLayers(layer, this.map);
    }

    //console.log("\n=== After Phase 1, checking template structure ===");
    // Debug: Show what's in the template
    // for (const templateLayer of this.webmapTemplate.layers.toArray()) {
    //if (templateLayer.type === "group") {
    //const group = templateLayer as GroupLayer;
    //console.log(`Template group "${group.title}" has ${group.layers.length} children:`, group.layers.toArray().map(l => l.title).join(', '));
    //   }
    // }

    // PHASE 2: Reorder from deepest level up to top level
    // We can't use this.webmapTemplate.layers directly because they were moved to this.map
    // Instead, we'll use the current map structure and the persisted/required layer names
    const reorderRecursive = (
      currentParent: WebMap | GroupLayer,
      depth: number = 0
    ) => {
      //const indent = "  ".repeat(depth);
      //const parentName = (currentParent as __esri.Layer).title || 'Map';
      const currentLayers = currentParent.layers.toArray();

      //console.log(`${indent}Processing "${parentName}" with ${currentLayers.length} current layers`);

      // First, recursively reorder all nested groups (depth-first)
      for (const currentLayer of currentLayers) {
        if (currentLayer.type === "group") {
          //console.log(`${indent}Found group "${currentLayer.title}", recursing...`);
          reorderRecursive(currentLayer as GroupLayer, depth + 1);
        }
      }

      // For top-level only, reorder based on original webmap structure
      // We need to use allLayers to find the original order from webmapTemplate
      if (currentParent instanceof WebMap && this.webmapTemplate) {
        //console.log(`${indent}Reordering top-level map layers based on template...`);

        // Get original order from webmapTemplate by looking at allLayers
        const templateOrder: string[] = [];
        this.webmapTemplate.allLayers.forEach((layer) => {
          // Only include top-level layers (those whose parent is the map)
          const parent = (layer as __esri.Layer).parent;
          if (parent && parent.declaredClass === "esri.WebMap") {
            if (!templateOrder.includes(layer.title || "")) {
              templateOrder.push(layer.title || "");
            }
          }
        });

        //console.log(`${indent}  Template order from allLayers:`, templateOrder.join(', '));
        //console.log(`${indent}  Current order:`, currentLayers.map(l => l.title).join(', '));

        const layersToReorder: Array<{
          layer: Layer;
          targetIndex: number;
          title: string;
        }> = [];

        for (
          let targetIndex = 0;
          targetIndex < templateOrder.length;
          targetIndex++
        ) {
          const templateTitle = templateOrder[targetIndex];
          const existingLayer = currentLayers.find(
            (l) => l.title === templateTitle
          );

          if (existingLayer) {
            const currentIndex = currentParent.layers.indexOf(existingLayer);

            // Apply visibility
            const persistedVisible = isVisibleLastSession(templateTitle);
            existingLayer.visible = persistedVisible || existingLayer.visible;

            if (currentIndex !== targetIndex) {
              layersToReorder.push({
                layer: existingLayer,
                targetIndex,
                title: templateTitle,
              });
            }
          }
        }

        // Sort by target index descending and reorder
        layersToReorder.sort((a, b) => b.targetIndex - a.targetIndex);

        for (const { layer, targetIndex } of layersToReorder) {
          //const beforeIndex = currentParent.layers.indexOf(layer);
          currentParent.layers.reorder(layer, targetIndex);
          // const afterIndex = currentParent.layers.indexOf(layer);

          //console.log(`${indent}  Reordered "${title}": ${beforeIndex} -> ${afterIndex} (target: ${targetIndex})`);
        }

        //if (layersToReorder.length === 0) {
        //console.log(`${indent}  No reordering needed`);
        //}
      }
    };

    // Execute Phase 2: Reorder everything from deepest to shallowest
    //console.log("\n=== PHASE 2: Reordering layers ===");
    reorderRecursive(this.map);
    //console.log("=== Done ===\n");
  }

  async initLayersFromWebMap(webMap: WebMap) {
    if (!webMap || !this.view) return;

    // Use Set for faster lookup
    const existingLayerTitles = new Set(
      this.view.map?.layers.toArray().map((l) => l.title) || []
    );

    const layersArray = webMap.layers.toArray();
    for (let i = 0; i < layersArray.length; i++) {
      const layer = layersArray[i];
      if (!existingLayerTitles.has(layer.title)) {
        this.view.map?.layers.add(layer, i);
      }
    }

    const existingTableTitles = new Set(
      this.view.map?.tables.toArray().map((t) => t.title) || []
    );

    for (const table of webMap.tables.toArray()) {
      if (!existingTableTitles.has(table.title)) {
        this.view.map?.tables.add(table);
      }
    }

    const raw = localStorage.getItem(this.persistKey);
    if (!raw) return;

    const state: PersistState = JSON.parse(raw);
    // Use Promise.all for parallel async operations
    await Promise.all(state.layers.map((lp) => this.applyLayerSettings(lp)));
  }

  async persistState() {
    if (!this.view?.map) return;

    const layers: LayerPersist[] = [];
    const allLayers = this.view.map.allLayers.toArray();

    // Load all MapImageLayers in parallel
    const loadPromises = allLayers
      .filter((layer) => layer instanceof MapImageLayer && !layer.loaded)
      .map((layer) => (layer as MapImageLayer).load());

    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }

    for (const layer of allLayers) {
      layers.push(this.serializeLayer(layer));
    }

    localStorage.setItem(this.persistKey, JSON.stringify({ layers }));
    this.clearPersistedCache(); // Invalidate cache after persist
  }

  restorePersistedState() {
    if (!this.view?.map) return;

    const raw = localStorage.getItem(this.persistKey);
    if (!raw) return;

    const state: PersistState = JSON.parse(raw);

    // Create lookup map for faster access
    const layerMap = new Map(
      this.view.map.allLayers.toArray().map((l) => [l.title, l])
    );

    for (const lp of state.layers) {
      const layer = layerMap.get(lp.id);
      if (!layer) continue;

      layer.visible = lp.visible;
      layer.opacity = lp.opacity;

      if (layer instanceof GroupLayer && layer.layers && lp.sublayers) {
        const sublayersArray = layer.layers.toArray();
        for (let idx = 0; idx < sublayersArray.length; idx++) {
          const sl = sublayersArray[idx];
          const slPersist = lp.sublayers[idx];
          if (slPersist) {
            sl.visible = slPersist.visible;
            if (slPersist.opacity != null) sl.opacity = slPersist.opacity;
          }
        }
      }
    }
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

      const sublayersArray = layer.sublayers?.toArray() || [];
      const supportsDynamicLayers =
        layer.capabilities.exportMap?.supportsDynamicLayers;

      for (const sl of sublayersArray) {
        const slPersist = lp.sublayers.find(
          (s) => String(s.id) === String(sl.id)
        );
        if (slPersist) {
          sl.visible = slPersist.visible;
          if (supportsDynamicLayers && slPersist.opacity != null) {
            sl.opacity = slPersist.opacity;
          }
        }
      }
    } else if (layer instanceof GroupLayer && layer.layers && lp.sublayers) {
      const sublayersArray = layer.layers.toArray();
      for (
        let idx = 0;
        idx < sublayersArray.length && idx < lp.sublayers.length;
        idx++
      ) {
        const sl = sublayersArray[idx];
        const slPersist = lp.sublayers[idx];
        if (slPersist) {
          sl.visible = slPersist.visible;
          if (slPersist.opacity != null) sl.opacity = slPersist.opacity;
        }
      }
    }
  }

  getOrLoadLayer(title: string): __esri.FeatureLayer | undefined {
    if (!this.map || !this.webmapTemplate) return undefined;

    const existing = this.map.allLayers.find((l) => l.title === title) as
      | __esri.FeatureLayer
      | undefined;
    if (existing) return existing;

    const templateLayer = this.webmapTemplate.allLayers.find(
      (l) => l.title === title
    ) as __esri.FeatureLayer | undefined;

    if (!templateLayer) return undefined;

    this.map.add(templateLayer);
    return templateLayer;
  }

  watchLayerChanges() {
    if (!this.view?.map) return;

    // Debounce persist calls to avoid excessive writes
    let persistTimeout: number | null = null;
    const debouncedPersist = () => {
      if (persistTimeout) clearTimeout(persistTimeout);
      persistTimeout = window.setTimeout(() => {
        this.persistState();
        persistTimeout = null;
      }, 300);
    };

    const watchLayer = (layer: Layer) => {
      reactiveUtils.watch(() => layer.visible, debouncedPersist);
      reactiveUtils.watch(() => layer.opacity, debouncedPersist);

      if (layer instanceof MapImageLayer && layer.sublayers) {
        for (const sl of layer.sublayers.toArray()) {
          reactiveUtils.watch(() => sl.visible, debouncedPersist);
          reactiveUtils.watch(() => sl.opacity, debouncedPersist);
        }
      }

      if (layer instanceof GroupLayer && layer.layers) {
        for (const sl of layer.layers.toArray()) {
          reactiveUtils.watch(() => sl.visible, debouncedPersist);
          reactiveUtils.watch(() => sl.opacity, debouncedPersist);
        }
      }
    };

    for (const layer of this.view.map.allLayers.toArray()) {
      watchLayer(layer);
    }

    this.view.map.layers.on("after-add", (event) => {
      watchLayer(event.item);
    });
  }
}

export const layerService = new LayerService();
