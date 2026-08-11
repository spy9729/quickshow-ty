import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../config/nodeMailer.js";
import connectDB from "../config/db.js";

export const inngest = new Inngest({ id: "movie-ticket-booking-ty" });

// Inngest function to save user to database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    await connectDB();
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    await User.create({
      _id: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
  },
);

// Inngest function to delete a user from database
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: { event: "clerk/user.deleted" },
  },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    await connectDB();
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    await User.findByIdAndUpdate(id, {
      email: email_addresses[0]?.email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
  },
);

// Inngest function to cancel booking and release seats after 10 mins of booking made but payment not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: { event: "ty-app/checkpayment" },
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      // If payment is not made release seats and elete bookings
      if (!booking || booking.isPaid) return;
      const show = await Show.findById(booking.show);
      booking.bookedSeats.forEach(
        (seat: string) => delete show.occupiedSeats[seat],
      );

      show.markModified("occupiedSeats");
      await show.save();
      await Booking.findByIdAndDelete(booking._id);
    });
  },
);

// Inngest function to sen email when booking is confirmed
const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: { event: "ty-app/show.booked" },
  },
  async ({ event, step }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate({ path: "user", model: "User" });

    // 🛑 Guard against missing booking or missing user record
    if (!booking || !booking.user) {
      console.error(`[Inngest] Booking or User not found for ID: ${bookingId}`);
      return;
    }

    const userName = booking.user.name || "Customer";
    const userEmail = booking.user.email;

    if (!userEmail) {
      console.error(
        `[Inngest] User email missing for booking ID: ${bookingId}`,
      );
      return;
    }

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked! `,
      body: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;"> <h2>Hi ${booking.user.name}, </h2>
              <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
              <p>
              </p>
              <strong>Date: </strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}<br/>
              <strong>Time:</strong> ${new Date(
                booking.show.showDateTime,
              ).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
              <p>Enjoy the show! 🍿</p>
              <p>Thanks for booking with us!<br/>- Dev.Shubham Team</p>
            </div>`,
    });
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
];
