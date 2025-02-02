import express from "express";
import {
  addToCart,
  updateCart,
  getUserCart,
  clearCart,
} from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();
cartRouter.get("/get", authUser, getUserCart);

cartRouter.post("/add", authUser, addToCart);
cartRouter.post("/clear", authUser, clearCart);
cartRouter.post("/update", authUser, updateCart);

export default cartRouter;
