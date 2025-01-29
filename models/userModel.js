import mongoose from "mongoose";

// Define a schema for individual cart items
const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// Define the schema for the user
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      unique: true, 
      sparse: true,  // Allows null values while enforcing uniqueness
      validate: {
        validator: function (v) {
          return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Validate only if it's provided
        },
        message: "Invalid email format.",
      },
    },
    phone: { 
      type: String, 
      unique: true, 
      sparse: true,  // Allows null values while enforcing uniqueness
      validate: {
        validator: function (v) {
          return !v || /^\d{10}$/.test(v); // Simple 10-digit phone validation
        },
        message: "Phone number must be 10 digits.",
      },
    },
    password: { type: String, required: true },
    cartData: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
