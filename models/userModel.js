const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  avatar: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
  },
  passwordHash: { type: String, required: true },
  easyPitches: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "perfectpitch" },
      score: Number,
    },
  ],
  normalPitches: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "perfectpitch" },
      score: Number,
    },
  ],
  hardPitches: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "perfectpitch" },
      score: Number,
    },
  ],
  easyAvg: { type: Number, default: 0 },
  normalAvg: { type: Number, default: 0 },
  hardAvg: { type: Number, default: 0 },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
