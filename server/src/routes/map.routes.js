import { Router } from "express";
import { getPlaces, searchLocation } from "../controllers/map.controller.js";

const router = Router();

router.get("/places", getPlaces);
router.get("/search", searchLocation);

export default router;
