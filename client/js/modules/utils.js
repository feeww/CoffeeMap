import { t } from './i18n.js';

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} ${t('unit_m')}`;
    }
    return `${(meters / 1000).toFixed(1)} ${t('unit_km')}`;
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function getZoomForRadius(radius) {
    if (radius <= 1000) return 16;
    if (radius <= 2000) return 15;
    if (radius <= 3000) return 14;
    if (radius <= 5000) return 13;
    return 12;
}

export function formatAddress(tags) {
    const parts = [];
    if (tags['addr:street']) {
        parts.push(tags['addr:street']);
        if (tags['addr:housenumber']) {
            parts.push(tags['addr:housenumber']);
        }
    }
    return parts.length > 0 ? parts.join(', ') : t('address_unknown');
}

export function hasValidAddress(tags) {
    return !!tags['addr:street'];
}
