import fetch from "../utils/fetch.js";

export async function fetchPlaces(south, west, north, east) {
    const query = `
        [out:json];
        (
          node["amenity"="cafe"](${south},${west},${north},${east});
          node["amenity"="restaurant"](${south},${west},${north},${east});
          node["amenity"="fast_food"](${south},${west},${north},${east});
          node["amenity"="bar"](${south},${west},${north},${east});
          node["amenity"="pub"](${south},${west},${north},${east});
          node["amenity"="food_court"](${south},${west},${north},${east});
        );
        out;
    `;
    const url ="https://overpass-api.de/api/interpreter?data="+encodeURIComponent(query);
    return await fetch(url).then(r=>r.json()).catch(err=>[]);
}
