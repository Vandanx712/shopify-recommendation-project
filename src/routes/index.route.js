import {Router} from 'express'
import { getAllProducts } from '../controller/product.controller.js'
import { createUser } from '../controller/user.controller.js'
import { createSession } from '../controller/session.controller.js'
import { createEvent } from '../controller/event.controller.js'
import { createOrder } from '../controller/order.controller.js'


const indexRouter = Router()

indexRouter.route('/get').post(getAllProducts)
indexRouter.route('/user/').post(createUser)
indexRouter.route('/session/').post(createSession)
indexRouter.route('/event/').post(createEvent)
indexRouter.route('/order/').post(createOrder)

export default indexRouter