const mongoose = require("mongoose");

const perfectPitchSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    quizLevel: { type: String, required: true },
    questionsInfo: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const PerfectPitch = mongoose.model("perfectpitch", perfectPitchSchema);

module.exports = PerfectPitch;
