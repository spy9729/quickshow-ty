import { clerkClient } from "@clerk/express";
export const protectAdmin = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthenticated" });
            return;
        }
        const user = await clerkClient.users.getUser(userId);
        if (user.privateMetadata?.role !== "admin") {
            res.status(403).json({ success: false, message: "Not authorized!" });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
};
