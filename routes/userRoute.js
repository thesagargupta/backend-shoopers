import express from 'express';
import { loginUser, registerUser, adminLogin, getUserData,updateUser } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get("/me", getUserData);
userRouter.put('/update',  updateUser);

export default userRouter;