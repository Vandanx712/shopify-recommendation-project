import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      index: true,
    },
    shopifyStoreID:{ type: String, index: true },

    eventType: {
      type: String,
      enum: [
        "page_view",
        "view_product",
        "add_to_cart",
        "checkout_started",
        "checkout_completed",
        "purchase",
      ],
      index: true,
    },

    page: {
      url: String,
      title: String,
    },

    product: {
      productId: String,
      variantId: String,
      name: String,
      price: Number,
      quantity: { type: Number, default: 0 },
    },

    checkout: {
      checkoutId: { type: String, default: "" },
      totalValue: Number,
      currency: String,
      products: [
        {
          productId: String,
          variantId: String,
          title: String,
          quantity: Number,
          price: Number,
          currency: String,
        },
      ],
    },

    order: {
      orderId: String,
      totalValue: Number,
      tax: Number,
      shipping: Number,
      discount: Number,
      products: [
        {
          productId: String,
          variantId: String,
          title: String,
          quantity: Number,
          price: Number,
          currency: String,
        },
      ],
    },
  },
  { timestamps: true },
);

eventSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Event", eventSchema);
