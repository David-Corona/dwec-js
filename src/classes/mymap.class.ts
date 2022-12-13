import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { MAPBOX_TOKEN } from "../constants";

export class MyMap {
    private map: mapboxgl.Map = null;
    private autocomplete: MapboxGeocoder = null;
    readonly accessToken = MAPBOX_TOKEN;

    constructor(
        private coords: { latitude: number; longitude: number },
        private divMap: HTMLDivElement
    ) {
        console.log(coords);
    }

    async loadMap(): Promise<mapboxgl.Map> {
        if (this.map !== null) return this.map;

        (mapboxgl.accessToken as string) = this.accessToken;

        this.map = new mapboxgl.Map({
            container: this.divMap,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [this.coords.longitude, this.coords.latitude],
            zoom: 14,
        });
        return this.map;
    }

    createMarker(coords: { latitude: number; longitude: number }, color: string): mapboxgl.Marker {
        if (this.map === null) return null;

        return new mapboxgl.Marker({color}).setLngLat([coords.longitude, coords.latitude]).addTo(this.map);
    }

    getAutocomplete(): MapboxGeocoder {
        if (this.map === null) return null;
        if (this.autocomplete !== null) return this.autocomplete;

        const autocomplete = new MapboxGeocoder({ marker: false, accessToken: this.accessToken });
        this.map.addControl(autocomplete);

        return autocomplete;
    }

    addPopup(coords: { latitude: number; longitude: number }): mapboxgl.Popup{
        return new mapboxgl.Popup()
            .setLngLat([coords.longitude, coords.latitude])
            .setHTML(`Latitude: ${coords.latitude}<br>Longitude: ${coords.longitude}`)
            .addTo(this.map);
    }

}
