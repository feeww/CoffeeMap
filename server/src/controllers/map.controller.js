import { fetchPlaces } from "../services/osmtile.service.js";
import fetch from "../utils/fetch.js";

export async function getPlaces(req, res, next) {
    try {
        const { south, west, north, east } = req.query;
        if (!south || !west || !north || !east) {
            return res.status(400).json({ error: "Missing bounds" });
        }
        const data = await fetchPlaces(south, west, north, east);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function searchLocation(req, res, next) {
    try {
        const { q } = req.query;
        if (!q || q.length < 3) {
            return res.json([]);
        }
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CoffeeMap/1.0 (https://github.com/your-repo)'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Nominatim proxy error:', err);
        res.json([]);
    }
}
