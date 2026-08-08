import express from "express";
import { createbooking, getOccupiedSeats, } from "../controllers/bookingController.js";
const bookingRouter = express.Router();
bookingRouter.post("/create", createbooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
export default bookingRouter;
