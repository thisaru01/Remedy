import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Telemedicine service running on port ${PORT}`);
});
