import { CONFIG } from './modules/config.js';
import { state } from './modules/state.js';
import { initMap, flyTo, highlightMarker } from './modules/map.js';
import { loadPlacesForCurrentBounds, searchNominatim } from './modules/api.js';
import { initUI, scrollToList, renderCoffeeList } from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initI18n, t } from './modules/i18n.js';
import { getZoomForRadius, formatAddress } from './modules/utils.js';

document.addEventListener('DOMContentLoaded', init);

function init() {
    initI18n();
    initTheme();
    initMap();
    initUI();

    state.subscribe('locale', () => {
        state.places = state.places.map(place => {
            if (!place.tags) return place;
            return {
                ...place,
                name: place.tags.name || t('unknown_place'),
                address: formatAddress(place.tags)
            };
        });
        state.applyFilters();
    });

    setupEventListeners();

    setTimeout(loadPlacesForCurrentBounds, 500);
}

function setupEventListeners() {


    const locateBtn = document.getElementById('locateBtnSidebar');
    if (locateBtn) {
        locateBtn.replaceWith(locateBtn.cloneNode(true));
        const newBtn = document.getElementById('locateBtnSidebar');
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (state.map) {
                state.setLoading(true);
                state.map.locate({ setView: false, maxZoom: 16 });
                state.map.once('locationfound', (e) => {
                    const radius = e.accuracy;
                    if (state.userMarker) state.map.removeLayer(state.userMarker);
                    if (state.userAccuracyCircle) state.map.removeLayer(state.userAccuracyCircle);

                    state.userMarker = L.marker(e.latlng, {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="pulse"></div>',
                            iconSize: [20, 20]
                        })
                    }).addTo(state.map);

                    flyTo(e.latlng.lat, e.latlng.lng, 16);
                    state.setLoading(false);
                });
                state.map.once('locationerror', (e) => {
                    state.setLoading(false);
                    alert(t('location_error') || 'Location access denied');
                });
            }
        });
    }

    setupSearch();


    document.addEventListener('refresh-map', () => {
        loadPlacesForCurrentBounds(true);
    });
}

window.selectPlace = (id) => {
    state.selectedPlaceId = id;
    state.notify('places', state.filteredPlaces);
    highlightMarker(id);
    scrollToList(id);

    const place = state.places.find(p => p.id === id);
    if (place) {
        flyTo(place.lat, place.lon, 17);
    }
};

function sortPlaces(sortBy) {
    const places = [...state.filteredPlaces];
    if (sortBy === 'distance') {
        places.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'name') {
        places.sort((a, b) => a.name.localeCompare(b.name, state.currentLocale));
    }
    state.setFilteredPlaces(places);
}

function locateUser() {
    if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
    }

    state.setLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            state.userLocation = { lat: latitude, lng: longitude };

            const zoom = getZoomForRadius(state.searchRadius);
            flyTo(latitude, longitude, zoom);
            state.setLoading(false);

            setTimeout(loadPlacesForCurrentBounds, 1500);
        },
        (error) => {
            state.setLoading(false);
            console.error('Geo error', error);
            alert('Cannot determine location. Ensure HTTPS or localhost is used.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const existing = searchInput.parentNode.querySelector('.search-suggestions');
    if (existing) existing.remove();

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    searchInput.parentNode.appendChild(suggestionsContainer);

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            suggestionsContainer.style.display = 'none';
            if (!query) {
                state.setFilteredPlaces([...state.places]);
            } else {
                const normalized = query.toLowerCase();
                const filtered = state.places.filter(place =>
                    place.name.toLowerCase().includes(normalized) ||
                    place.address.toLowerCase().includes(normalized)
                );
                state.setFilteredPlaces(filtered);
            }
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const data = await searchNominatim(query);

                if (data && data.length > 0) {
                    suggestionsContainer.innerHTML = data.map(item => `
                        <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${item.display_name}">
                            <span class="icon">📍</span>
                            <div class="text">${item.display_name}</div>
                        </div>
                    `).join('');
                    suggestionsContainer.style.display = 'block';

                    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const lat = parseFloat(item.dataset.lat);
                            const lon = parseFloat(item.dataset.lon);

                            searchInput.value = item.dataset.name;
                            suggestionsContainer.style.display = 'none';

                            flyTo(lat, lon, 15);
                            setTimeout(() => loadPlacesForCurrentBounds(true), 1500);
                        });
                    });
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } catch (err) {
                console.error("Search error:", err);
            }
        }, 500);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    setupMobileSearch();
}

function setupMobileSearch() {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mobileSearchSuggestions = document.getElementById('mobileSearchSuggestions');
    const searchModal = document.getElementById('searchModal');

    if (!mobileSearchInput || !mobileSearchSuggestions) return;

    let debounceTimer;

    mobileSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            mobileSearchSuggestions.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const data = await searchNominatim(query);

                if (data && data.length > 0) {
                    mobileSearchSuggestions.innerHTML = data.map(item => `
                        <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${item.display_name}">
                            <span class="icon">📍</span>
                            <div class="text">${item.display_name}</div>
                        </div>
                    `).join('');
                    mobileSearchSuggestions.style.display = 'block';

                    mobileSearchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const lat = parseFloat(item.dataset.lat);
                            const lon = parseFloat(item.dataset.lon);

                            mobileSearchInput.value = '';
                            mobileSearchSuggestions.style.display = 'none';
                            if (searchModal) searchModal.classList.remove('active');

                            flyTo(lat, lon, 15);
                            setTimeout(() => loadPlacesForCurrentBounds(true), 1500);
                        });
                    });
                } else {
                    mobileSearchSuggestions.style.display = 'none';
                }
            } catch (err) {
                console.error("Mobile search error:", err);
            }
        }, 500);
    });
}
