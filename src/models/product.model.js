import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    name: { type: String },
    position: Number,
    values: [String],
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    title: String,
    price: { type: Number },
    compare_at_price: Number,
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    shopifyStoreID: { type: String, index: true },

    id: { type: String, index: true },

    title: { type: String },
    handle: { type: String, index: true },

    vendor: { type: String, index: true },
    product_type: { type: String, index: true },

    tags: [
      {
        type: String,
        index: true,
      },
    ],

    options: [optionSchema],

    variants: [variantSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
