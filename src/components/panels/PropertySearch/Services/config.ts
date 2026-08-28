import type Graphic from "@arcgis/core/Graphic";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";

export interface Service {
  title: string;
  graphics: Graphic[];
  layers: Layer[];
}

interface Layer {
  title: string;
  layer: FeatureLayer | undefined;
}

/** Shape of a service as defined in the app's config JSON (config.json, puma.json, etc.) */
export interface ServiceConfig {
  title: string;
  layers: string[];
}

/**
 * Convert the `services` entry from an app config JSON into the runtime
 * Service[] shape used by the Property Search panel. Accepts either a flat
 * array of ServiceConfig or a single-nested array ([[...]]).
 */
export const mapConfigServices = (
  services: ServiceConfig[] | ServiceConfig[][] | undefined,
): Service[] => {
  if (!services) return [];
  const flat = (
    Array.isArray(services[0]) ? (services as ServiceConfig[][]).flat() : services
  ) as ServiceConfig[];
  return flat.map((svc) => ({
    title: svc.title,
    graphics: [],
    layers: (svc.layers ?? []).map((title) => ({ title, layer: undefined })),
  }));
};
