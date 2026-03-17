import { Router } from "express";
import { getAllProducts, getProducts, syncProducts } from "../controller/product.controller.js";
import { createUser, recommendation, searchProducts, similarProducts, viewedProducts } from "../controller/user.controller.js";
import {
  createSession,
  updateSession,
} from "../controller/session.controller.js";
import { createEvent, deleteEvent } from "../controller/event.controller.js";
import { createOrder } from "../controller/order.controller.js";
import { getProductFilters } from "../controller/filter.controller.js";

const indexRouter = Router();

indexRouter.route("/get").post(getAllProducts);
indexRouter.route("/user/").post(createUser);
indexRouter.route("/session/").post(createSession);
indexRouter.route("/updatesession").put(updateSession);
indexRouter.route("/event/").post(createEvent);
indexRouter.route("/deleteEvent").post(deleteEvent);
indexRouter.route("/order/").post(createOrder);
indexRouter.route('/getrecommended').post(recommendation)
indexRouter.route('/similarproducts').post(similarProducts)
indexRouter.route('/searchproducts').post(searchProducts)
indexRouter.route('/viewedProducts/:userId').get(viewedProducts)

indexRouter.route('/products/sync/:id').post(syncProducts)
indexRouter.route('/products/get/:id').get(getProducts)
indexRouter.route('/products/filters').get(getProductFilters)

export default indexRouter;
