import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  shopifyStoreID:{ type: String, index: true },

  startedAt: { type: Date, default: Date.now },
  endedAt: Date,

  landingPage: String,
  
  pageViews: { type: Number, default: 0 },
  productsViewed: { type: Number, default: 0 },
  addedToCartCount: { type: Number, default: 0 },

  checkoutStarted: { type: Boolean, default: false },
  checkoutCompleted: { type: Boolean, default: false },
  purchased: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);