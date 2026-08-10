import { clerkClient, getAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
// API to get user bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth?.userId;
        const bookings = await Booking.find({ user })
            .populate({
            path: "show",
            populate: { path: "movie" },
        })
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
// API to update movie to favorite list in clerk metadata
export const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthenticated" });
            return;
        }
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.privateMetadata.favorites || [];
        let updatedFavorites;
        if (!favorites.includes(movieId)) {
            updatedFavorites = [...favorites, movieId];
        }
        else {
            updatedFavorites = favorites.filter((item) => item !== movieId);
        }
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: user.privateMetadata,
        });
        res.json({ success: true, message: "Favorite movies updated!" });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
// API to get all the favorites movies
export const getFavorites = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        console.log("UserId from Clerk:", userId);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthenticated" });
            return;
        }
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.privateMetadata.favorites || [];
        // get movies from database
        const movies = await Movie.find({ _id: { $in: favorites } });
        res.json({ success: true, movies });
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
