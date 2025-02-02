import { response } from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
//placing order using cod

const placeOrder = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Request body:", req.body);

    const { items, amount, address, paymentMethod } = req.body;

    // Extract user ID from request (assuming authentication middleware sets req.user)
    const userId = req.user?._id; // Mongoose assigns _id automatically

    // Validate required fields dynamically (including address)
    if (!Array.isArray(items) || items.length === 0 || !amount || !address || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate address fields
    const { fullName, phoneNumber, pincode, city, state, apartment, locality } = address;
    if (!fullName || !phoneNumber || !pincode || !city || !state) {
      return res.status(400).json({ success: false, message: "Address fields missing" });
    }

    // Prepare order data dynamically
    const orderData = {
      userId, // Attach user ID to the order
      items,
      amount,
      address: {
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        pincode: pincode || '',
        city: city || '',
        state: state || '',
        apartment: apartment || '',
        locality: locality || ''
      },
      paymentMethod,
      payment: paymentMethod === "COD" ? false : true, // Assume false for COD, true for others
      status: "order placed", // Default status
      date: Date.now(),
    };

    // Log the prepared order data for debugging
    console.log("Prepared Order Data:", orderData);

    // Create and save the order to the database
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Respond with success message
    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//place using stripe gateway
const placeOrderStripe = async(req,res)=>{

}
//place using razorpay gateway

const placeOrderRazorpay = async(req,res)=>{

}

//all data for admin panel

const allOrders = async(req,res)=>{

}

//all orders for user


const userOrders = async (req, res) => {
  try {
    // Get user ID or phone number from the request user (authenticated)
    const userId = req.user?._id; // Assuming you're using _id for authentication

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not authenticated" });
    }

    // Fetch orders for the authenticated user
    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    // Send the orders as a response
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



//updating status of order from admin pannel
const updateStatus = async(req,res)=>{

}

export {placeOrder,placeOrderRazorpay,placeOrderStripe,allOrders,userOrders,updateStatus}