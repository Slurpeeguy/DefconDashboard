# DEFCON DASHBOARD

Real-time global surveillance dashboard tracking military aircraft, government flights, naval vessels, and oil tankers on a dark tactical world map.

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-JS-blue)

## Features

- 🔴 **Military Aircraft** — live tracking via ADSB.lol
- 🟡 **Government / VIP Flights** — callsign-based classification
- 🔵 **Naval Vessels** — real-time AIS data via aisstream.io
- 🟢 **Oil Tankers** — tanker tracking with course change alerts
- 👻 **Dark Vehicles** — tracks aircraft and ships that go silent
- 🌍 **Country of Origin** — flag and name from ICAO hex / MMSI MID lookup
- ⚡ **Live Alerts** — SAM callsigns, naval region changes, course deviations

## Data Sources

| Source | Data | Type | Key Required? |
|--------|------|------|---------------|
| [ADSB.lol](https://adsb.lol) | Military aircraft positions | REST (5s poll) | No |
| [aisstream.io](https://aisstream.io) | Ship AIS positions | WebSocket | Yes (free) |

---

## 🚀 Step-by-Step Deployment Guide

> This guide is written for someone who has never used GitHub or Vercel before. Follow each step exactly.

### Step 1: Get a Free aisstream.io API Key

1. Go to [https://aisstream.io](https://aisstream.io)
2. Click **Sign Up** (top right)
3. Create an account with your email
4. Once logged in, go to your **Dashboard** or **API Keys** page
5. Click **Generate API Key**
6. **Copy the key** — you'll need it in Step 5

### Step 2: Create a GitHub Account (skip if you have one)

1. Go to [https://github.com](https://github.com)
2. Click **Sign up** and follow the steps
3. Verify your email address

### Step 3: Create a New GitHub Repository

1. Log in to GitHub
2. Click the **+** icon in the top right → **New repository**
3. Name it `defcon-dashboard`
4. Make sure **Public** is selected
5. **Do NOT** check "Add a README file" (we already have one)
6. Click **Create repository**

### Step 4: Upload the Project Files

1. On your new repository page, click **"uploading an existing file"** link
2. Open the `defcondashboard` project folder on your computer
3. Select **ALL** files and folders inside it (Ctrl+A)
4. Drag and drop them onto the GitHub upload area
5. Wait for all files to upload
6. Scroll down, click **Commit changes**

> ⚠️ Make sure you upload the _contents_ of the defcondashboard folder, not the folder itself. GitHub should show files like `app/`, `components/`, `package.json`, etc. at the root level.

### Step 5: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub account
4. On the Vercel dashboard, click **Add New** → **Project**
5. Find `defcon-dashboard` in the list and click **Import**
6. **Before clicking Deploy**, expand **Environment Variables**
7. Add a new variable:
   - **Name**: `NEXT_PUBLIC_AISSTREAM_KEY`
   - **Value**: paste the API key from Step 1
8. Click **Deploy**
9. Wait 1-2 minutes for the build to complete
10. Click the **Visit** button to see your live dashboard!

### Step 6: Bookmark Your Dashboard

1. After deployment, Vercel gives you a URL like `https://defcon-dashboard.vercel.app`
2. Open this URL in your browser
3. Bookmark it — this is your live dashboard!

---

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your aisstream.io API key

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** — App Router + TypeScript
- **MapLibre GL JS** — Map rendering
- **OpenFreeMap** — Map tiles (no API key needed)
- **Tailwind CSS v4** — Styling
- **Vercel** — Hosting

## License

Open source under MIT. Data from ADSB.lol (ODbL) and aisstream.io.
