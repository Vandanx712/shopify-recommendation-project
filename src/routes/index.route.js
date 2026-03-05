import { Router } from "express";
import { getAllProducts } from "../controller/product.controller.js";
import { createUser } from "../controller/user.controller.js";
import {
  createSession,
  updateSession,
} from "../controller/session.controller.js";
import { createEvent, deleteEvent } from "../controller/event.controller.js";
import { createOrder } from "../controller/order.controller.js";

const indexRouter = Router();

indexRouter.route("/get").post(getAllProducts);
indexRouter.route("/user/").post(createUser);
indexRouter.route("/session/").post(createSession);
indexRouter.route("/updatesession").put(updateSession);
indexRouter.route("/event/").post(createEvent);
indexRouter.route("/deleteEvent").post(deleteEvent);
indexRouter.route("/order/").post(createOrder);

export default indexRouter;
