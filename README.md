# DEFCON DASHBOARD 📡

A high-performance, real-time tactical surveillance dashboard for tracking global strategic assets. Monitor military aircraft, naval movements, seismic events, thermal threats, and nuclear infrastructure on a single unified tactical interface.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-JS-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📡 Live Surveillance Feeds

- ✈️ **Military & Gov Air Traffic** — Live ADSB tracking of strategic bombers, tankers, VIP transport, and reconnaissance assets.
- 🚢 **Global Naval Movements** — Real-time AIS tracking for warships, submarines (AIS-active), and global oil/gas logistics.
- 💬 **Tactical Intel (ACARS)** — Decoded aircraft message feed for situational awareness.
- 🛰️ **Thermal / Fire Detection** — Near real-time NASA FIRMS thermal anomaly detection (global coverage).
- 🌋 **Seismic Event Monitoring** — Live USGS earthquake data with magnitude and depth visualization.
- ☢️ **Radiation Monitoring** — Real-time environmental radiation levels via Safecast and OpenRadiation APIs.
- 🛸 **Drone & Glider Tracking** — OGN/FLARM network integration for low-altitude assets.

## 🏛️ Strategic Intelligence Layers

- 🚀 **ICBM Infrastructure** — Detailed overlays for ICBM silos, command centers, and launch facilities.
- ☢️ **Nuclear Infrastructure** — Enrichment plants, research centers, and power stations.
- ⚓ **Naval & Military Bases** — Strategic installations, airbases, and naval ports worldwide.
- 👻 **Dark Vehicle Alerts** — Real-time identification of transponder "dark" events where signals go silent in sensitive areas.

## 🚀 deployment

### Vercel (Recommended)
This dashboard is optimized for Vercel. 
1. **Push** this repo to your GitHub.
2. **Connect** to Vercel.
3. **Environment Variables**: Add `NEXT_PUBLIC_AISSTREAM_KEY` from [aisstream.io](https://aisstream.io).

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## 📊 Data Sources
- **Aircraft**: ADSB.lol, ADSB.fi, Airplanes.live
- **Naval**: aisstream.io
- **Comms**: Airframes.io
- **Environment**: USGS, NASA FIRMS, Safecast, OpenRadiation

---
*Disclaimer: This dashboard uses public OSINT data only. Respect operational security and privacy regulations.*

