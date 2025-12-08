import { CONFIG } from './config.js';
import { state } from './state.js';
import { calculateDistance, formatAddress, hasValidAddress } from './utils.js';
import { t } from './i18n.js';

export async function loadPlacesForCurrentBounds(force = false) {
    if (state.isLoading || !state.map) return;

    const bounds = state.map.getBounds();
    state.setLoading(true);

    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    const query = `
        [out:json];
        (
          node["amenity"="cafe"](${south},${west},${north},${east});
          way["amenity"="cafe"](${south},${west},${north},${east});
          relation["amenity"="cafe"](${south},${west},${north},${east});
          node["cuisine"="coffee_shop"](${south},${west},${north},${east});
          way["cuisine"="coffee_shop"](${south},${west},${north},${east});
          node["shop"="coffee"](${south},${west},${north},${east});
          way["shop"="coffee"](${south},${west},${north},${east});
        );
        out center;
    `;
    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.elements) {
                const places = data.elements
                    .filter(el => el.tags && el.tags.name)
                    .filter(el => isCoffeeRelated(el.tags))
                    .map(transformPlace)
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, CONFIG.maxVisiblePlaces);

                state.setPlaces(places);
            }
        })
        .catch(error => {
            console.error('Error loading places from Overpass:', error);
            // In case of error, set places to an empty array to clear the list
            state.setPlaces([]);
        })
        .finally(() => state.setLoading(false));
}

export async function searchNominatim(query) {
    if (query.length < 3) return [];

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
        const response = await fetch(url);
        if (!response.ok) {
            console.warn('Search response not ok:', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

const COFFEE_REGEX = new RegExp("(coffee|espresso|latte|кава|кав['`]ярня|капучіно|kava|kaviarnia|kapuchino)", 'i');

function isCoffeeRelated(tags) {
    if (!tags) return false;
    if (tags.cuisine === 'coffee_shop') return true;
    if (tags.shop === 'coffee') return true;
    if (tags.amenity === 'cafe') {
        const name = (tags.name || '').toLowerCase();
        return COFFEE_REGEX.test(name);
    }
}

function transformPlace(place) {
    const tags = place.tags || {};
    const lat = place.lat || (place.center && place.center.lat);
    const lon = place.lon || (place.center && place.center.lon);

    return {
        id: place.id,
        name: tags.name || t('unknown_place'),
        address: formatAddress(tags),
        lat: lat,
        lon: lon,
        rating: tags.rating || null,
        reviewCount: tags.review_count || 0,
        opening_hours: tags.opening_hours || null,
        hasValidAddress: hasValidAddress(tags),
        type: place.type,
        distance: calculateDistance(lat, lon, state.map.getCenter().lat, state.map.getCenter().lng),
        tags: tags
    };
}
