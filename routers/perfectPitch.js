const router = require("express").Router();
const PerfectPitch = require("../models/perfectPitch");
const User = require("../models/userModel");
const q2m = require("query-to-mongo");
const ApiError = require("../utils/ApiError");
const { calculateAvg } = require("../utils/pitchHelpers");

router.post("/", async (req, res, next) => {
  const newQuiz = new PerfectPitch(req.body);
  const EASY = "easy";
  const NORMAL = "normal";
  const HARD = "hard";

  const quizType = req.body.quizLevel;
  try {
    const user = await User.findById(req.body.userId);
    if (!user) throw new ApiError(404, "User not found");

    const savedQuiz = await newQuiz.save();

    const quizData = {
      id: savedQuiz._id,

      score: req.body.score,
    };
    if (quizType === EASY) {
      user.easyPitches.push(quizData);
      user.easyAvg = calculateAvg(user.easyPitches);
    } else if (quizType === NORMAL) {
      user.normalPitches.push(quizData);
      user.normalAvg = calculateAvg(user.normalPitches);
    } else {
      user.hardPitches.push(quizData);
      user.hardAvg = calculateAvg(user.hardPitches);
    }

    await user.save();
    res.status(200).json(savedQuiz);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const query = q2m(req.query);

    const pp = await PerfectPitch.find(query.criteria);
    res.send(pp);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
