import userModel from "../models/user.model.js";

export const createUser = async (req, res) => {
  try {
    const { shopifyCustomerId,shopifyStoreID, anonymousId, email, deviceInfo } = req.body;

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
      shopifyStoreID:shopifyStoreID,
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