export const getTableByTitle = (
  mapElement: HTMLArcgisMapElement,
  name: string
) => {
  return mapElement.view.map?.allTables.find(
    (layer: __esri.Layer) => layer.title === name
  );
};

export const getLayerByTitle = (mapElement: HTMLArcgisMapElement, name: string) => {
  return mapElement.view.map?.allLayers.find(
    (layer: __esri.Layer) => layer.title === name && layer.type !== "group"
  );
};