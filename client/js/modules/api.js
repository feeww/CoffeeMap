import { CONFIG } from './config.js';
import { state } from './state.js';
import { calculateDistance, formatAddress, hasValidAddress } from './utils.js';
import { t } from './i18n.js';

export async function loadPlacesForCurrentBounds(force = false) {
    if (state.isLoading || !state.map) return;

    const bounds = state.map.getBounds();
    const boundsKey = `${bounds.getSouth().toFixed(3)},${bounds.getWest().toFixed(3)},${bounds.getNorth().toFixed(3)},${bounds.getEast().toFixed(3)}`;

    // if (!force && boundsKey === state.lastBounds) return; // Removed aggressive bounds caching
    // state.lastBounds = boundsKey; // No longer needed without bounds caching

    state.setLoading(true);

    const url = `${CONFIG.apiBase}/places?south=${bounds.getSouth()}&west=${bounds.getWest()}&north=${bounds.getNorth()}&east=${bounds.getEast()}`;

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
        .catch(error => console.error('Error loading places:', error))
        .finally(() => state.setLoading(false));
}

export async function searchNominatim(query) {
    if (query.length < 3) return [];

    try {
        const response = await fetch(
            `${CONFIG.apiBase}/search?q=${encodeURIComponent(query)}`
        );
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
