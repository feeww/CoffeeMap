import { state } from './state.js';
import { CONFIG } from './config.js';

export function initTheme() {
    applyTheme(state.currentTheme);
    state.subscribe('theme', applyTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (state.map) {
        // If we had different tile providers, we would switch them here
        // const tileUrl = theme === 'dark' ? DARK_TILES : LIGHT_TILES;
        // state.tileLayer.setUrl(tileUrl);
    }
}
