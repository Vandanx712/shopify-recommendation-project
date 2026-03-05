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

    let page = 1;
    const allproducts = [];

    while (true) {
      const response = await axios.get(
        `https://${shopId}/products.json?limit=250&page=${page}`,
      );

      const products = response.data.products;

      if (!products || products.length === 0) break;

      allproducts.push(...products);

      page++;
    }

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

    const flaskFormat = {
      store_id: shopId,
      products: [],
    };

    allproducts.forEach((product) => {
      flaskFormat.products.push({
        id: product.id.toString(),
        store_id: shopId,
        title: product.title,
        product_type: product.product_type,
        vendor: product.vendor,
        tags: product.tags,
        options: product.options.map((opt) => {
          return { name: opt.name, values: opt.values };
        }),
        price: Number(product.variants[0].price),
      });
    });

    await axios.post(`${process.env.FLASK_URL}/v1/sync/bulk`, flaskFormat);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
