import express from 'express';
import { 
  listProduct, 
  removeProduct, 
  singleProduct, 
  addProduct, 
  updateProduct 
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Route to add a new product
productRouter.post(
  '/add', 
  adminAuth, 
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }
  ]), 
  addProduct
);

// Route to remove a product
productRouter.post('/remove', adminAuth, (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: "Product ID is required" 
    });
  }

  // Forward request to the controller
  removeProduct(req, res);
});

// Route to list all products (public access, no authentication required)
productRouter.get('/list', listProduct);

// Route to fetch a single product by ID
productRouter.post('/single', (req, res) => {
  const { productId } = req.body;

  if (!productId || productId.length !== 24) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid product ID" 
    });
  }

  // Forward request to the controller
  singleProduct(req, res);
});

// Route to update an existing product
productRouter.post(
  '/update', 
  adminAuth, 
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 }
  ]), 
  updateProduct
);

export default productRouter;
