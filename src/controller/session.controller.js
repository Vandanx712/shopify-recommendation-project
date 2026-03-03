import sessionModel from "../models/session.model.js";
import userModel from "../models/user.model.js";

export const createSession = async (req, res) => {
  try {
    const { userId,shopifyStoreID, landingPage } = req.body;

    const user = await userModel.findById(userId);

    const newsession = await sessionModel.create({
      userId: userId,
      shopifyStoreID:shopifyStoreID,
      landingPage,
    });

    user.totalSessions += 1;
    await user.save();

    return res.status(200).json({
      success: true,
      newsession,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    await sessionModel.updateOne(
      { userId: userId, _id: sessionId },
      { endedAt: new Date() },
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
