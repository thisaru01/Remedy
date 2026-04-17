import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // eslint-disable-next-line no-console
    console.log(`MongoDB Connected (ai-service): ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI service database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
