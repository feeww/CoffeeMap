import { CONFIG } from './config.js';
import { state } from './state.js';
import { debounce } from './utils.js';
import { loadPlacesForCurrentBounds } from './api.js';
import { t } from './i18n.js';

export function initMap() {
    state.map = L.map('map').setView(CONFIG.defaultCenter, CONFIG.defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);

    state.markerLayer = L.layerGroup().addTo(state.map);

    state.map.on('moveend', debounce(() => {
        if (state.scanMode === 'manual') {
            document.dispatchEvent(new Event('show-refresh-btn'));
            return;
        }

        if (state.places.length > 0) {
            loadPlacesForCurrentBounds();
        } else {
            loadPlacesForCurrentBounds();
        }
    }, CONFIG.debounceDelay));

    state.subscribe('places', renderMarkers);
}

export function flyTo(lat, lon, zoom) {
    if (state.map) {
        state.map.flyTo([lat, lon], zoom);
    }
}

function renderMarkers(places) {
    if (!state.map || !state.markerLayer) return;

    state.markerLayer.clearLayers();
    state.markers = [];

    places.forEach(place => {
        const isActive = place.id === state.selectedPlaceId;
        const marker = L.marker([place.lat, place.lon], {
            icon: createMarkerIcon(isActive)
        });

        let query;
        const hasValidAddress = place.address &&
            place.address !== t('address_unknown') &&
            /\d/.test(place.address);

        if (hasValidAddress) {
            query = `${place.name}, ${place.address}`;
        } else {
            query = `${place.lat},${place.lon}`;
        }

        const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        const googleDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

        marker.bindPopup(`
            <div class="popup-content">
                <h4>${place.name}</h4>
                <p>${place.address}</p>
                <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
                    <button onclick="window.open('${googleSearchUrl}', '_blank')" 
                            style="padding:4px 8px; cursor:pointer;" class="locate-btn">
                        🔗 ${t('view_on_google')}
                    </button>
                </div>
            </div>
        `);

        marker.on('click', () => {
            state.selectedPlaceId = place.id;
            document.dispatchEvent(new CustomEvent('place-selected', { detail: place.id }));
        });

        marker.addTo(state.markerLayer);
        state.markers.push({ id: place.id, marker });
    });
}

function createMarkerIcon(isActive = false) {
    return L.divIcon({
        className: `custom-map-marker ${isActive ? 'active-marker' : ''}`,
        html: '☕',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
}

export function highlightMarker(placeId) {
    const markerObj = state.markers.find(m => m.id === placeId);
    if (markerObj) {
        markerObj.marker.setIcon(createMarkerIcon(true));
        markerObj.marker.setZIndexOffset(1000);
    }

    state.markers.filter(m => m.id !== placeId).forEach(m => {
        m.marker.setIcon(createMarkerIcon(false));
        m.marker.setZIndexOffset(0);
    });
}
