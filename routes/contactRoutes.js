import express from "express";
import Contact from "../models/contactModel.js";

const contactrouter = express.Router();

// Route to handle contact form submission
contactrouter.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Save to database
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.status(201).json({ success: true, message: "Message received successfully!" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ success: false, message: "Server error. Try again later." });
  }
});

export default contactrouter;
