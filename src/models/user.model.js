import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    shopifyCustomerId: { type: String, index: true },
    anonymousId: { type: String, index: true }, // for guest users
    email: { type: String, index: true },

    shopifyStoreID:{ type: String, index: true },

    totalSessions: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },

    deviceInfo: {
      deviceType: String,
      browser: String,
    }
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
