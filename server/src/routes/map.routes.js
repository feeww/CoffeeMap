import { Router } from "express";
import { getPlaces } from "../controllers/map.controller.js";

const router = Router();

router.get("/places", getPlaces);

export default router;
