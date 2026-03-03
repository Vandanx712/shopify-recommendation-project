import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    shopifyStoreID:{ type: String, index: true },

    orderId: { type: String, index:true },
    totalValue: Number,
    currency: String,
    tax: Number,
    shipping: Number,
    discount: Number,

    items: [
      {
        productId: String,
        variantId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    purchasedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
