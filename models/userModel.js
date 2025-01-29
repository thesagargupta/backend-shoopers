import mongoose from "mongoose";

// Define a schema for individual cart items
const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1, // Minimum quantity should be 1
  },
});

// Define the schema for the user
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: [cartItemSchema], // Use the array of cart items schema
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create or retrieve the Mongoose model
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Export the model for use in other parts of the application
export default User;
