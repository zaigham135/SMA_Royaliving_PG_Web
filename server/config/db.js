import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ⚠️ Node.js Driver v4+ میں options کی ضرورت نہیں ہے
      // useNewUrlParser اور useUnifiedTopology ہٹا دیں
    });
    console.log("✅ MongoDB Atlas Connected...");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
