import { state } from './state.js';

const dictionaries = {
    uk: {
        title: "CoffeeMap - Знайди ідеальну каву поруч",
        header_title: "CoffeeMap",
        search_placeholder: "Введіть адресу або назву кав'ярні...",
        sidebar_title: "Кав'ярні поруч",
        loading: "Завантаження...",
        radius: "Радіус:",
        sort_distance: "🚶 Найближчі",
        sort_name: "🔤 За назвою",
        sort_rating: "⭐ За рейтингом",
        filter_all: "Всі оцінки",
        filter_3plus: "3+ зірки",
        filter_4plus: "4+ зірки",
        filter_45plus: "4.5+ зірок",
        find_me: "Знайти мене",
        refresh: "Оновити зону",
        searching: "Шукаємо кав'ярні...",
        not_found: "Кав'ярень не знайдено",
        try_change_radius: "Спробуйте змінити радіус пошуку",
        address_unknown: "📍 Локація на карті",
        filter_unknown: "Можливі місця",
        unknown_place: "Невідома кав'ярня",
        geo_error: "Геолокація не підтримується",
        geo_blocked: "Доступ до геолокації заблоковано",
        geo_unavailable: "Неможливо визначити локацію",
        geo_timeout: "Час очікування вичерпано",
        get_directions: "Як дійти (Google Maps)",
        view_on_google: "Переглянути в Google Maps",
        settings: "Налаштування",
        theme: "Тема",
        language: "Мова",
        theme_light: "Світла",
        theme_dark: "Темна",
        unit_m: "м",
        unit_km: "км",
        search_button_label: "Шукати тут",
        mode_manual: "Ручний",
        mode_auto: "Авто",
        scan_mode_label: "Режим сканування",
        scan_mode_auto_tooltip: "Автоматично шукати кав'ярні при переміщенні мапи",
        scan_mode_manual_tooltip: "Шукати кав'ярні лише при натисканні кнопки"
    },
    en: {
        title: "CoffeeMap - Find perfect coffee nearby",
        header_title: "CoffeeMap",
        search_placeholder: "Enter address or coffee shop name...",
        sidebar_title: "Coffee Nearby",
        loading: "Loading...",
        radius: "Radius:",
        sort_distance: "🚶 Nearest",
        sort_name: "🔤 By Name",
        sort_rating: "⭐ By Rating",
        filter_all: "All Ratings",
        filter_3plus: "3+ Stars",
        filter_4plus: "4+ Stars",
        filter_45plus: "4.5+ Stars",
        find_me: "Find Me",
        refresh: "Refresh Area",
        searching: "Searching for coffee shops...",
        not_found: "No coffee shops found",
        try_change_radius: "Try changing the search radius",
        address_unknown: "📍 Location on map",
        filter_unknown: "Possible locations",
        unknown_place: "Unknown Coffee Shop",
        geo_error: "Geolocation not supported",
        geo_blocked: "Geolocation access obstructed",
        geo_unavailable: "Cannot determine location",
        geo_timeout: "Geolocation timeout",
        get_directions: "Get Directions",
        view_on_google: "View on Google Maps",
        settings: "Settings",
        theme: "Theme",
        language: "Language",
        theme_light: "Light",
        theme_dark: "Dark",
        unit_m: "m",
        unit_km: "km",
        search_button_label: "Search here",
        mode_manual: "Manual",
        mode_auto: "Auto",
        scan_mode_label: "Scan mode",
        scan_mode_auto_tooltip: "Automatically search for coffee shops when moving the map",
        scan_mode_manual_tooltip: "Search for coffee shops only when button is pressed"
    }
};

export function t(key) {
    const locale = state.currentLocale;
    return dictionaries[locale][key] || key;
}

export function initI18n() {
    updateTranslations();
    state.subscribe('locale', updateTranslations);
}

function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
            element.placeholder = t(key);
        } else {
            element.textContent = t(key);
        }
    });
}
