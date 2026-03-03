import eventsModel from "../models/events.model.js";
import sessionModel from "../models/session.model.js";

export const createEvent = async (req, res) => {
  try {
    const { userId, sessionId, eventType, page, product, checkout, order } =
      req.body;

    const session = await sessionModel.findById(sessionId)

    await eventsModel.create({
      userId: userId,
      sessionId: sessionId,
      eventType: eventType,
      page: page,
      product: product ?? {},
      checkout: checkout ?? {},
      order: order ?? {},
    });

    switch (eventType) {
      case "page_view":
        session.pageViews = session.pageViews + 1;
        break;
      case "view_product":
        session.productsViewed = session.productsViewed + 1;
        break;
      case "add_to_cart":
        session.addedToCartCount = session.addedToCartCount + 1;
        break;
      case "checkout_started":
        session.checkoutStarted = session.checkoutStarted + 1;
        break;
      case "checkout_completed":
        session.checkoutCompleted = session.checkoutCompleted + 1;
        break;
      case "purchase":
        session.purchased = session.purchased + 1;
        break;

      default:
        break;
    }
    await session.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
