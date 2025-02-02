import userModel from "../models/userModel.js";

// Add products to cart
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId or quantity. Please provide valid values.",
      });
    }

    const userId = req.user._id;
    console.log("Authenticated User ID:", userId);

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || [];

    console.log("Current Cart Data:", cartData);

    // **FIXED: Use itemId for comparison**
    const itemIndex = cartData.findIndex(item => item.itemId.toString() === itemId.toString());

    if (itemIndex > -1) {
      cartData[itemIndex].quantity += quantity;
    } else {
      cartData.push({ itemId, quantity });
    }

    // Update the database
    await userModel.findByIdAndUpdate(userId, { $set: { cartData } });

    // Fetch updated cart data
    const updatedUser = await userModel.findById(userId);

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cart: updatedUser.cartData,
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

    if (!itemId || quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid itemId or quantity. Please provide valid values.",
      });
    }

    const userId = req.user._id;
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || [];

    const itemIndex = cartData.findIndex(item => item.itemId.toString() === itemId.toString());

    if (itemIndex > -1) {
      if (quantity === 0) {
        cartData.splice(itemIndex, 1); // Remove item if quantity is 0
      } else {
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

    // **Fetch updated cart after update**
    const updatedUser = await userModel.findById(userId);

    res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      cart: updatedUser.cartData,
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
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully.",
      cart: userData.cartData || [],
    });
  } catch (error) {
    console.error("Error in getUserCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Clear all items from the cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Clear the cart
    await userModel.findByIdAndUpdate(userId, { $set: { cartData: [] } });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart: [],
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export { addToCart, updateCart, getUserCart, clearCart };
