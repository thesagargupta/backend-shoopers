import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token after 'Bearer'

  if (!token) {
    return res.status(401).json({ success: false, message: "NOT AUTHORIZED. LOGIN AGAIN" });
  }

  try {
    // Decode the token and verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID (or other relevant user data) to req.user
    req.user = { _id: decoded.id }; // Assuming the 'id' is the field in the decoded token

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;
