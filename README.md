# CoffeeMap

A modern web application for discovering coffee shops and cafés near you. Built with vanilla JavaScript, Leaflet.js, and Express.js.

![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)

---

## Features

- **Interactive Map** — Real-time café discovery powered by OpenStreetMap data
- **Location Search** — Geocoding with address autocomplete
- **Geolocation** — Find coffee shops near your current position
- **Dual Theme Support** — Light and dark mode with smooth transitions
- **Internationalization** — English and Ukrainian language support
- **Mobile-First Design** — Responsive bottom sheet interface for mobile devices
- **Configurable Scan Mode** — Automatic or manual map refresh control

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/feeww/CoffeeMap.git
cd CoffeeMap

# Install server dependencies
cd server
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Architecture

CoffeeMap implements a client-server architecture where the backend serves as a proxy for external mapping APIs, handling rate limiting and CORS restrictions.

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Client    │───▶│   Server     │───▶│  Overpass API    │
│  (Leaflet)  │     │  (Express)  │     │  (OSM Data)      │
└─────────────┘     └─────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  Nominatim API   │
                    │  (Geocoding)     │
                    └──────────────────┘
```

### Project Structure

```
CoffeeMap/
├── client/                 # Frontend application
│   ├── js/
│   │   ├── modules/        # Application modules (api, state, ui, map, i18n)
│   │   └── app.js          # Entry point
│   ├── styles/
│   │   └── style.css       # Stylesheets with theming support
│   └── index.html
│
├── server/                 # Backend API (Express.js)
│   └── src/
│       ├── controllers/    # Request handlers
│       ├── services/       # External API integrations
│       └── routes/         # Route definitions
│
└── docs/                   # Documentation
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/map/places` | Retrieve cafés within specified bounds |
| GET | `/api/map/search` | Search locations (Nominatim proxy) |

### Request Examples

```bash
# Get places within bounds
curl "http://localhost:3000/api/map/places?south=50.4&west=30.4&north=50.5&east=30.6"

# Search for a location
curl "http://localhost:3000/api/map/search?q=Kyiv"
```

---

## Configuration

Application settings are defined in `client/js/modules/config.js`:

```javascript
export const CONFIG = {
    defaultCenter: [50.4501, 30.5234],  // Default map center (Kyiv)
    defaultZoom: 14,
    apiBase: 'http://localhost:3000/api/map',
    maxVisiblePlaces: 1000,
    defaultTheme: 'dark',
    defaultLocale: 'uk'
};
```

---

## Tech Stack

- **Frontend**: Vanilla JavaScript, Leaflet.js, CSS3
- **Backend**: Node.js, Express.js
- **Data Sources**: OpenStreetMap (Overpass API), Nominatim
- **Fonts**: Inter (Google Fonts)

---

## License

This project is licensed under the MIT License.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request