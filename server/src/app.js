import express from "express";
import cors from "cors";
import mapRoutes from "./routes/map.routes.js";
import errorHandler from "./middleware/errorHandler.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../client')));

app.use("/api/map", mapRoutes);
app.use(errorHandler);

export default app;
