import { Request, Response } from "express";
import { inngest } from "../inngest/index.js";

export const handleClerkWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { type, data } = req.body;

    if (type && data) {
      // Maps Clerk event types (e.g. 'user.created' -> 'clerk/user.created')
      await inngest.send({
        name: `clerk/${type}`,
        data: data,
      });
      console.log(
        `Successfully forwarded Clerk event 'clerk/${type}' to Inngest`,
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Clerk Webhook Handling Error:", error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
