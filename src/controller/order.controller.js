import orderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      orderId,
      shopifyStoreID,
      totalValue,
      currency,
      tax,
      discount,
      shipping,
      items,
      purchasedAt,
    } = req.body;

    const user = await userModel.findById(userId);

    await orderModel.create({
      userId: userId,
      orderId: orderId,
      shopifyStoreID:shopifyStoreID,
      totalValue: totalValue,
      currency: currency,
      tax: tax,
      discount: discount,
      shipping: shipping,
      items: items,
      purchasedAt: purchasedAt,
    });

    user.totalOrders += 1;
    await user.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
