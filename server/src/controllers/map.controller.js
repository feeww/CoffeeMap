import { fetchPlaces } from "../services/osmtile.service.js";

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
