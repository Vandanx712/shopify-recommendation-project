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

    const allproducts = products.data.products;
    const operations = allproducts.map((product) => ({
      updateOne: {
        filter: { shopifyStoreID: shopId, id: product.id },
        update: {
          $set: {
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
        },
        upsert: true,
      },
    }));

    await productModel.bulkWrite(operations);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
