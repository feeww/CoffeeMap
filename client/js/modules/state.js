export const state = {
    places: [],
    filteredPlaces: [],
    selectedPlaceId: null,
    searchRadius: 2000,
    searchQuery: '',
    isLoading: false,
    currentTheme: 'light',
    currentLocale: 'uk',
    map: null,
    markerLayer: null,
    markers: [],
    lastBounds: null,
    userLocation: null,
    scanMode: 'auto',
    showUnknown: false,

    listeners: {},

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    },

    setPlaces(places) {
        this.places = places;
        this.applyFilters();
    },

    setFilter(filter) {
        if (filter.searchQuery !== undefined) this.searchQuery = filter.searchQuery;
        this.applyFilters();
    },

    setShowUnknown(show) {
        this.showUnknown = show;
        this.applyFilters();
    },

    applyFilters() {
        let result = this.places;

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.address.toLowerCase().includes(q)
            );
        }

        if (!this.showUnknown) {
            result = result.filter(p => p.hasValidAddress);
        }

        this.setFilteredPlaces(result);
    },

    setFilteredPlaces(places) {
        this.filteredPlaces = places;
        this.notify('places', this.filteredPlaces);
    },

    setLoading(loading) {
        this.isLoading = loading;
        this.notify('loading', loading);
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.notify('theme', theme);
    },

    setLocale(locale) {
        this.currentLocale = locale;
        this.notify('locale', locale);
    },

    setScanMode(mode) {
        this.scanMode = mode;
        this.notify('scanMode', mode);
    }
};

const savedTheme = localStorage.getItem('theme') || 'light';
state.setTheme(savedTheme);
