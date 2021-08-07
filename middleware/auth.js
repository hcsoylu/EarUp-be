const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function auth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ errorMessage: "Unauthorized" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified.user);

    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ errorMessage: "Unauthorized" });
  }
}

module.exports = auth;
