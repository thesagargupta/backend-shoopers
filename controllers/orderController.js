import { response } from "express";
import orderModel from "../models/orderModel.js";  // Correctly importing orderModel
import userModel from "../models/userModel.js";
import mongoose from "mongoose";



//gateway initialize

// Placing order using COD (Cash on Delivery)
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

// Place using Stripe gateway (stub for now)
const placeOrderStripe = async (req, res) => {

};

// Place using Razorpay gateway (stub for now)
const placeOrderRazorpay = async(req, res) => {
  // Add Razorpay payment logic here
};

// All data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate("items.product"); // Populate product details if needed
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// All orders for a user
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

// Updating status of order from admin panel
const updateStatus = async (req, res) => {
  try {
    // Log request body for debugging
    console.log("Request body:", req.body);

    const { id, status } = req.body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Order ID and status are required." });
    }

    // Ensure valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    // Fetch the order from the database
    const order = await orderModel.findById(id); // Use `orderModel` here
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Define allowed status transitions
    const statusFlow = ["order placed", "Shipped", "Delivered", "Cancelled"];

    // Get current and new status index
    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(status);

    // Ensure valid status transition
    if (newIndex === -1 || newIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Order can only move from '${order.status}' to '${statusFlow[currentIndex + 1] || "Completed"}'.`,
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Log the updated order for debugging
    console.log("Updated Order Data:", order);

    // Respond with success message
    res.status(200).json({ success: true, message: "Order status updated successfully!", updatedOrder: order });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const cancelOrder = async (req, res) => {
  try {
    // Extract order ID from the request body
    const { id } = req.body;

    // Validate order ID
    if (!id) {
      return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    // Fetch the order from the database
    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Ensure the order is in a cancellable state, for example, it should be in "order placed" or "Pending" status
    if (order.status !== "order placed" && order.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled as it is already processed or shipped." });
    }

    // Update the order status to "Cancelled"
    order.status = "Cancelled";
    await order.save();

    // Respond with success message
    res.status(200).json({ success: true, message: "Order cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling order:", error.message);
    res.status(500).json({ success: false, message: "An error occurred while cancelling the order." });
  }
};

export { placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, userOrders, updateStatus, cancelOrder };
