# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a GPS speed tracker application built as a single-page web app with a Node.js/Express server. The application consists of:

- **Frontend**: Self-contained HTML file (`index.html`) with embedded CSS and JavaScript
- **Backend**: Express.js server (`server.js`) serving static files and handling SPA routing
- **Core functionality**: Real-time GPS speed tracking using the Geolocation API

### Key Components

- **SpeedTracker class** (`index.html:206-456`): Main JavaScript class handling GPS tracking, speed calculations, distance measurement, and UI updates
- **Express server** (`server.js`): Minimal static file server with SPA fallback routing
- **Responsive UI**: Complete styling and layout embedded in the HTML file

## Development Commands

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start
# or
node server.js
```

The server runs on port 3000 by default (configurable via PORT environment variable).

## Application Features

- Real-time GPS speed tracking with high accuracy positioning
- Speed unit conversion (km/h ↔ mph)
- Trip statistics: max speed, average speed, distance traveled, duration
- Distance calculation using Haversine formula for Earth's curvature
- Error handling for GPS permissions and positioning failures
- Responsive design with modern UI

## Technical Details

- GPS data acquired via `navigator.geolocation.watchPosition()`
- Speed values converted from m/s to km/h or mph for display
- Distance tracking accumulates using great-circle distance calculations
- No external JavaScript dependencies - vanilla JavaScript implementation
- All assets (HTML, CSS, JS) contained in single `index.html` file