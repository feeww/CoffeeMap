import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`☕CoffeeMap API server running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/api/map/places?south=50.4&west=30.4&north=50.5&east=30.6`);
});