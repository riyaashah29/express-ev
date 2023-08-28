const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.isauth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  next();
};

exports.checkrole = (roles) => async (req, res, next) => {
  if (!req.role || !roles.includes(req.role)) {
    return res
      .status(401)
      .json({ message: `Sorry, you cannot access this route as ${req.role}` });
  }
  next();
};
