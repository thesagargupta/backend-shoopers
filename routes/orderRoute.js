import express from 'express';

import {placeOrder,placeOrderRazorpay,placeOrderStripe,allOrders,userOrders,updateStatus, cancelOrder} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js';
const orderRouter = express.Router();
//admin route for the products
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post("/status", adminAuth, updateStatus)
orderRouter.post("/cancel", adminAuth, cancelOrder)
//payment feature
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.post('/razorpay',authUser,placeOrderRazorpay)

//user order

orderRouter.post('/userorders',authUser,userOrders)



export default orderRouter