import express from "express";
import mapRoutes from "./routes/map.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api/map", mapRoutes);
app.use(errorHandler);

export default app;
