'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Aircraft, Ship, FilterState, SelectedVehicle } from '@/types';
import { NUCLEAR_SITES } from '@/lib/nuclearSites';
import { MILITARY_BASES } from '@/lib/militaryBases';
import { NAVAL_BASES } from '@/lib/navalBases';
import { getCountryNameFromCode, getFlagUrlFromCode } from '@/lib/countryFlags';

// Helper to generate flag+country HTML for overlay popups
function countryHtml(code: string): string {
    const name = getCountryNameFromCode(code);
    const flagUrl = getFlagUrlFromCode(code, 20);
    const flagImg = flagUrl ? `<img src="${flagUrl}" style="height:12px;vertical-align:middle;margin-right:4px;border-radius:1px" />` : '';
    return `${flagImg}${name}`;
}

// ─── Colors ───────────────────────────────────────────────────
const COLORS = {
    military: '#ef4444',
    government: '#f59e0b',
    naval: '#3b82f6',
    tanker: '#10b981',
    dark: '#9333ea',
};

// ─── SVG Silhouette Generators (Tactical Grade) ────────────────
function createFighterJetSvg(color: string): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L18,10 L28,18 L18,18 L18,26 L24,30 L16,28 L8,30 L14,26 L14,18 L4,18 L14,10 Z"
      fill="${color}" stroke="white" stroke-width="0.5"/>
    <path d="M16,4 L17,10 L15,10 Z" fill="rgba(255,255,255,0.3)"/>
  </svg>`;
}

function createPrivateJetSvg(color: string): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L17.5,10 L27,17 L17.5,18.5 L17.5,26 L22,29 L16,27.5 L10,29 L14.5,26 L14.5,18.5 L5,17 L14.5,10 Z"
      fill="${color}" stroke="white" stroke-width="0.5"/>
    <path d="M16,3 L16.5,10 L15.5,10 Z" fill="rgba(255,255,255,0.25)"/>
  </svg>`;
}

function createMilitaryBoatSvg(color: string): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L22,8 L22,28 L16,31 L10,28 L10,8 Z"
      fill="${color}" stroke="white" stroke-width="0.5"/>
    <path d="M13,10 L19,10 L19,15 L17,17 L15,17 L13,15 Z" fill="white" fill-opacity="0.3"/>
    <rect x="14" y="20" width="4" height="6" fill="white" fill-opacity="0.2"/>
  </svg>`;
}

function createTankerSvg(color: string): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,2 L22,2 L22,27 L16,31 L10,27 Z"
      fill="${color}" stroke="white" stroke-width="0.5"/>
    <rect x="11" y="4" width="10" height="18" rx="1" fill="white" fill-opacity="0.1"/>
    <path d="M11,24 L21,24 L21,28 L11,28 Z" fill="white" fill-opacity="0.3"/>
  </svg>`;
}

function createDarkIconSvg(): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" fill="#9333ea" fill-opacity="0.3" stroke="#9333ea" stroke-width="2" stroke-dasharray="4,2"/>
    <path d="M16,10 L16,22 M10,16 L22,16" stroke="#9333ea" stroke-width="2"/>
  </svg>`;
}

function svgToDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface MapViewProps {
    aircraft: Map<string, Aircraft>;
    ships: Map<number, Ship>;
    filters: FilterState;
    selected: SelectedVehicle;
    onSelect: (vehicle: SelectedVehicle) => void;
    /** Opaque version counter — bumped when data changes */
    dataVersion: number;
}

export default function MapView({ aircraft, ships, filters, selected, onSelect, dataVersion }: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    // ─── Refs to avoid stale closures in map event handlers ────
    const aircraftRef = useRef(aircraft);
    const shipsRef = useRef(ships);
    const onSelectRef = useRef(onSelect);

    useEffect(() => { aircraftRef.current = aircraft; }, [aircraft]);
    useEffect(() => { shipsRef.current = ships; }, [ships]);
    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

    const aircraftSourceId = 'aircraft-source';
    const shipsSourceId = 'ships-source';
    const pathSourceId = 'selected-path-source';
    const pathGlowSourceId = 'selected-path-glow-source';

    const aircraftLayerId = 'aircraft-layer';
    const shipsLayerId = 'ships-layer';
    const pathLayerId = 'selected-path-layer';
    const pathGlowLayerId = 'selected-path-glow-layer';
    const nuclearSourceId = 'nuclear-source';
    const nuclearLayerId = 'nuclear-layer';
    const nuclearLabelLayerId = 'nuclear-label-layer';
    const basesSourceId = 'bases-source';
    const basesLayerId = 'bases-layer';
    const basesLabelLayerId = 'bases-label-layer';
    const navalBasesSourceId = 'naval-bases-source';
    const navalBasesLayerId = 'naval-bases-layer';
    const navalBasesLabelLayerId = 'naval-bases-label-layer';

    // ─── Map Initialization ──────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Restore saved map position from localStorage
        let savedCenter: [number, number] = [0, 20];
        let savedZoom = 2;
        try {
            const raw = localStorage.getItem('defcon_map_view');
            if (raw) {
                const parsed = JSON.parse(raw);
                savedCenter = [parsed.lng, parsed.lat];
                savedZoom = parsed.zoom;
            }
        } catch { /* ignore */ }

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://tiles.openfreemap.org/styles/dark',
            center: savedCenter,
            zoom: savedZoom,
            attributionControl: false,
        });

        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        // Persist map position on every move
        map.on('moveend', () => {
            const c = map.getCenter();
            localStorage.setItem('defcon_map_view', JSON.stringify({
                lat: c.lat, lng: c.lng, zoom: map.getZoom(),
            }));
        });

        map.on('load', () => {
            // Register detailed icons
            const iconTemplates = [
                { id: 'mil-jet', svg: createFighterJetSvg(COLORS.military) },
                { id: 'gov-jet', svg: createPrivateJetSvg(COLORS.government) },
                { id: 'naval-ship', svg: createMilitaryBoatSvg(COLORS.naval) },
                { id: 'tanker-ship', svg: createTankerSvg(COLORS.tanker) },
                { id: 'dark-vehicle', svg: createDarkIconSvg() },
            ];

            iconTemplates.forEach(({ id, svg }) => {
                const img = new Image();
                img.onload = () => map.addImage(id, img);
                img.src = svgToDataUrl(svg);
            });

            // Path Glow Layer (wider translucent background line)
            map.addSource(pathGlowSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: pathGlowLayerId,
                type: 'line',
                source: pathGlowSourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-width': 8,
                    'line-color': ['coalesce', ['get', 'color'], '#3b82f6'],
                    'line-opacity': 0.15
                }
            });

            // Path Tracing Layer (crisp foreground line)
            map.addSource(pathSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: pathLayerId,
                type: 'line',
                source: pathSourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-width': 3,
                    'line-color': ['coalesce', ['get', 'color'], '#3b82f6'],
                    'line-opacity': 0.85
                }
            });

            // Aircraft Layer
            map.addSource(aircraftSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: aircraftLayerId,
                type: 'symbol',
                source: aircraftSourceId,
                layout: {
                    'icon-image': ['get', 'icon'],
                    'icon-rotate': ['get', 'heading'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-size': 0.8
                }
            });

            // Ships Layer
            map.addSource(shipsSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: shipsLayerId,
                type: 'symbol',
                source: shipsSourceId,
                layout: {
                    'icon-image': ['get', 'icon'],
                    'icon-rotate': ['get', 'heading'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-size': 1.0
                }
            });

            // Layer Click Handling — uses refs to always read latest data
            const handleMapClick = (e: maplibregl.MapMouseEvent) => {
                const features = map.queryRenderedFeatures(e.point, { layers: [aircraftLayerId, shipsLayerId] });
                if (features.length > 0) {
                    const feat = features[0];
                    const props = feat.properties;
                    if (props.kind === 'aircraft') {
                        const ac = aircraftRef.current.get(props.id);
                        if (ac) onSelectRef.current({ kind: 'aircraft', data: ac });
                    } else if (props.kind === 'ship') {
                        const ship = shipsRef.current.get(Number(props.id));
                        if (ship) onSelectRef.current({ kind: 'ship', data: ship });
                    }
                } else {
                    onSelectRef.current(null);
                }
            };
            map.on('click', handleMapClick);

            // Cursor styling
            map.on('mouseenter', aircraftLayerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', aircraftLayerId, () => map.getCanvas().style.cursor = '');
            map.on('mouseenter', shipsLayerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', shipsLayerId, () => map.getCanvas().style.cursor = '');

            // ─── Nuclear Sites Overlay ────────────────────────
            const nuclearFeatures = NUCLEAR_SITES.map(s => ({
                type: 'Feature' as const,
                properties: {
                    name: s.name,
                    siteType: s.type,
                    country: s.country,
                    status: s.status,
                },
                geometry: { type: 'Point' as const, coordinates: [s.lon, s.lat] }
            }));

            map.addSource(nuclearSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: nuclearFeatures }
            });

            map.addLayer({
                id: nuclearLayerId,
                type: 'circle',
                source: nuclearSourceId,
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#facc15',
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fbbf24',
                    'circle-stroke-opacity': 0.9,
                },
                layout: { visibility: 'none' },
            });

            map.addLayer({
                id: nuclearLabelLayerId,
                type: 'symbol',
                source: nuclearSourceId,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 10,
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-allow-overlap': false,
                    visibility: 'none',
                },
                paint: {
                    'text-color': '#facc15',
                    'text-halo-color': 'rgba(0,0,0,0.8)',
                    'text-halo-width': 1,
                },
            });

            // Popup on hover
            const nuclearPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
            map.on('mouseenter', nuclearLayerId, (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const f = e.features?.[0];
                if (f) {
                    const props = f.properties;
                    const typeEmoji = props.siteType === 'reactor' ? '⚛️' : props.siteType === 'weapons' ? '💣' : props.siteType === 'test' ? '💥' : props.siteType === 'enrichment' ? '🔬' : '📦';
                    nuclearPopup.setLngLat((f.geometry as any).coordinates)
                        .setHTML(`<div style="font:11px monospace;color:#facc15;background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:4px;border:1px solid rgba(250,204,21,0.3)">${typeEmoji} <strong>${props.name}</strong><br/><span style="color:#999">${countryHtml(props.country)} • ${props.status}</span></div>`)
                        .addTo(map);
                }
            });
            map.on('mouseleave', nuclearLayerId, () => {
                map.getCanvas().style.cursor = '';
                nuclearPopup.remove();
            });

            // ─── Military Bases Overlay ────────────────────────
            const basesFeatures = MILITARY_BASES.map(b => ({
                type: 'Feature' as const,
                properties: {
                    name: b.name,
                    country: b.country,
                },
                geometry: { type: 'Point' as const, coordinates: [b.lon, b.lat] }
            }));

            map.addSource(basesSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: basesFeatures }
            });

            map.addLayer({
                id: basesLayerId,
                type: 'circle',
                source: basesSourceId,
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#f97316',
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#fb923c',
                    'circle-stroke-opacity': 0.9,
                },
                layout: { visibility: 'none' },
            });

            map.addLayer({
                id: basesLabelLayerId,
                type: 'symbol',
                source: basesSourceId,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 10,
                    'text-offset': [0, 1.3],
                    'text-anchor': 'top',
                    'text-allow-overlap': false,
                    visibility: 'none',
                },
                paint: {
                    'text-color': '#f97316',
                    'text-halo-color': 'rgba(0,0,0,0.8)',
                    'text-halo-width': 1,
                },
            });

            const basesPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
            map.on('mouseenter', basesLayerId, (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const f = e.features?.[0];
                if (f) {
                    basesPopup.setLngLat((f.geometry as any).coordinates)
                        .setHTML(`<div style="font:11px monospace;color:#f97316;background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:4px;border:1px solid rgba(249,115,22,0.3)">🏛 <strong>${f.properties.name}</strong><br/><span style="color:#999">${countryHtml(f.properties.country)}</span></div>`)
                        .addTo(map);
                }
            });
            map.on('mouseleave', basesLayerId, () => {
                map.getCanvas().style.cursor = '';
                basesPopup.remove();
            });

            // ─── Naval Bases Overlay ────────────────────────
            const navalBasesFeatures = NAVAL_BASES.map((b: any) => ({
                type: 'Feature' as const,
                properties: {
                    name: b.name,
                    country: b.country,
                    baseType: b.type,
                },
                geometry: { type: 'Point' as const, coordinates: [b.lon, b.lat] }
            }));

            map.addSource(navalBasesSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: navalBasesFeatures }
            });

            map.addLayer({
                id: navalBasesLayerId,
                type: 'circle',
                source: navalBasesSourceId,
                paint: {
                    'circle-radius': 5,
                    'circle-color': '#06b6d4',
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#22d3ee',
                    'circle-stroke-opacity': 0.9,
                },
                layout: { visibility: 'none' },
            });

            map.addLayer({
                id: navalBasesLabelLayerId,
                type: 'symbol',
                source: navalBasesSourceId,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 10,
                    'text-offset': [0, 1.3],
                    'text-anchor': 'top',
                    'text-allow-overlap': false,
                    visibility: 'none',
                },
                paint: {
                    'text-color': '#06b6d4',
                    'text-halo-color': 'rgba(0,0,0,0.8)',
                    'text-halo-width': 1,
                },
            });

            const navalPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
            map.on('mouseenter', navalBasesLayerId, (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const f = e.features?.[0];
                if (f) {
                    const typeLabel = f.properties.baseType === 'fleet_hq' ? '⚓ Fleet HQ' : f.properties.baseType === 'submarine' ? '🛳 Submarine Base' : f.properties.baseType === 'combined' ? '⚓ Combined Base' : '⚓ Naval Port';
                    navalPopup.setLngLat((f.geometry as any).coordinates)
                        .setHTML(`<div style="font:11px monospace;color:#06b6d4;background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:4px;border:1px solid rgba(6,182,212,0.3)">${typeLabel}<br/><strong>${f.properties.name}</strong><br/><span style="color:#999">${countryHtml(f.properties.country)}</span></div>`)
                        .addTo(map);
                }
            });
            map.on('mouseleave', navalBasesLayerId, () => {
                map.getCanvas().style.cursor = '';
                navalPopup.remove();
            });
        });

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Sync Data to Layers ─────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        // Sync Aircraft
        const acSource = map.getSource(aircraftSourceId) as maplibregl.GeoJSONSource;
        if (acSource) {
            const acFeatures: any[] = [];
            aircraft.forEach((ac) => {
                const show = (!ac.isDark || filters.showDark) &&
                    ((ac.category === 'military' && filters.military) || (ac.category === 'government' && filters.government));
                if (show) {
                    acFeatures.push({
                        type: 'Feature',
                        properties: {
                            id: ac.hex,
                            kind: 'aircraft',
                            heading: ac.heading ?? 0,
                            icon: ac.isDark ? 'dark-vehicle' : (ac.category === 'military' ? 'mil-jet' : 'gov-jet')
                        },
                        geometry: { type: 'Point', coordinates: [ac.lon, ac.lat] }
                    });
                }
            });
            acSource.setData({ type: 'FeatureCollection', features: acFeatures });
        }

        // Sync Ships
        const shipSource = map.getSource(shipsSourceId) as maplibregl.GeoJSONSource;
        if (shipSource) {
            const shipFeatures: any[] = [];
            ships.forEach((ship) => {
                const show = (!ship.isDark || filters.showDark) &&
                    ((ship.category === 'naval' && filters.naval) || (ship.category === 'tanker' && filters.tanker));
                if (show) {
                    shipFeatures.push({
                        type: 'Feature',
                        properties: {
                            id: ship.mmsi,
                            kind: 'ship',
                            heading: ship.heading ?? ship.course ?? 0,
                            icon: ship.isDark ? 'dark-vehicle' : (ship.category === 'naval' ? 'naval-ship' : 'tanker-ship')
                        },
                        geometry: { type: 'Point', coordinates: [ship.lon, ship.lat] }
                    });
                }
            });
            shipSource.setData({ type: 'FeatureCollection', features: shipFeatures });
        }

        // Path tracing for selected vehicle
        const pathSource = map.getSource(pathSourceId) as maplibregl.GeoJSONSource;
        const pathGlowSource = map.getSource(pathGlowSourceId) as maplibregl.GeoJSONSource;

        if (pathSource && pathGlowSource) {
            if (!selected) {
                pathSource.setData({ type: 'FeatureCollection', features: [] });
                pathGlowSource.setData({ type: 'FeatureCollection', features: [] });
            } else {
                let vehicle: Aircraft | Ship | undefined;
                if (selected.kind === 'aircraft') vehicle = aircraft.get(selected.data.hex);
                else vehicle = ships.get(selected.data.mmsi);

                if (vehicle) {
                    const pathFeatures: any[] = [];
                    if (vehicle.path.length >= 2) {
                        if (selected.kind === 'aircraft') {
                            const ac = vehicle as Aircraft;
                            for (let i = 0; i < ac.path.length - 1; i++) {
                                const p1 = ac.path[i];
                                const p2 = ac.path[i + 1];
                                const avgAlt = ((p1.alt ?? 0) + (p2.alt ?? 0)) / 2;
                                const ratio = Math.min(avgAlt / 40000, 1);
                                const color = ratio < 0.5 ? '#22c55e' : ratio < 0.8 ? '#3b82f6' : '#a855f7';
                                pathFeatures.push({
                                    type: 'Feature',
                                    properties: { color },
                                    geometry: { type: 'LineString', coordinates: [[p1.lon, p1.lat], [p2.lon, p2.lat]] }
                                });
                            }
                        } else {
                            pathFeatures.push({
                                type: 'Feature',
                                properties: { color: COLORS[vehicle.category] },
                                geometry: { type: 'LineString', coordinates: vehicle.path.map(p => [p.lon, p.lat]) }
                            });
                        }
                    }
                    pathSource.setData({ type: 'FeatureCollection', features: pathFeatures });
                    pathGlowSource.setData({ type: 'FeatureCollection', features: pathFeatures });
                }
            }
        }
        // dataVersion triggers re-sync when underlying ref data changes

        // Overlay visibility
        const nuclearVis = filters.showNuclearSites ? 'visible' : 'none';
        const basesVis = filters.showMilitaryBases ? 'visible' : 'none';

        if (map.getLayer(nuclearLayerId)) map.setLayoutProperty(nuclearLayerId, 'visibility', nuclearVis);
        if (map.getLayer(nuclearLabelLayerId)) map.setLayoutProperty(nuclearLabelLayerId, 'visibility', nuclearVis);
        if (map.getLayer(basesLayerId)) map.setLayoutProperty(basesLayerId, 'visibility', basesVis);
        if (map.getLayer(basesLabelLayerId)) map.setLayoutProperty(basesLabelLayerId, 'visibility', basesVis);

        const navalVis = filters.showNavalBases ? 'visible' : 'none';
        if (map.getLayer(navalBasesLayerId)) map.setLayoutProperty(navalBasesLayerId, 'visibility', navalVis);
        if (map.getLayer(navalBasesLabelLayerId)) map.setLayoutProperty(navalBasesLabelLayerId, 'visibility', navalVis);
    }, [dataVersion, filters, selected]);

    return (
        <div ref={containerRef} id="map-container" className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
    );
}
