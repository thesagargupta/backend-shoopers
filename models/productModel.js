import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  newprice: { type: Number, required: true, min: 0 },
  oldprice: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0 },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },  // Added rating field
}, { timestamps: true });

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);
export default productModel;
