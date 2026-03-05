import axios from "axios";
import eventsModel from "../models/events.model.js";
import userModel from "../models/user.model.js";

export const createUser = async (req, res) => {
  try {
    const {
      shopifyCustomerId,
      shopifyStoreID,
      anonymousId,
      email,
      deviceInfo,
    } = req.body;

    const exictedUser = await userModel
      .findOne({ $or: [{ email: email }, { anonymousId: anonymousId }] })
      .select("_id")
      .lean();

    if (exictedUser) {
      return res.status(200).json({
        success: true,
      });
    }

    const newuser = await userModel.create({
      shopifyCustomerId: shopifyCustomerId ?? "",
      shopifyStoreID: shopifyStoreID,
      email: email ?? "",
      anonymousId: anonymousId,
      deviceInfo: deviceInfo,
    });

    return res.status(200).json({
      success: true,
      newuser,
    });
  } catch (error) {
    console.log(error);
  }
};

export const recommendation = async (req, res) => {
  const { shopId, userId } = req.body;

  const allevents = await eventsModel
    .find({ shopifyStoreID: shopId, userId: userId })
    .lean();

  const purchased = [];
  const add_to_cart = [];
  const viewed = [];

  allevents.forEach((event) => {
    if (event.eventType == "view_product") viewed.push(event.product.productId);
    else if (event.eventType == "add_to_cart")
      add_to_cart.push(event.product.productId);
    else if (event.eventType == "purchase")
      purchased.push(
        event.order.products.reduce((arr, pro) => {
          pro.productId;
          return arr;
        }, ""),
      );
  });

  const response = await axios.post(
    `${process.env.FLASK_URL}/v1/recommend/user`,
    {
      store_id: shopId,
      purchased,
      add_to_cart,
      viewed,
    },
  );

  return res.status(200).json({
    products: response.data.items,
  });
};

export const similarProducts = async (req, res) => {
  const { shopId, productId } = req.body;

  const response = await axios.post(
    `${process.env.FLASK_URL}/v1/recommend/similar/${productId}?store_id=${shopId}`,
  );

  return res.status(200).json({
    products: response.data.items,
  });
};

export const searchProducts = async (req, res) => {
  const { query, shopId, top_k } = req.body;

  const response = await axios.post(`${process.env.FLASK_URL}/v1/search/`, {
    query,
    store_id:shopId,
    top_k
  });

  return res.status(200).json({
    products:response.data.items
  })
};
