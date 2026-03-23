import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

// Load environment variables (.env file)
dotenv.config();

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
