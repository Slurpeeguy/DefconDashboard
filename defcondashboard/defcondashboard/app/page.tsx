'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { FilterState, SelectedVehicle, AlertEvent } from '@/types';
import { useLiveAircraftData } from '@/hooks/useLiveAircraftData';
import { useLiveShipData } from '@/hooks/useLiveShipData';
import { checkSamAlert, checkDarkAlert, checkNavalRegionAlert, checkTankerCourseAlert, pruneAlerts } from '@/lib/alerts';
import StatusBar from '@/components/StatusBar';
import FiltersPanel from '@/components/FiltersPanel';
import InfoPopup from '@/components/InfoPopup';
import AlertStrip from '@/components/AlertStrip';

// Dynamic import MapView with SSR disabled
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

function useUtcClock() {
  const [utc, setUtc] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtc(
        now.toISOString().slice(11, 19)
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return utc;
}

export default function Home() {
  // ─── Filters ────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('defcon_filters');
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return {
      military: true,
      government: true,
      naval: true,
      tanker: true,
      showDark: false,
      showNuclearSites: false,
      showMilitaryBases: false,
      showNavalBases: false,
      showAlerts: true,
    };
  });

  const toggleFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('defcon_filters', JSON.stringify(next));
      return next;
    });
  }, []);

  // ─── Data hooks ─────────────────────────────────────────────
  const { aircraft, connectionStatus: adsbStatus, rawCount, forceRefresh, version: acVersion } = useLiveAircraftData();
  const { ships, connectionStatus: aisStatus, apiKeyMissing: aisKeyMissing, version: shipVersion } = useLiveShipData();

  // ─── Selection ──────────────────────────────────────────────
  const [selected, setSelected] = useState<SelectedVehicle>(null);
  const restoredRef = useRef(false);

  // Persist selected vehicle id to localStorage
  const handleSelect = useCallback((vehicle: SelectedVehicle) => {
    setSelected(vehicle);
    if (vehicle) {
      const id = vehicle.kind === 'aircraft' ? vehicle.data.hex : String(vehicle.data.mmsi);
      localStorage.setItem('defcon_selected', JSON.stringify({ kind: vehicle.kind, id }));
    } else {
      localStorage.removeItem('defcon_selected');
    }
  }, []);

  // Restore selected vehicle from localStorage once data has loaded
  useEffect(() => {
    if (restoredRef.current) return;
    const raw = localStorage.getItem('defcon_selected');
    if (!raw) { restoredRef.current = true; return; }

    try {
      const { kind, id } = JSON.parse(raw);
      if (kind === 'aircraft') {
        const ac = aircraft.get(id);
        if (ac) { setSelected({ kind: 'aircraft', data: ac }); restoredRef.current = true; }
      } else if (kind === 'ship') {
        const ship = ships.get(Number(id));
        if (ship) { setSelected({ kind: 'ship', data: ship }); restoredRef.current = true; }
      }
    } catch { restoredRef.current = true; }
  }, [acVersion, shipVersion]);

  // ─── UTC Clock ──────────────────────────────────────────────
  const utcTime = useUtcClock();

  // ─── Alerts ─────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const prevAircraftRef = useRef<Map<string, boolean>>(new Map());
  const prevShipDarkRef = useRef<Map<number, boolean>>(new Map());

  // Generate alerts from aircraft data
  useEffect(() => {
    const newAlerts: AlertEvent[] = [];

    aircraft.forEach((ac) => {
      const samAlert = checkSamAlert(ac);
      if (samAlert) newAlerts.push(samAlert);

      const wasDark = prevAircraftRef.current.get(ac.hex) ?? false;
      if (ac.isDark && !wasDark) {
        const darkAlert = checkDarkAlert(ac.hex, ac.callsign || ac.hex, ac.isDark);
        if (darkAlert) newAlerts.push(darkAlert);
      }
      prevAircraftRef.current.set(ac.hex, ac.isDark);
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...prev, ...newAlerts]);
    }
  }, [acVersion]);

  // Generate alerts from ship data
  useEffect(() => {
    const newAlerts: AlertEvent[] = [];

    ships.forEach((ship) => {
      const regionAlert = checkNavalRegionAlert(ship);
      if (regionAlert) newAlerts.push(regionAlert);

      const courseAlert = checkTankerCourseAlert(ship);
      if (courseAlert) newAlerts.push(courseAlert);

      const wasDark = prevShipDarkRef.current.get(ship.mmsi) ?? false;
      if (ship.isDark && !wasDark) {
        const darkAlert = checkDarkAlert(String(ship.mmsi), ship.name || String(ship.mmsi), ship.isDark);
        if (darkAlert) newAlerts.push(darkAlert);
      }
      prevShipDarkRef.current.set(ship.mmsi, ship.isDark);
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...prev, ...newAlerts]);
    }
  }, [shipVersion]);

  // Prune old alerts every second
  useEffect(() => {
    const id = setInterval(() => {
      setAlerts((prev) => {
        const pruned = pruneAlerts(prev);
        return pruned.length !== prev.length ? pruned : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Counts ─────────────────────────────────────────────────
  const counts = {
    military: 0,
    government: 0,
    naval: 0,
    tanker: 0,
  };

  aircraft.forEach((ac) => {
    if (ac.isDark && !filters.showDark) return;
    if (ac.category === 'military') counts.military++;
    else if (ac.category === 'government') counts.government++;
  });

  ships.forEach((ship) => {
    if (ship.isDark && !filters.showDark) return;
    if (ship.category === 'naval') counts.naval++;
    else if (ship.category === 'tanker') counts.tanker++;
  });

  // ─── Error state ────────────────────────────────────────────
  const error = aisKeyMissing ? 'Ship data unavailable — check API key' : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Status bar */}
      <StatusBar
        adsbStatus={adsbStatus}
        aisStatus={aisStatus}
        aisKeyMissing={aisKeyMissing}
        utcTime={utcTime}
        error={error}
      />

      {/* Alert strip */}
      {filters.showAlerts && <AlertStrip alerts={alerts} />}

      {/* Filters panel */}
      <FiltersPanel
        filters={filters}
        onToggle={toggleFilter}
        counts={counts}
        adsbStatus={adsbStatus}
        aisStatus={aisStatus}
        aisKeyMissing={aisKeyMissing}
        rawAdsbCount={rawCount}
        onForceRefresh={forceRefresh}
        utcTime={utcTime}
      />

      {/* AIS key missing banner */}
      {aisKeyMissing && (
        <div
          className="absolute top-[48px] left-64 right-0 z-30 px-4 py-2 text-xs font-mono text-amber-300
                     border-b border-amber-500/20"
          style={{ background: 'rgba(245,158,11,0.1)' }}
        >
          ⚠ Ship data unavailable — set NEXT_PUBLIC_AISSTREAM_KEY environment variable
        </div>
      )}

      {/* Map — full width, panel overlays on top */}
      <div className="absolute top-[48px] left-0 right-0 bottom-0">
        <MapView
          aircraft={aircraft}
          ships={ships}
          filters={filters}
          selected={selected}
          onSelect={handleSelect}
          dataVersion={acVersion + shipVersion}
        />
      </div>

      {/* Info popup */}
      <InfoPopup selected={selected} onClose={() => handleSelect(null)} />
    </div>
  );
}
