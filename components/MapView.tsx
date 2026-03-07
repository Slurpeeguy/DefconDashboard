'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { Aircraft, Ship, OgnVehicle, FilterState, SelectedVehicle, EarthquakeEvent, FireEvent, RadiationEvent } from '@/types';
import { NUCLEAR_SITES } from '@/lib/nuclearSites';
import { MILITARY_BASES } from '@/lib/militaryBases';
import { NAVAL_BASES } from '@/lib/navalBases';
import { ICBM_BASES } from '@/lib/icbmBases';
import { getCountryNameFromCode, getFlagUrlFromCode, getCountryCode } from '@/lib/countryFlags';
import { COUNTRY_CODES_LIST } from '@/lib/countryFlags';
import { hexdbCache } from '@/hooks/useHexdbLookup';
import { deriveCountryFromOperator } from '@/lib/operatorCountry';

// Helper to generate flag+country HTML for overlay popups
function countryHtml(code: string): string {
    const name = getCountryNameFromCode(code);
    const flagUrl = getFlagUrlFromCode(code, 20);
    const flagImg = flagUrl ? `<img src="${flagUrl}" style="height:12px;vertical-align:middle;margin-right:4px;border-radius:1px" />` : '';
    return `${flagImg}${name}`;
}

// Helper to calculate dead reckoning destination
// speed in knots, heading in degrees, timeElapsedMs in milliseconds
function calculateDeadReckoning(lat: number, lon: number, speed: number, heading: number, timeElapsedMs: number): [number, number] {
    const R = 6371e3; // Earth radius in meters
    const speedMs = speed * 0.514444; // knots to m/s

    // Cap projection to 60 minutes to prevent absurd predictions
    const effectiveTime = Math.min(timeElapsedMs, 60 * 60 * 1000);
    const distance = speedMs * (effectiveTime / 1000);
    const d = distance / R;

    const lat1 = lat * Math.PI / 180;
    const lon1 = lon * Math.PI / 180;
    const theta = heading * Math.PI / 180;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(theta));
    let lon2 = lon1 + Math.atan2(Math.sin(theta) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));

    let lon2Deg = lon2 * 180 / Math.PI;
    // Normalize longitude
    lon2Deg = (lon2Deg + 540) % 360 - 180;

    return [lon2Deg, lat2 * 180 / Math.PI];
}

// ─── Colors ───────────────────────────────────────────────────
const COLORS = {
    military: '#ef4444',
    government: '#f59e0b',
    naval: '#3b82f6',
    tanker: '#10b981',
    dark: '#9333ea',
    ground: '#eab308',
    mlat: '#9333ea',
    uat: '#2dd4bf',
    ogn: '#84cc16',
};

// ─── SVG Silhouette Generators (Tactical Grade) ────────────────
function createFighterJetSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    const fillOpacity = isOutline ? "0" : "0.3";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L18,10 L28,18 L18,18 L18,26 L24,30 L16,28 L8,30 L14,26 L14,18 L4,18 L14,10 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,4 L17,10 L15,10 Z" fill="rgba(255,255,255,${fillOpacity})"/>` : ''}
  </svg>`;
}

function createPrivateJetSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    const fillOpacity = isOutline ? "0" : "0.25";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L17.5,10 L27,17 L17.5,18.5 L17.5,26 L22,29 L16,27.5 L10,29 L14.5,26 L14.5,18.5 L5,17 L14.5,10 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,3 L16.5,10 L15.5,10 Z" fill="rgba(255,255,255,${fillOpacity})"/>` : ''}
  </svg>`;
}

function createMilitaryBoatSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 L22,8 L22,28 L16,31 L10,28 L10,8 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M13,10 L19,10 L19,15 L17,17 L15,17 L13,15 Z" fill="white" fill-opacity="0.3"/>
    <rect x="14" y="20" width="4" height="6" fill="white" fill-opacity="0.2"/>` : ''}
  </svg>`;
}

function createWarshipSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Sleek hull shape -->
    <path d="M16,2 L19,10 L19,28 L16,31 L13,28 L13,10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<!-- Front gun/turret -->
    <circle cx="16" cy="11" r="1.5" fill="white" fill-opacity="0.8"/>
    <line x1="16" y1="11" x2="16" y2="7" stroke="white" stroke-width="0.8"/>
    <!-- Superstructure bridge -->
    <path d="M14,15 L18,15 L18,20 L16,22 L14,20 Z" fill="white" fill-opacity="0.4"/>
    <!-- Helipad/Aft section -->
    <rect x="14.5" y="23" width="3" height="4" fill="white" fill-opacity="0.2"/>
    <circle cx="16" cy="25" r="1" fill="none" stroke="white" stroke-width="0.3"/>` : ''}
  </svg>`;
}

function createTankerSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Main Hull: blunt bow, straight sides, rounded stern -->
    <path d="M12,4 L20,4 L20,26 C20,28.5 16,30 16,30 C16,30 12,28.5 12,26 Z" 
      fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    
    ${!isOutline ? `<!-- Aft Superstructure (Bridge/Accommodation) -->
    <rect x="13" y="24" width="6" height="4" fill="white" fill-opacity="0.6"/>
    <rect x="14" y="22" width="4" height="2" fill="white" fill-opacity="0.8"/>
    
    <!-- Deck piping / manifold details -->
    <line x1="16" y1="6" x2="16" y2="21" stroke="white" stroke-opacity="0.4" stroke-width="0.8"/>
    <line x1="14" y1="10" x2="18" y2="10" stroke="white" stroke-opacity="0.5" stroke-width="0.5"/>
    <line x1="14" y1="14" x2="18" y2="14" stroke="white" stroke-opacity="0.5" stroke-width="0.5"/>
    <line x1="14" y1="18" x2="18" y2="18" stroke="white" stroke-opacity="0.5" stroke-width="0.5"/>
    
    <!-- Forward bow structure -->
    <rect x="14.5" y="5" width="3" height="2" fill="white" fill-opacity="0.3"/>` : ''}
  </svg>`;
}

function createHelicopterSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,4 L16,28 M4,16 L28,16 M6.5,6.5 L25.5,25.5 M6.5,25.5 L25.5,6.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" stroke-dasharray="2,2"/>
    <path d="M14,10 C14,8 18,8 18,10 L18,22 C18,24 14,24 14,22 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<rect x="15" y="22" width="2" height="6" fill="${color}" stroke="white" stroke-width="0.5"/>
    <path d="M15,28 L18,28" stroke="white" stroke-width="1.5"/>
    <path d="M15,10 C15,9 17,9 17,10 L17,12 L15,12 Z" fill="rgba(255,255,255,0.4)"/>` : ''}
  </svg>`;
}

function createBlackhawkSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Main rotor blur -->
    <circle cx="16" cy="15" r="14" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" stroke-dasharray="4,2"/>
    <path d="M16,1 L16,29 M1,15 L31,15" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    
    <!-- Fuselage (Slender utility profile) -->
    <path d="M14,8 L18,8 L19,16 L17,26 L15,26 L13,16 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    
    ${!isOutline ? `<!-- Cockpit -->
    <path d="M14,10 L18,10 L18,12 L14,12 Z" fill="rgba(255,255,255,0.4)"/>
    
    <!-- Tail boom and rotor -->
    <rect x="15.5" y="26" width="1" height="5" fill="${color}" stroke="white" stroke-width="0.5"/>
    <circle cx="16" cy="31" r="2" fill="none" stroke="white" stroke-width="0.5"/>
    
    <!-- ESSS stub wings (weapons/fuel mounts) -->
    <rect x="10" y="16" width="12" height="1.5" fill="${color}" stroke="white" stroke-width="0.5"/>
    ` : ''}
  </svg>`;
}

function createOspreySvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Proprotor blur (left and right) -->
    <circle cx="6" cy="16" r="5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" stroke-dasharray="2,2"/>
    <circle cx="26" cy="16" r="5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" stroke-dasharray="2,2"/>
    
    <!-- Main Wing -->
    <rect x="6" y="15" width="20" height="3" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    
    <!-- Fuselage (Boxy transport) -->
    <path d="M13,6 L19,6 L19,26 L17,28 L15,28 L13,26 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    
    ${!isOutline ? `<!-- Cockpit -->
    <path d="M14,7 L18,7 L18,10 L14,10 Z" fill="rgba(255,255,255,0.4)"/>
    <!-- Engine Nacelles -->
    <rect x="4" y="14" width="4" height="6" fill="${color}" stroke="white" stroke-width="0.5"/>
    <rect x="24" y="14" width="4" height="6" fill="${color}" stroke="white" stroke-width="0.5"/>
    <!-- Tail (H-tail) -->
    <rect x="11" y="27" width="10" height="1" fill="${color}" stroke="white" stroke-width="0.5"/>
    <rect x="11" y="25" width="1.5" height="4" fill="${color}" stroke="white" stroke-width="0.5"/>
    <rect x="19.5" y="25" width="1.5" height="4" fill="${color}" stroke="white" stroke-width="0.5"/>
    ` : ''}
  </svg>`;
}

function createReaperSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- MQ-9 Reaper: Long thin wings, slender fuselage, V-tail -->
    <path d="M16,4 L17.5,10 L17.5,24 L16,28 L14.5,24 L14.5,10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <path d="M3,16 L15,14 L17,14 L29,16 L17,15 L15,15 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <path d="M11,26 L16,24 L21,26 L16,25 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  </svg>`;
}

function createGlobalHawkSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- RQ-4 Global Hawk: Very long thin wings, bulbous nose, V-tail -->
    <path d="M16,2 C18,3 18,10 18,14 L17,26 L16,28 L15,26 L14,14 C14,10 14,3 16,2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <path d="M1,16 C8,14 15,14 16,14 C17,14 24,14 31,16 L16,15 Z" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    <path d="M12,28 L16,25 L20,28 L16,26 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  </svg>`;
}

function createF22Svg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- F-22 Raptor: Diamond wings -->
    <path d="M16,2 L18,9 L26,17 L26,20 L19,20 L20,28 L16,26 L12,28 L13,20 L6,20 L6,17 L14,9 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,5 L17,10 L15,10 Z" fill="rgba(255,255,255,0.3)"/>` : ''}
  </svg>`;
}

function createF35Svg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- F-35 Lightning II: Stubby diamond, single engine -->
    <path d="M16,3 L18,10 L25,16 L25,18 L19,19 L19,25 L16,27 L13,25 L13,19 L7,18 L7,16 L14,10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,6 L17,10 L15,10 Z" fill="rgba(255,255,255,0.3)"/>` : ''}
  </svg>`;
}

function createF15Svg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- F-15 Eagle: Cropped delta, twin tail, twin engine -->
    <path d="M16,2 L17.5,10 L26,16 L26,20 L19,18 L19,28 L17.5,28 L17.5,24 L16,24 L14.5,24 L14.5,28 L13,28 L13,18 L6,20 L6,16 L14.5,10 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,5 L16.5,10 L15.5,10 Z" fill="rgba(255,255,255,0.3)"/>` : ''}
  </svg>`;
}

function createB52Svg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- B-52 Stratofortress: Swept wings, eight engines, long body -->
    <path d="M16,2 L18,8 L18,14 L30,22 L30,24 L18,18 L18,28 L22,30 L22,31 L16,30 L10,31 L10,30 L14,28 L14,18 L2,24 L2,22 L14,14 L14,8 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<!-- Engine pods -->
    <rect x="7" y="19" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="9" y="18" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="21.5" y="18" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="23.5" y="19" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>` : ''}
  </svg>`;
}

function createB2Svg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- B-2 Spirit: Flying wing -->
    <path d="M16,6 L30,20 L24,24 L20,20 L16,24 L12,20 L8,24 L2,20 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<path d="M16,9 L18,14 L14,14 Z" fill="rgba(255,255,255,0.2)"/>` : ''}
  </svg>`;
}

function createHeavyTransportSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Heavy Jet Transport (C-17/C-5 style): Swept high wing, 4 engines, T-tail -->
    <path d="M16,3 L18,8 L18,12 L28,20 L28,22 L18,18 L17,27 L22,30 L22,31 L16,30 L10,31 L10,30 L15,27 L14,18 L4,22 L4,20 L14,12 L14,8 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<!-- Engines -->
    <rect x="7.5" y="19" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="10.5" y="18" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="20" y="18" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="23" y="19" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <!-- Cockpit -->
    <path d="M15,5 L17,5 L17,7 L15,7 Z" fill="rgba(255,255,255,0.4)"/>` : ''}
  </svg>`;
}

function createTacTransportSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <!-- Tactical Turboprop Transport (C-130 style): Straight high wing, 4 props, thick body -->
    <path d="M16,3 L18,8 L18,14 L30,16 L30,18 L18,18 L17,26 L22,29 L22,30 L16,29 L10,30 L10,29 L15,26 L14,18 L2,18 L2,16 L14,14 L14,8 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<!-- Engines (props protruding forward) -->
    <rect x="8.5" y="14" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="11.5" y="14" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="19" y="14" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <rect x="22" y="14" width="1.5" height="3" fill="${color}" stroke="white" stroke-width="0.3"/>
    <!-- Cockpit -->
    <path d="M15,5 L17,5 L17,7 L15,7 Z" fill="rgba(255,255,255,0.4)"/>` : ''}
  </svg>`;
}

function createGroundVehicleSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="16" height="12" rx="2" ry="2" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<circle cx="16" cy="16" r="3" fill="#fbbf24" stroke="none"/>
    <rect x="10" y="8" width="4" height="2" fill="white" fill-opacity="0.5"/>
    <rect x="18" y="8" width="4" height="2" fill="white" fill-opacity="0.5"/>` : ''}
  </svg>`;
}

function createGliderSvg(color: string, isOutline = false): string {
    const fill = isOutline ? "transparent" : color;
    const stroke = isOutline ? color : "none";
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,6 L17,14 L30,16 L17,18 L16,28 L14,28 L15,18 L2,16 L15,14 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    ${!isOutline ? `<circle cx="16" cy="16" r="2" fill="white" fill-opacity="0.8"/>` : ''}
  </svg>`;
}

function createDarkIconSvg(): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" fill="#9333ea" fill-opacity="0.3" stroke="#9333ea" stroke-width="2" stroke-dasharray="4,2"/>
    <path d="M16,10 L16,22 M10,16 L22,16" stroke="#9333ea" stroke-width="2"/>
  </svg>`;
}

function createProjectedTargetSvg(): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="6" fill="none" stroke="#9333ea" stroke-width="1.5" stroke-dasharray="2,2"/>
    <path d="M16,7 L16,11 M16,21 L16,25 M7,16 L11,16 M21,16 L25,16" stroke="#9333ea" stroke-width="1.5"/>
  </svg>`;
}

function createSeismicSvg(): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.4"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.7"/>
    <circle cx="16" cy="16" r="4" fill="#22c55e" opacity="1.0"/>
  </svg>`;
}

function createFireSvg(color: string): string {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16,2 C16,2 10,10 10,16 C10,21 14,24 16,24 C18,24 22,21 22,16 C22,10 16,2 16,2 Z" fill="${color}" fill-opacity="0.8" />
    <path d="M16,10 C16,10 13,14 13,17 C13,20 15,22 16,22 C17,22 19,20 19,17 C19,14 16,10 16,10 Z" fill="white" fill-opacity="0.4" />
    <path d="M16,4 L16,8 M12,8 L14,10 M20,8 L18,10" stroke="${color}" stroke-width="1.5" stroke-linecap="round" />
  </svg>`;
}

function createRadiationSvg(color: string): string {
    // Render the actual ☢ Unicode character as an SVG text element
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="black" fill-opacity="0.55" />
    <text x="16" y="16" text-anchor="middle" dominant-baseline="central" font-size="22" fill="${color}">&#x2622;</text>
  </svg>`;
}

function svgToDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

interface MapViewProps {
    aircraft: Map<string, Aircraft>;
    ships: Map<number, Ship>;
    ognVehicles: OgnVehicle[];
    earthquakes: EarthquakeEvent[];
    fires: FireEvent[];
    radiationData: RadiationEvent[];
    filters: FilterState;
    selected: SelectedVehicle;
    onSelect: (vehicle: SelectedVehicle) => void;
    /** Opaque version counter — bumped when data changes */
    dataVersion: number;
}

export default function MapView({
    aircraft,
    ships,
    ognVehicles,
    earthquakes,
    fires,
    radiationData,
    filters,
    selected,
    onSelect,
    dataVersion
}: MapViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // ─── Refs to avoid stale closures in map event handlers ────
    const aircraftRef = useRef(aircraft);
    const shipsRef = useRef(ships);
    const ognVehiclesRef = useRef(ognVehicles);
    const earthquakesRef = useRef(earthquakes);
    const firesRef = useRef(fires);
    const radiationDataRef = useRef(radiationData);
    const onSelectRef = useRef(onSelect);

    useEffect(() => { aircraftRef.current = aircraft; }, [aircraft]);
    useEffect(() => { shipsRef.current = ships; }, [ships]);
    useEffect(() => { ognVehiclesRef.current = ognVehicles; }, [ognVehicles]);
    useEffect(() => { earthquakesRef.current = earthquakes; }, [earthquakes]);
    useEffect(() => { firesRef.current = fires; }, [fires]);
    useEffect(() => { radiationDataRef.current = radiationData; }, [radiationData]);
    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

    const aircraftSourceId = 'aircraft-source';
    const shipsSourceId = 'ships-source';
    const ognSourceId = 'ogn-source';
    const pathSourceId = 'selected-path-source';
    const pathGlowSourceId = 'selected-path-glow-source';

    const aircraftLayerId = 'aircraft-layer';
    const shipsLayerId = 'ships-layer';
    const ognLayerId = 'ogn-layer';
    const pathLayerId = 'selected-path-layer';
    const pathGlowLayerId = 'selected-path-glow-layer';
    const radiationSourceId = 'radiation-source';
    const radiationLayerId = 'radiation-layer';
    const projectedLinesSourceId = 'projected-lines-source';
    const projectedLinesLayerId = 'projected-lines-layer';
    const nuclearSourceId = 'nuclear-source';
    const nuclearLayerId = 'nuclear-layer';
    const nuclearLabelLayerId = 'nuclear-label-layer';
    const basesSourceId = 'bases-source';
    const basesLayerId = 'bases-layer';
    const basesLabelLayerId = 'bases-label-layer';
    const navalBasesSourceId = 'naval-bases-source';
    const navalBasesLayerId = 'naval-bases-layer';
    const navalBasesLabelLayerId = 'naval-bases-label-layer';
    const icbmBasesSourceId = 'icbm-bases-source';
    const icbmBasesLayerId = 'icbm-bases-layer';
    const icbmBasesLabelLayerId = 'icbm-bases-label-layer';
    const satellitesSourceId = 'satellites-source';
    const satellitesLayerId = 'satellites-layer';
    const satellitesLabelLayerId = 'satellites-label-layer';
    const aircraftFlagsLayerId = 'aircraft-flags-layer';
    const shipsFlagsLayerId = 'ships-flags-layer';
    const selectionSourceId = 'selection-highlight-source';
    const selectionLayerId = 'selection-highlight-layer';

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

        console.log(`> MapView: Initializing map at ${savedCenter} zoom ${savedZoom}`);
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://tiles.openfreemap.org/styles/dark',
            center: savedCenter,
            zoom: savedZoom,
            attributionControl: false,
        });

        map.on('error', (e) => {
            // Use warn instead of error — MapLibre fires these for routine tile/sprite
            // load failures which are not actual application errors.
            console.warn('> MapView: MapLibre warning', e);
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
            // Find first symbol layer to inset satellite imagery beneath labels
            const style = map.getStyle();
            let firstSymbolId: string | undefined;
            if (style && style.layers) {
                const firstSymbol = style.layers.find(l => l.type === 'symbol');
                if (firstSymbol) firstSymbolId = firstSymbol.id;

                style.layers.forEach((layer) => {
                    if (layer.type === 'symbol') {
                        const textField = map.getLayoutProperty(layer.id, 'text-field');
                        if (textField) {
                            // If the text field references 'name', replace it completely with
                            // an English-first strict coalesce array to wipe out dual-language formatting.
                            const strField = JSON.stringify(textField);
                            if (strField.includes('name')) {
                                map.setLayoutProperty(layer.id, 'text-field', [
                                    'coalesce',
                                    ['get', 'name:en'],
                                    ['get', 'name:latin'],
                                    ['get', 'name']
                                ]);
                            }
                        }
                    }

                    // Thicken and enhance administrative boundaries conditionally
                    if (layer.type === 'line' && (layer.id.includes('boundary') || layer.id.includes('admin') || layer.id.includes('border'))) {
                        // For sub-national state borders (admin_level > 2)
                        if (layer.source === 'carto' || layer.source === 'openmaptiles' || layer.id.toLowerCase().includes('admin')) {
                            // First, ensure all levels are visible (remove our previous level 2 filter)
                            // We'll control visibility entirely via paint properties instead of filters
                            const currentFilter = map.getFilter(layer.id) || ['all'];
                            const cleanFilter = Array.isArray(currentFilter)
                                ? currentFilter.filter(f => !(Array.isArray(f) && f[0] === '==' && Array.isArray(f[1]) && f[1][1] === 'admin_level'))
                                : ['all'];

                            if (cleanFilter.length > 1 || cleanFilter[0] !== 'all') {
                                map.setFilter(layer.id, cleanFilter as any);
                            } else {
                                // Default MapTiler styling handles it, but just in case, reset
                                map.setFilter(layer.id, null);
                            }
                        }

                        if (filters.showBorders) {
                            // When enhanced borders are ON:
                            // Country borders: bold Slate 300
                            // State borders: subtle Slate 600
                            map.setPaintProperty(layer.id, 'line-color', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], '#cbd5e1', // Slate 300
                                '#475569' // Slate 600 (Darker grey for states to be less distracting)
                            ]);
                            map.setPaintProperty(layer.id, 'line-opacity', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], 0.8,
                                0.3 // Dimmer opacity for states
                            ]);

                            map.setPaintProperty(layer.id, 'line-width', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], [
                                    'interpolate', ['linear'], ['zoom'],
                                    2, 1.5,
                                    5, 2.5,
                                    12, 4
                                ],
                                0.5 // Thin static width for states
                            ]);
                        } else {
                            // Default invisible state for countries, but keep states very subtle
                            map.setPaintProperty(layer.id, 'line-color', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], '#ffffff',
                                '#475569'
                            ]);
                            map.setPaintProperty(layer.id, 'line-opacity', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], 0.15,
                                0.2
                            ]);
                            map.setPaintProperty(layer.id, 'line-width', [
                                'case',
                                ['==', ['get', 'admin_level'], 2], 1,
                                0.5
                            ]);
                        }
                    }
                });
            }

            // ─── Base Satellite Imagery ────────────────────────
            map.addSource('esri-satellite', {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256
            });
            map.addLayer({
                id: 'satellite-layer',
                type: 'raster',
                source: 'esri-satellite',
                paint: { 'raster-opacity': 1.0 },
                layout: { visibility: filters.mapStyle === 'satellite' ? 'visible' : 'none' }
            });

            // Register detailed icons
            const iconTemplates = [
                { id: 'mil-jet', svg: createFighterJetSvg(COLORS.military) },
                { id: 'gov-jet', svg: createPrivateJetSvg(COLORS.government) },
                { id: 'mil-heli', svg: createHelicopterSvg(COLORS.military) },
                { id: 'gov-heli', svg: createHelicopterSvg(COLORS.government) },
                { id: 'mil-blackhawk', svg: createBlackhawkSvg(COLORS.military) },
                { id: 'gov-blackhawk', svg: createBlackhawkSvg(COLORS.government) },
                { id: 'mil-osprey', svg: createOspreySvg(COLORS.military) },
                { id: 'gov-osprey', svg: createOspreySvg(COLORS.government) },
                { id: 'mil-reaper', svg: createReaperSvg(COLORS.military) },
                { id: 'gov-reaper', svg: createReaperSvg(COLORS.government) },
                { id: 'mil-globalhawk', svg: createGlobalHawkSvg(COLORS.military) },
                { id: 'gov-globalhawk', svg: createGlobalHawkSvg(COLORS.government) },
                { id: 'mil-f22', svg: createF22Svg(COLORS.military) },
                { id: 'mil-f35', svg: createF35Svg(COLORS.military) },
                { id: 'mil-f15', svg: createF15Svg(COLORS.military) },
                { id: 'mil-b52', svg: createB52Svg(COLORS.military) },
                { id: 'mil-b2', svg: createB2Svg(COLORS.military) },
                { id: 'mil-heavy-transport', svg: createHeavyTransportSvg(COLORS.military) },
                { id: 'gov-heavy-transport', svg: createHeavyTransportSvg(COLORS.government) },
                { id: 'mil-tac-transport', svg: createTacTransportSvg(COLORS.military) },
                { id: 'gov-tac-transport', svg: createTacTransportSvg(COLORS.government) },
                { id: 'naval-ship', svg: createMilitaryBoatSvg(COLORS.naval) },
                { id: 'naval-warship', svg: createWarshipSvg(COLORS.naval) },
                { id: 'tanker-ship', svg: createTankerSvg(COLORS.tanker) },
                { id: 'dark-vehicle', svg: createDarkIconSvg() }, // Fallback
                { id: 'ground-vehicle', svg: createGroundVehicleSvg(COLORS.ground) },
                { id: 'mlat-jet', svg: createFighterJetSvg(COLORS.mlat) },
                { id: 'uat-jet', svg: createPrivateJetSvg(COLORS.uat) },
                { id: 'ogn-glider', svg: createGliderSvg(COLORS.ogn) },
                { id: 'projected-target', svg: createProjectedTargetSvg() },
                { id: 'fire-icon', svg: createFireSvg(COLORS.military) },
                { id: 'radiation-green', svg: createRadiationSvg('#22c55e') },
                { id: 'radiation-yellow', svg: createRadiationSvg('#eab308') },
                { id: 'radiation-orange', svg: createRadiationSvg('#f97316') },
                { id: 'radiation-red', svg: createRadiationSvg('#ef4444') },

                // Dark variants (same color as base, but outlined)
                { id: 'dark-mil-jet', svg: createFighterJetSvg(COLORS.military, true) },
                { id: 'dark-gov-jet', svg: createPrivateJetSvg(COLORS.government, true) },
                { id: 'dark-mil-heli', svg: createHelicopterSvg(COLORS.military, true) },
                { id: 'dark-gov-heli', svg: createHelicopterSvg(COLORS.government, true) },
                { id: 'dark-mil-blackhawk', svg: createBlackhawkSvg(COLORS.military, true) },
                { id: 'dark-gov-blackhawk', svg: createBlackhawkSvg(COLORS.government, true) },
                { id: 'dark-mil-osprey', svg: createOspreySvg(COLORS.military, true) },
                { id: 'dark-gov-osprey', svg: createOspreySvg(COLORS.government, true) },
                { id: 'dark-mil-reaper', svg: createReaperSvg(COLORS.military, true) },
                { id: 'dark-gov-reaper', svg: createReaperSvg(COLORS.government, true) },
                { id: 'dark-mil-globalhawk', svg: createGlobalHawkSvg(COLORS.military, true) },
                { id: 'dark-gov-globalhawk', svg: createGlobalHawkSvg(COLORS.government, true) },
                { id: 'dark-mil-f22', svg: createF22Svg(COLORS.military, true) },
                { id: 'dark-mil-f35', svg: createF35Svg(COLORS.military, true) },
                { id: 'dark-mil-f15', svg: createF15Svg(COLORS.military, true) },
                { id: 'dark-mil-b52', svg: createB52Svg(COLORS.military, true) },
                { id: 'dark-mil-b2', svg: createB2Svg(COLORS.military, true) },
                { id: 'dark-mil-heavy-transport', svg: createHeavyTransportSvg(COLORS.military, true) },
                { id: 'dark-gov-heavy-transport', svg: createHeavyTransportSvg(COLORS.government, true) },
                { id: 'dark-mil-tac-transport', svg: createTacTransportSvg(COLORS.military, true) },
                { id: 'dark-gov-tac-transport', svg: createTacTransportSvg(COLORS.government, true) },
                { id: 'dark-naval-ship', svg: createMilitaryBoatSvg(COLORS.naval, true) },
                { id: 'dark-naval-warship', svg: createWarshipSvg(COLORS.naval, true) },
                { id: 'dark-tanker-ship', svg: createTankerSvg(COLORS.tanker, true) },
                { id: 'dark-ground-vehicle', svg: createGroundVehicleSvg(COLORS.ground, true) },
                { id: 'dark-mlat-jet', svg: createFighterJetSvg(COLORS.mlat, true) },
                { id: 'dark-uat-jet', svg: createPrivateJetSvg(COLORS.uat, true) },
                { id: 'dark-ogn-glider', svg: createGliderSvg(COLORS.ogn, true) },
            ];

            iconTemplates.forEach(({ id, svg }) => {
                const img = new Image();
                img.onload = () => map.addImage(id, img);
                img.src = svgToDataUrl(svg);
            });

            // Preload country flag images from flagcdn.com
            COUNTRY_CODES_LIST.forEach((code: string) => {
                const flagId = `flag-${code}`;
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    if (!map.hasImage(flagId)) {
                        map.addImage(flagId, img);
                    }
                };
                img.src = `https://flagcdn.com/w40/${code}.png`;
            });

            // NATO flag (compass rose on blue)
            const natoSvg = `<svg width="40" height="27" viewBox="0 0 40 27" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="27" fill="#003478"/>
              <circle cx="20" cy="13.5" r="8" fill="none" stroke="white" stroke-width="1.2"/>
              <path d="M20,4 L20,23 M11,13.5 L29,13.5 M13,7 L27,20 M13,20 L27,7" stroke="white" stroke-width="1.5"/>
              <circle cx="20" cy="13.5" r="2.5" fill="white"/>
            </svg>`;
            const natoImg = new Image();
            natoImg.onload = () => { if (!map.hasImage('flag-nato')) map.addImage('flag-nato', natoImg); };
            natoImg.src = svgToDataUrl(natoSvg);

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

            // Projected Dead Reckoning Lines Layer
            map.addSource(projectedLinesSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: projectedLinesLayerId,
                type: 'line',
                source: projectedLinesSourceId,
                paint: {
                    'line-width': 2,
                    'line-color': '#9333ea',
                    'line-opacity': 0.6,
                    'line-dasharray': [2, 3]
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

            // Aircraft Flags Layer (floating flag next to aircraft icon)
            map.addLayer({
                id: aircraftFlagsLayerId,
                type: 'symbol',
                source: aircraftSourceId,
                filter: ['has', 'flag'],
                layout: {
                    'icon-image': ['concat', 'flag-', ['get', 'flag']],
                    'icon-size': 0.45,
                    'icon-offset': [28, -28],
                    'icon-allow-overlap': true,
                    'icon-rotation-alignment': 'viewport',
                    'icon-pitch-alignment': 'viewport',
                    visibility: 'none',
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

            // Ships Flags Layer (floating flag next to ship icon)
            map.addLayer({
                id: shipsFlagsLayerId,
                type: 'symbol',
                source: shipsSourceId,
                filter: ['has', 'flag'],
                layout: {
                    'icon-image': ['concat', 'flag-', ['get', 'flag']],
                    'icon-size': 0.45,
                    'icon-offset': [28, -28],
                    'icon-allow-overlap': true,
                    'icon-rotation-alignment': 'viewport',
                    'icon-pitch-alignment': 'viewport',
                    visibility: 'none',
                }
            });

            // OGN Layer
            map.addSource(ognSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: ognLayerId,
                type: 'symbol',
                source: ognSourceId,
                layout: {
                    'icon-image': ['get', 'icon'],
                    'icon-rotate': ['get', 'heading'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true,
                    'icon-size': 1.0
                }
            });

            // Satellites Layer
            map.addSource(satellitesSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            // ─── Heat/Fire Sources (Thermal Anomalies) ────────────────
            map.addSource('fires', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'fires-point',
                type: 'symbol',
                source: 'fires',
                layout: {
                    'icon-image': 'fire-icon',
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 10, 0.8],
                    'icon-allow-overlap': true
                }
            });

            // ─── Safecast Radiation ────────────────────────────────────
            map.addSource(radiationSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: radiationLayerId,
                type: 'symbol',
                source: radiationSourceId,
                layout: {
                    'icon-image': [
                        'case',
                        ['<', ['get', 'value'], 0.15], 'radiation-green',
                        ['<', ['get', 'value'], 0.5], 'radiation-yellow',
                        ['<', ['get', 'value'], 2.0], 'radiation-orange',
                        'radiation-red'
                    ],
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 10, 1.0],
                    'icon-allow-overlap': true
                }
            });

            // ─── Seismic Events (Earthquakes) ─────────────────────────
            map.addSource('earthquakes', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'earthquakes-point',
                type: 'circle',
                source: 'earthquakes',
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        2, ['*', ['max', ['coalesce', ['get', 'mag'], 1.0], 0.5], 1.5],
                        10, ['*', ['max', ['coalesce', ['get', 'mag'], 1.0], 0.5], 4.0]
                    ],
                    'circle-color': [
                        'step', ['get', 'depth'],
                        '#ef4444', 10,   // Shallow (<10km) -> Red (highest likelihood of surface explosion/test)
                        '#f59e0b', 30,   // Medium -> Orange
                        '#fbbf24', 70,   // Deep -> Yellow
                        '#3b82f6'        // Very deep -> Blue
                    ],
                    'circle-opacity': 0.6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#22c55e' // Tactical Green Outline
                }
            });

            // Layer Click Handling — uses refs to always read latest data
            const handleMapClick = (e: maplibregl.MapMouseEvent) => {
                const features = map.queryRenderedFeatures(e.point, { layers: [aircraftLayerId, shipsLayerId, ognLayerId, 'earthquakes-point', 'fires-point', radiationLayerId] });
                if (features.length > 0) {
                    const feat = features[0];
                    const props = feat.properties;
                    if (props.kind === 'aircraft') {
                        const ac = aircraftRef.current.get(props.id);
                        if (ac) onSelectRef.current({ kind: 'aircraft', data: ac });
                    } else if (props.kind === 'ship') {
                        const ship = shipsRef.current.get(Number(props.id));
                        if (ship) onSelectRef.current({ kind: 'ship', data: ship });
                    } else if (props.kind === 'ogn') {
                        const ogn = ognVehiclesRef.current.find(v => v.id === props.id);
                        if (ogn) onSelectRef.current({ kind: 'ogn', data: ogn });
                    } else if (props.kind === 'earthquake') {
                        const eq = earthquakesRef.current.find(e => e.id === props.id);
                        if (eq) onSelectRef.current({ kind: 'earthquake', data: eq });
                    } else if (props.kind === 'fire') {
                        const fire = firesRef.current.find(f => f.id === props.id);
                        if (fire) onSelectRef.current({ kind: 'fire', data: fire });
                    } else if (props.kind === 'radiation') {
                        const rad = radiationDataRef.current.find(r => r.id === props.id);
                        if (rad) onSelectRef.current({ kind: 'radiation', data: rad });
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
            map.on('mouseenter', ognLayerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', ognLayerId, () => map.getCanvas().style.cursor = '');
            map.on('mouseenter', 'earthquakes-point', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'earthquakes-point', () => map.getCanvas().style.cursor = '');
            map.on('mouseenter', 'fires-point', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'fires-point', () => map.getCanvas().style.cursor = '');
            map.on('mouseenter', radiationLayerId, () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', radiationLayerId, () => map.getCanvas().style.cursor = '');

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

            // Selection Highlight Layer (small white circle ring)
            map.addSource(selectionSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: selectionLayerId,
                type: 'circle',
                source: selectionSourceId,
                paint: {
                    'circle-radius': 12,
                    'circle-color': 'transparent',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-stroke-opacity': 0.85,
                }
            });

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

            // ─── ICBM Bases Overlay ────────────────────────
            const icbmFeatures = ICBM_BASES.map((b: any) => ({
                type: 'Feature' as const,
                properties: {
                    name: b.name,
                    country: b.country,
                    weapon: b.weapon,
                },
                geometry: { type: 'Point' as const, coordinates: [b.lon, b.lat] }
            }));

            map.addSource(icbmBasesSourceId, {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: icbmFeatures }
            });

            map.addLayer({
                id: icbmBasesLayerId,
                type: 'circle',
                source: icbmBasesSourceId,
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#dc2626',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#f87171',
                    'circle-stroke-opacity': 0.9,
                },
                layout: { visibility: 'none' },
            });

            map.addLayer({
                id: icbmBasesLabelLayerId,
                type: 'symbol',
                source: icbmBasesSourceId,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 10,
                    'text-offset': [0, 1.3],
                    'text-anchor': 'top',
                    'text-allow-overlap': false,
                    visibility: 'none',
                },
                paint: {
                    'text-color': '#dc2626',
                    'text-halo-color': 'rgba(0,0,0,0.8)',
                    'text-halo-width': 1,
                },
            });

            const icbmPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
            map.on('mouseenter', icbmBasesLayerId, (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const f = e.features?.[0];
                if (f) {
                    icbmPopup.setLngLat((f.geometry as any).coordinates)
                        .setHTML(`<div style="font:11px monospace;color:#dc2626;background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:4px;border:1px solid rgba(220,38,38,0.3)">🚀 <strong>${f.properties.name}</strong><br/><span style="color:#ef4444">${f.properties.weapon}</span><br/><span style="color:#999">${countryHtml(f.properties.country)}</span></div>`)
                        .addTo(map);
                }
            });
            map.on('mouseleave', icbmBasesLayerId, () => {
                map.getCanvas().style.cursor = '';
                icbmPopup.remove();
            });

            setMapLoaded(true);
        });

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Enhanced Country Borders Toggle ──────────────────────
    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return;
        const map = mapRef.current;
        const style = map.getStyle();
        if (!style || !style.layers) return;

        style.layers.forEach((layer) => {
            if (layer.type === 'line' && (layer.id.includes('boundary') || layer.id.includes('admin') || layer.id.includes('border'))) {
                if (filters.showBorders) {
                    // Enhanced Tactical Borders (Slate 300, thicker)
                    map.setPaintProperty(layer.id, 'line-color', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], '#cbd5e1',
                        '#475569'
                    ]);
                    map.setPaintProperty(layer.id, 'line-opacity', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], 0.8,
                        0.3
                    ]);
                    map.setPaintProperty(layer.id, 'line-width', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], [
                            'interpolate', ['linear'], ['zoom'],
                            2, 1.5,
                            5, 2.5,
                            12, 4
                        ],
                        0.5
                    ]);
                } else {
                    // Dim/Default Borders
                    map.setPaintProperty(layer.id, 'line-color', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], '#ffffff',
                        '#475569'
                    ]);
                    map.setPaintProperty(layer.id, 'line-opacity', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], 0.15,
                        0.2
                    ]);
                    map.setPaintProperty(layer.id, 'line-width', [
                        'case',
                        ['==', ['get', 'admin_level'], 2], 1,
                        0.5
                    ]);
                }
            }
        });
    }, [filters.showBorders, mapLoaded]);

    // ─── Sync Data to Layers ─────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded) return;
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        // Sync Aircraft & Ships + Dead Reckoning
        const acSource = map.getSource(aircraftSourceId) as maplibregl.GeoJSONSource;
        const projectedLineSource = map.getSource(projectedLinesSourceId) as maplibregl.GeoJSONSource;
        const now = Date.now();
        const projectedLineFeatures: any[] = [];

        if (acSource) {
            const acFeatures: any[] = [];
            aircraft.forEach((ac) => {
                // Check role for government/VIP override
                let effectiveCategory = ac.category;
                if (ac.role) {
                    const roleLower = ac.role.toLowerCase();
                    if (roleLower.includes('vip') || roleLower.includes('head of state') || roleLower.includes('liaison')) {
                        effectiveCategory = 'government';
                    }
                }
                // Also check hexdb cache for operator-based override
                if (effectiveCategory !== 'government') {
                    const cachedHex = hexdbCache.get(ac.hex);
                    if (cachedHex?.RegisteredOwners) {
                        const ownerLower = cachedHex.RegisteredOwners.toLowerCase();
                        if (ownerLower.includes('government') || ownerLower.includes('vip') ||
                            ownerLower.includes('presidential') || ownerLower.includes('royal flight') ||
                            ownerLower.includes('head of state') || ownerLower.includes('amiri flight')) {
                            effectiveCategory = 'government';
                        }
                    }
                }

                let show = (!ac.isDark || filters.showDark) &&
                    ((effectiveCategory === 'military' && filters.military) || (effectiveCategory === 'government' && filters.government));

                // If asking to show dark vehicles, and we *are* dark, bypass the other strict ground/mlat/uat toggles
                if (!ac.isDark || !filters.showDark) {
                    if (ac.isGround && !filters.showGround) show = false;
                    if (ac.isMlat && !filters.showMlat) show = false;
                    if (ac.isUat && !filters.showUat) show = false;
                }

                if (show) {
                    let baseIcon = 'mil-jet';
                    const nameLower = ac.fullName ? ac.fullName.toLowerCase() : '';

                    if (ac.roleIcon === '🚁') {
                        if (nameLower.includes('black hawk')) {
                            baseIcon = effectiveCategory === 'military' ? 'mil-blackhawk' : 'gov-blackhawk';
                        } else if (nameLower.includes('osprey')) {
                            baseIcon = effectiveCategory === 'military' ? 'mil-osprey' : 'gov-osprey';
                        } else {
                            baseIcon = effectiveCategory === 'military' ? 'mil-heli' : 'gov-heli';
                        }
                    } else if (ac.roleIcon === '🚛' || ac.roleIcon === '⛽' || ac.roleIcon === '📡') {
                        if (nameLower.includes('c-130') || nameLower.includes('hercules') || nameLower.includes('a400') || nameLower.includes('transall') || nameLower.includes('turboprop')) {
                            baseIcon = effectiveCategory === 'military' ? 'mil-tac-transport' : 'gov-tac-transport';
                        } else {
                            // Heavy jet transport for C-17, C-5, KC-135, AWACS Jets, etc.
                            baseIcon = effectiveCategory === 'military' ? 'mil-heavy-transport' : 'gov-heavy-transport';
                        }
                    } else if (ac.roleIcon === '🛸') {
                        if (nameLower.includes('reaper') || nameLower.includes('predator')) {
                            baseIcon = effectiveCategory === 'military' ? 'mil-reaper' : 'gov-reaper';
                        } else if (nameLower.includes('global hawk')) {
                            baseIcon = effectiveCategory === 'military' ? 'mil-globalhawk' : 'gov-globalhawk';
                        } else {
                            baseIcon = effectiveCategory === 'military' ? 'mil-jet' : 'gov-jet'; // Generic drone uses jet for now
                        }
                    } else if (ac.roleIcon === '💣') {
                        if (nameLower.includes('spirit') || ac.type === 'B2') {
                            baseIcon = 'mil-b2';
                        } else if (nameLower.includes('stratofortress') || ac.type === 'B52') {
                            baseIcon = 'mil-b52';
                        } else {
                            // Default bomber is B-52ish
                            baseIcon = 'mil-b52';
                        }
                    } else if (ac.roleIcon === '⚔️') {
                        if (nameLower.includes('f-22') || ac.type === 'F22') {
                            baseIcon = 'mil-f22';
                        } else if (nameLower.includes('f-35') || ac.type === 'F35') {
                            baseIcon = 'mil-f35';
                        } else if (nameLower.includes('f-15') || ac.type === 'F15') {
                            baseIcon = 'mil-f15';
                        } else {
                            // Default fighter
                            baseIcon = effectiveCategory === 'military' ? 'mil-jet' : 'gov-jet';
                        }
                    } else {
                        baseIcon = effectiveCategory === 'military' ? 'mil-jet' : 'gov-jet';
                    }

                    let iconName = baseIcon;
                    if (ac.isGround) {
                        iconName = 'ground-vehicle';
                    } else if (baseIcon === 'mil-jet' || baseIcon === 'gov-jet' || baseIcon === 'mil-heli' || baseIcon === 'gov-heli') {
                        if (ac.isMlat) iconName = 'mlat-jet';
                        else if (ac.isUat) iconName = 'uat-jet';
                    }

                    if (ac.isDark) {
                        iconName = `dark-${iconName}`;
                    }

                    // Flag: direct country lookup, then hexdb operator fallback
                    let flagCode = getCountryCode(ac.country);
                    if (!flagCode) {
                        const hexData = hexdbCache.get(ac.hex);
                        if (hexData?.RegisteredOwners) {
                            const opCountry = deriveCountryFromOperator(hexData.RegisteredOwners);
                            if (opCountry) flagCode = getCountryCode(opCountry);
                        }
                    }

                    acFeatures.push({
                        type: 'Feature',
                        properties: {
                            id: ac.hex,
                            kind: 'aircraft',
                            heading: ac.heading ?? 0,
                            icon: iconName,
                            ...(flagCode ? { flag: flagCode } : {})
                        },
                        geometry: { type: 'Point', coordinates: [ac.lon, ac.lat] }
                    });

                    // Dead Reckoning tracking for dark aircraft
                    if (ac.isDark && ac.speed != null && ac.speed > 50 && ac.heading != null && filters.showDark) {
                        const elapsedMs = now - ac.lastSeen;
                        if (elapsedMs > 0) {
                            const [projLon, projLat] = calculateDeadReckoning(ac.lat, ac.lon, ac.speed, ac.heading, elapsedMs);

                            // Add dashed line feature
                            projectedLineFeatures.push({
                                type: 'Feature',
                                properties: {},
                                geometry: { type: 'LineString', coordinates: [[ac.lon, ac.lat], [projLon, projLat]] }
                            });

                            // Add ghost icon feature
                            acFeatures.push({
                                type: 'Feature',
                                properties: {
                                    id: `proj_${ac.hex}`,
                                    kind: 'aircraft_projected',
                                    heading: 0,
                                    icon: 'projected-target'
                                },
                                geometry: { type: 'Point', coordinates: [projLon, projLat] }
                            });
                        }
                    }
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
                    const isWarship = ship.shipType.includes('Military') || ship.shipType.includes('Law Enforcement') || ship.shipType.includes('Warship');
                    let iconName = ship.category === 'naval' ? (isWarship ? 'naval-warship' : 'naval-ship') : 'tanker-ship';

                    if (ship.isDark) {
                        iconName = `dark-${iconName}`;
                    }

                    // Flag: try country code first, then infer from ship name
                    let flagCode = getCountryCode(ship.country);
                    if (!flagCode) {
                        const nameLower = (ship.name || '').toLowerCase();
                        if (nameLower.includes('nato')) flagCode = 'nato';
                        else if (nameLower.includes('german')) flagCode = 'de';
                        else if (nameLower.includes('french')) flagCode = 'fr';
                        else if (nameLower.includes('british') || nameLower.includes('hms ')) flagCode = 'gb';
                        else if (nameLower.includes('italian')) flagCode = 'it';
                        else if (nameLower.includes('spanish')) flagCode = 'es';
                        else if (nameLower.includes('dutch')) flagCode = 'nl';
                        else if (nameLower.includes('norwegian')) flagCode = 'no';
                        else if (nameLower.includes('danish')) flagCode = 'dk';
                        else if (nameLower.includes('turkish')) flagCode = 'tr';
                        else if (nameLower.includes('greek')) flagCode = 'gr';
                        else if (nameLower.includes('polish')) flagCode = 'pl';
                        else if (nameLower.includes('canadian') || nameLower.includes('hmcs ')) flagCode = 'ca';
                        else if (nameLower.includes('australian') || nameLower.includes('hmas ')) flagCode = 'au';
                        else if (nameLower.includes('japanese')) flagCode = 'jp';
                        else if (nameLower.includes('indian') || nameLower.includes('ins ')) flagCode = 'in';
                        else if (nameLower.includes('uss ')) flagCode = 'us';
                    }

                    shipFeatures.push({
                        type: 'Feature',
                        properties: {
                            id: ship.mmsi.toString(),
                            kind: 'ship',
                            heading: ship.heading || ship.course || 0,
                            icon: iconName,
                            ...(flagCode ? { flag: flagCode } : {})
                        },
                        geometry: { type: 'Point', coordinates: [ship.lon, ship.lat] }
                    });

                    // Dead Reckoning tracking for dark ships
                    if (ship.isDark && ship.speed != null && ship.speed > 0 && (ship.heading != null || ship.course != null) && filters.showDark) {
                        const heading = ship.heading || ship.course || 0;
                        const elapsedMs = now - ship.lastSeen;
                        if (elapsedMs > 0) {
                            const [projLon, projLat] = calculateDeadReckoning(ship.lat, ship.lon, ship.speed, heading, elapsedMs);

                            // Add dashed line feature
                            projectedLineFeatures.push({
                                type: 'Feature',
                                properties: {},
                                geometry: { type: 'LineString', coordinates: [[ship.lon, ship.lat], [projLon, projLat]] }
                            });

                            // Add ghost icon feature
                            shipFeatures.push({
                                type: 'Feature',
                                properties: {
                                    id: `proj_${ship.mmsi}`,
                                    kind: 'ship_projected',
                                    heading: 0,
                                    icon: 'projected-target'
                                },
                                geometry: { type: 'Point', coordinates: [projLon, projLat] }
                            });
                        }
                    }
                }
            });
            shipSource.setData({ type: 'FeatureCollection', features: shipFeatures });
        }

        // Sync OGN
        const ognSource = map.getSource(ognSourceId) as maplibregl.GeoJSONSource;
        if (ognSource) {
            const ognFeatures: any[] = [];
            ognVehicles.forEach((ogn) => {
                if (filters.showOgn) {
                    ognFeatures.push({
                        type: 'Feature',
                        properties: {
                            id: ogn.id,
                            kind: 'ogn',
                            heading: ogn.heading || 0,
                            icon: 'ogn-glider'
                        },
                        geometry: { type: 'Point', coordinates: [ogn.lon, ogn.lat] }
                    });
                }
            });
            ognSource.setData({ type: 'FeatureCollection', features: ognFeatures });
        }

        // Sync Safecast Radiation
        const radiationSource = map.getSource(radiationSourceId) as maplibregl.GeoJSONSource;
        if (radiationSource) {
            if (filters.showRadiation) {
                const features = radiationData.map(r => ({
                    type: 'Feature' as const,
                    geometry: { type: 'Point' as const, coordinates: [r.lon, r.lat] },
                    properties: {
                        id: r.id,
                        kind: 'radiation',
                        value: r.value,
                        unit: r.unit,
                        captured_at: r.captured_at,
                        device_id: r.device_id
                    }
                }));
                radiationSource.setData({ type: 'FeatureCollection', features });
            } else {
                radiationSource.setData({ type: 'FeatureCollection', features: [] });
            }
        }

        // Sync Earthquakes
        const eqSource = map.getSource('earthquakes') as maplibregl.GeoJSONSource;
        if (eqSource) {
            if (filters.showSeismic) {
                const features = earthquakes.map(eq => ({
                    type: 'Feature' as const,
                    geometry: { type: 'Point' as const, coordinates: [eq.lon, eq.lat] },
                    properties: {
                        id: eq.id,
                        kind: 'earthquake',
                        mag: eq.mag,
                        depth: eq.depth,
                        place: eq.place,
                        time: eq.time
                    }
                }));
                eqSource.setData({ type: 'FeatureCollection', features });
            } else {
                eqSource.setData({ type: 'FeatureCollection', features: [] });
            }
        }

        // Sync Fires
        const fireSource = map.getSource('fires') as maplibregl.GeoJSONSource;
        if (fireSource) {
            if (filters.showThermal) {
                const features = fires.map(f => {
                    let confNum = 50;
                    if (f.confidence === 'l') confNum = 0;
                    else if (f.confidence === 'h') confNum = 100;
                    else if (!isNaN(Number(f.confidence))) confNum = Number(f.confidence);

                    const intensity = Math.min(f.frp / 500, 1);

                    return {
                        type: 'Feature' as const,
                        geometry: { type: 'Point' as const, coordinates: [f.lon, f.lat] },
                        properties: {
                            id: f.id,
                            kind: 'fire',
                            confidenceNum: confNum,
                            intensity: intensity,
                            frp: f.frp,
                            instrument: f.instrument
                        }
                    };
                });
                fireSource.setData({ type: 'FeatureCollection', features });
            } else {
                fireSource.setData({ type: 'FeatureCollection', features: [] });
            }
        }

        // Update projected lines layer
        if (projectedLineSource) {
            projectedLineSource.setData({ type: 'FeatureCollection', features: projectedLineFeatures });
        }

        // Path tracing for selected vehicle
        const pathSource = map.getSource(pathSourceId) as maplibregl.GeoJSONSource;
        const pathGlowSource = map.getSource(pathGlowSourceId) as maplibregl.GeoJSONSource;

        if (pathSource && pathGlowSource) {
            if (!selected) {
                pathSource.setData({ type: 'FeatureCollection', features: [] });
                pathGlowSource.setData({ type: 'FeatureCollection', features: [] });
            } else {
                let vehicle: Aircraft | Ship | OgnVehicle | undefined;
                if (selected.kind === 'aircraft') vehicle = aircraft.get(selected.data.hex);
                else if (selected.kind === 'ship') vehicle = ships.get(selected.data.mmsi);
                else if (selected.kind === 'ogn') vehicle = ognVehicles.find(v => v.id === selected.data.id);

                if (vehicle) {
                    const pathFeatures: any[] = [];
                    if (selected.kind !== 'ogn' && 'path' in vehicle && vehicle.path.length >= 2) {
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

        // Selection highlight: small white circle at selected vehicle
        const selSource = map.getSource(selectionSourceId) as maplibregl.GeoJSONSource;
        if (selSource) {
            if (!selected) {
                selSource.setData({ type: 'FeatureCollection', features: [] });
            } else {
                let vehicle: Aircraft | Ship | OgnVehicle | undefined;
                if (selected.kind === 'aircraft') vehicle = aircraft.get(selected.data.hex);
                else if (selected.kind === 'ship') vehicle = ships.get(selected.data.mmsi);
                else if (selected.kind === 'ogn') vehicle = ognVehicles.find(v => v.id === selected.data.id);

                if (vehicle) {
                    selSource.setData({
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: { type: 'Point', coordinates: [vehicle.lon, vehicle.lat] }
                        }]
                    });
                } else {
                    selSource.setData({ type: 'FeatureCollection', features: [] });
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

        const icbmVis = filters.showICBMs ? 'visible' : 'none';
        if (map.getLayer(icbmBasesLayerId)) map.setLayoutProperty(icbmBasesLayerId, 'visibility', icbmVis);
        if (map.getLayer(icbmBasesLabelLayerId)) map.setLayoutProperty(icbmBasesLabelLayerId, 'visibility', icbmVis);

        const flagsVis = filters.showFlags ? 'visible' : 'none';
        if (map.getLayer(aircraftFlagsLayerId)) map.setLayoutProperty(aircraftFlagsLayerId, 'visibility', flagsVis);
        if (map.getLayer(shipsFlagsLayerId)) map.setLayoutProperty(shipsFlagsLayerId, 'visibility', flagsVis);
    }, [dataVersion, filters, selected, mapLoaded]);

    // ─── Sync Map Style (Satellite vs Dark) ───────────────────
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;
        const map = mapRef.current;
        if (map.getLayer('satellite-layer')) {
            map.setLayoutProperty(
                'satellite-layer',
                'visibility',
                filters.mapStyle === 'satellite' ? 'visible' : 'none'
            );
        }
    }, [filters.mapStyle, mapLoaded]);

    return (
        <div ref={containerRef} id="map-container" className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
    );
}
