import { Request, Response } from "express";
import stripe from "stripe";
import connectDB from "../config/db.js"; // 1. Import your DB connection helper
import Booking from "../models/Booking.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export const stripeWebhooks = async (
  request: Request,
  response: Response,
): Promise<void> => {
  // 2. Ensure database is connected in Vercel serverless context
  await connectDB();

  const sig = request.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!sig || !webhookSecret) {
    response.status(400).send("Webhook Error: Missing signature or secret");
    return;
  }

  let event: stripe.Event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      webhookSecret,
    );
  } catch (error) {
    console.error("Signature Verification Failed:", (error as Error).message);
    response.status(400).send(`Webhook Error: ${(error as Error).message}`);
    return;
  }

  const session = event.data.object as stripe.Checkout.Session;

  // 3. Filter out events from other apps
  if (session.metadata?.appName !== "movie-ticket-booking-ty") {
    response.status(200).json({ received: true, ignored: true });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        // 4. Store and log the returned document to verify existence
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            isPaid: true,
            paymentLink: "",
          },
          { new: true }, // returns the updated document
        );

        if (!updatedBooking) {
          console.error(
            `❌ DB Error: Booking ID ${bookingId} was not found in MongoDB. It may have been deleted or created in a different database.`,
          );
        } else {
          console.log(
            `✅ Success: Booking ${bookingId} isPaid updated to true.`,
          );
        }
      }
    }

    response.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    response.status(500).send("Internal server error!");
  }
};
