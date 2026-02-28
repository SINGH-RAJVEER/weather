// src/leaflet.heat.d.ts

declare module "leaflet" {
  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
  }

  class HeatLayer extends Layer {
    constructor(latlngs: LatLngExpression[], options?: HeatLayerOptions);
    setOptions(options: HeatLayerOptions): this;
    addLatLng(latlng: LatLngExpression): this;
    setLatLngs(latlngs: LatLngExpression[]): this;
  }

  function heatLayer(latlngs: (LatLng | LatLngTuple)[], options?: HeatLayerOptions): HeatLayer;
}
