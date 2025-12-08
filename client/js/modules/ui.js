import { state } from './state.js';
import { formatDistance } from './utils.js';
import { t } from './i18n.js';

export function initUI() {
    renderCoffeeList(state.filteredPlaces);

    state.subscribe('places', renderCoffeeList);
    state.subscribe('loading', toggleLoading);
    state.subscribe('radius', updateRadiusLabel);
    state.subscribe('locale', updateStaticTranslations);
    state.subscribe('theme', updateStaticTranslations);

    setupEventListeners();

    updateStaticTranslations();
}

function setupEventListeners() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
            state.setTheme(newTheme);
        };
    }

    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.onclick = () => {
            const newLocale = state.currentLocale === 'uk' ? 'en' : 'uk';
            state.setLocale(newLocale);
        };
    }

    const unknownToggle = document.getElementById('showUnknownToggle');
    if (unknownToggle) {
        unknownToggle.checked = state.showUnknown;
        unknownToggle.onchange = (e) => {
            state.setShowUnknown(e.target.checked);
        };
    }

    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchModalClose = document.getElementById('searchModalClose');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    if (mobileSearchBtn && searchModal) {
        mobileSearchBtn.onclick = () => {
            searchModal.classList.add('active');
            if (mobileSearchInput) mobileSearchInput.focus();
        };

        if (searchModalClose) {
            searchModalClose.onclick = () => {
                searchModal.classList.remove('active');
            };
        }

        searchModal.onclick = (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        };
    }

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle-area';
        dragHandle.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 30px; cursor: pointer; z-index: 10;';
        sidebar.prepend(dragHandle);

        dragHandle.onclick = () => {
            sidebar.classList.toggle('minimized');
        };
    }

    const headerControls = document.querySelector('.header-controls');
    if (headerControls && !document.getElementById('scanModeToggle')) {
                    const toggleBtn = document.createElement('div');
                                toggleBtn.className = 'control-btn';
                                toggleBtn.id = 'scanModeToggle';
                                toggleBtn.title = t('scan_mode_auto_tooltip');
                                toggleBtn.innerHTML = '🔄 ' + t('mode_auto');
                                toggleBtn.onclick = () => {
                                    const newMode = state.scanMode === 'auto' ? 'manual' : 'auto';
                                    state.setScanMode(newMode);
                                    toggleBtn.innerHTML = newMode === 'auto' ? '🔄 ' + t('mode_auto') : '✋ ' + t('mode_manual');
                                    toggleBtn.title = newMode === 'auto' ? t('scan_mode_auto_tooltip') : t('scan_mode_manual_tooltip');
                    
                                    if (newMode === 'auto') {
                                        const refreshBtn = document.getElementById('mapRefreshBtn');
                                        if (refreshBtn) refreshBtn.style.display = 'none';
                                        document.dispatchEvent(new Event('refresh-map'));
                                    }
                                };                    headerControls.appendChild(toggleBtn);
                }
        
                if (!document.getElementById('mapRefreshBtn')) {
                    const mapWrapper = document.querySelector('.map-wrapper');
                    if (mapWrapper) {
                        const btn = document.createElement('button');
                        btn.id = 'mapRefreshBtn';
                        btn.className = 'map-refresh-btn';
                        btn.innerHTML = '🔍 ' + t('search_button_label');
                        btn.style.display = 'none';            btn.onclick = () => {
                document.dispatchEvent(new Event('refresh-map'));
                btn.style.display = 'none';
            };
            mapWrapper.appendChild(btn);
        }
    }

    document.addEventListener('show-refresh-btn', () => {
        const btn = document.getElementById('mapRefreshBtn');
        if (btn) btn.style.display = 'block';
    });
}

function updateRadiusLabel(radius) {
    const label = document.getElementById('radiusLabel');
    if (label) {
        label.textContent = `${(radius / 1000).toFixed(1)} км`;
    }
}

function toggleLoading(isLoading) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (isLoading) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

export function renderCoffeeList(places) {
    const container = document.getElementById('coffeeList');
    if (!container) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }

    updateResultsCount(places.length);

    if (!places || places.length === 0) {
        showEmptyState(t('not_found'));
        return;
    }

    container.innerHTML = places.map(place => `
        <div class="card ${place.id === state.selectedPlaceId ? 'active' : ''}" 
             id="place-${place.id}" 
             data-place-id="${place.id}">
            
            <div class="card-left">
                <h3>${place.name}</h3>
                <p class="address">${place.address ? place.address : ''}</p>
            </div>

            <div class="card-right">
                <div class="distance">${formatDistance(place.distance)}</div>
                ${place.opening_hours ? `<div class="time">${place.opening_hours}</div>` : ''}
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const placeId = parseInt(card.dataset.placeId, 10);
            window.selectPlace(placeId);
        });
    });
}

function updateResultsCount(count) {
    const el = document.getElementById('resultsCount');
    if (!el) return;

    const text = state.currentLocale === 'uk'
        ? `${count} кав'ярень знайдено`
        : `${count} coffee shops found`;
    el.textContent = text;
}

function showEmptyState(message) {
    const container = document.getElementById('coffeeList');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 40px 20px; color: var(--text-light);">
            <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;">☕</div>
            <h3>${message}</h3>
            <p style="font-size: 0.9em;">${t('try_change_radius')}</p>
        </div>
    `;
}

export function updateStaticTranslations() {
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        if (state.currentLocale === 'uk') {
            langBtn.innerHTML = `<img src="https://flagcdn.com/w40/ua.png" class="flag" style="width:20px;"> <span>UKR</span>`;
        } else {
            langBtn.innerHTML = `<img src="https://flagcdn.com/w40/gb.png" class="flag" style="width:20px;"> <span>ENG</span>`;
        }
    }

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.innerHTML = state.currentTheme === 'dark' ? '☀️' : '🌙';
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = t('search_placeholder'); 
    }

    const locateBtn = document.getElementById('locateBtnSidebar');
    if (locateBtn) {
        locateBtn.innerHTML = `📍 ${t('find_me')}`;
    }

    const labelUnknown = document.getElementById('labelUnknown');
    if (labelUnknown) {
        labelUnknown.textContent = t('filter_unknown');
    }

    const scanModeToggle = document.getElementById('scanModeToggle');
    if (scanModeToggle) {
        const currentMode = state.scanMode;
        scanModeToggle.innerHTML = currentMode === 'auto' ? '🔄 ' + t('mode_auto') : '✋ ' + t('mode_manual');
        scanModeToggle.title = currentMode === 'auto' ? t('scan_mode_auto_tooltip') : t('scan_mode_manual_tooltip');
    }

    const mapRefreshBtn = document.getElementById('mapRefreshBtn');
    if (mapRefreshBtn) {
        mapRefreshBtn.innerHTML = '🔍 ' + t('search_button_label');
    }

    renderCoffeeList(state.filteredPlaces);
}

export function scrollToList(placeId) {
    const item = document.getElementById(`place-${placeId}`);
    if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        item.classList.add('active');
    }
}
