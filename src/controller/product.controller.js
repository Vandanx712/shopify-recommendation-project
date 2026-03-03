import axios from "axios";
import productModel from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const { shopId } = req.body;
    if (!shopId)
      return res.status(401).json({
        success: false,
        message: "Missing field",
      });
    const products = await axios.get(
      `https://${shopId}/collections/all/products.json`,
    );

    for (const product of products.data.products) {
      await productModel.findOneAndUpdate(
        { shopifyStoreID: shopId },
        {
          shopifyStoreID: shopId,
          id: product.id,
          title: product.title,
          handle: product.handle,
          vendor: product.vendor,
          product_type: product.product_type,
          tags: product.tags,
          options: product.options,
          variants: product.variants,
        },
        { new: true, upsert: true, runValidators: true },
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
