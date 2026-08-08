import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected!"),
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/quickshow-ty`);
  } catch (error) {
    console.log("Database connection error:", (error as Error).message);
  }
};

export default connectDB;
