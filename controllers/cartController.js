import userModel from "../models/userModel.js";

// Add products to cart
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Check for missing or invalid itemId and quantity
    if (!itemId || quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId or quantity. Please provide valid values.",
      });
    }

    // Get the userId from the authenticated user
    const userId = req.user._id;
    console.log("Authenticated User ID:", userId);

    // Find the user by userId
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize cartData if not present
    let cartData = userData.cartData || [];

    console.log("Current Cart Data:", cartData);

    // Find if the item already exists in the cart
    const itemIndex = cartData.findIndex(item => item.itemId.toString() === itemId.toString());

    if (itemIndex > -1) {
      // If the item exists, update the quantity
      cartData[itemIndex].quantity += quantity;
    } else {
      // If the item doesn't exist, add it to the cart
      cartData.push({ itemId, quantity });
    }

    // Update the user's cart data in the database
    await userModel.findByIdAndUpdate(userId, { $set: { cartData } });

    // Send a response back to the client with updated cart
    res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cart: cartData, // Send updated cart data back
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Update cart
const updateCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Validate request body
    if (!itemId || quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId or quantity. Please provide valid values.",
      });
    }

    const userId = req.user._id;

    // Find the user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || [];

    const itemIndex = cartData.findIndex(item => item.itemId.toString() === itemId.toString());

    if (itemIndex > -1) {
      if (quantity === 0) {
        // Remove the item if quantity is 0
        cartData.splice(itemIndex, 1);
      } else {
        // Update the quantity
        cartData[itemIndex].quantity = quantity;
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart.",
      });
    }

    // Save the updated cart
    await userModel.findByIdAndUpdate(userId, { $set: { cartData } });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      cart: cartData,
    });
  } catch (error) {
    console.error("Error in updateCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get the user's cart data
    const cartData = userData.cartData || [];

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully.",
      cart: cartData,
    });
  } catch (error) {
    console.error("Error in getUserCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export { addToCart, updateCart, getUserCart };
