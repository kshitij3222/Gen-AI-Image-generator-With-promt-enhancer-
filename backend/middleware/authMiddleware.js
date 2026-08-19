const { firebaseAuth } = require("../config/firebaseAdmin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Firebase token is missing"
      });
    }

    const decodedToken =
      await firebaseAuth.verifyIdToken(token);

    req.user = decodedToken;

    // Firebase UID
    req.userId = decodedToken.uid;

    next();

  } catch (error) {
    console.error(
      "Firebase authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token"
    });
  }
};

module.exports = authMiddleware;