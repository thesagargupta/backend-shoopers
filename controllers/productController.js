import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

// Add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, oldprice, newprice, category, discount, rating } = req.body;

    if (!name || !description || !category || discount === undefined || rating === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const validOldPrice = Number(oldprice) > 0 ? Number(oldprice) : 0;
    const validNewPrice = Number(newprice) > 0 ? Number(newprice) : 0;
    const validDiscount = (Number(discount) >= 0 && Number(discount) <= 100) ? Number(discount) : 0;

    if (validOldPrice <= 0 || validNewPrice <= 0) {
      return res.status(400).json({ success: false, message: "Prices must be greater than zero!" });
    } else if (validOldPrice < validNewPrice) {
      return res.status(400).json({ success: false, message: "Old price must be greater than new price" });
    }

    const images = req.files ? Object.values(req.files).flat().map((file) => file) : [];
    const imageUrls = await Promise.all(images.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
      return result.secure_url;
    }));

    const product = new productModel({
      name,
      description,
      newprice: validNewPrice,
      oldprice: validOldPrice,
      discount: validDiscount,
      image: imageUrls,
      category,
      date: Date.now(),
      rating: Number(rating),
    });

    await product.save();
    res.status(201).json({ success: true, message: "Product saved successfully", product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// List All Products
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// Remove Product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error('Error removing product:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// Single Product
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || productId.length !== 24) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id, name, description, oldprice, newprice, category, discount, rating } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const validOldPrice = Number(oldprice) > 0 ? Number(oldprice) : 0;
    const validNewPrice = Number(newprice) > 0 ? Number(newprice) : 0;
    const validDiscount = (Number(discount) >= 0 && Number(discount) <= 100) ? Number(discount) : 0;

    if (validOldPrice <= 0 || validNewPrice <= 0) {
      return res.status(400).json({ success: false, message: "Prices must be greater than zero!" });
    } else if (validOldPrice < validNewPrice) {
      return res.status(400).json({ success: false, message: "Old price must be greater than new price" });
    }

    const images = req.files ? Object.values(req.files).flat().map((file) => file) : [];
    if (images.length > 0) {
      product.image = await Promise.all(images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
        return result.secure_url;
      }));
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.oldprice = validOldPrice || product.oldprice;
    product.newprice = validNewPrice || product.newprice;
    product.discount = validDiscount || product.discount;
    product.category = category || product.category;
    product.rating = Number(rating) || product.rating;

    await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

export { listProduct, removeProduct, singleProduct, addProduct, updateProduct };
