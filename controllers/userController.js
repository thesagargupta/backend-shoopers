import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login User (Supports Email & Phone)
const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    const user = await userModel.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.json({ success: false, message: "User Does Not Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Email/Phone or Password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Register User (Supports Email & Phone)
const registerUser = async (req, res) => {
  try {
    const { name, emailOrPhone, password } = req.body;
    
    let email = null;
    let phone = null;

    if (validator.isEmail(emailOrPhone)) {
      email = emailOrPhone;
    } else if (validator.isMobilePhone(emailOrPhone, "any")) {
      phone = emailOrPhone;
    } else {
      return res.json({ success: false, message: "Enter a valid email or phone number" });
    }

    // Check if the user already exists
    const exists = await userModel.findOne({ $or: [{ email }, { phone }] });

    if (exists) {
      return res.json({ success: false, message: "User already registered" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please use a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, phone, password: hashedPassword });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid credentials" });
  }
};

// Get User Data
const getUserData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user data" });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const { name, email, phone, password, newPassword } = req.body;

    if (email && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (phone && !validator.isMobilePhone(phone, "any")) {
      return res.json({ success: false, message: "Enter a valid phone number" });
    }

    if (password && newPassword) {
      if (newPassword.length < 8) {
        return res.json({ success: false, message: "Please use a strong password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid current password" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email || null,
        phone: updatedUser.phone || null,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating user" });
  }
};

export { loginUser, registerUser, adminLogin, getUserData, updateUser };
