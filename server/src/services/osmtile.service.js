import fetch from "../utils/fetch.js";

export async function fetchPlaces(south, west, north, east) {
  const query = `
        [out:json];
        (
          node["amenity"="cafe"](${south},${west},${north},${east});
          way["amenity"="cafe"](${south},${west},${north},${east});
          relation["amenity"="cafe"](${south},${west},${north},${east});
          node["cuisine"="coffee_shop"](${south},${west},${north},${east});
          way["cuisine"="coffee_shop"](${south},${west},${north},${east});
          node["shop"="coffee"](${south},${west},${north},${east});
          way["shop"="coffee"](${south},${west},${north},${east});
        );
        out center;
    `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  return await fetch(url).then(r => r.json()).catch(err => ({ elements: [] }));
}
