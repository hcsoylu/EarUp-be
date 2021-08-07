const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

router.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    //validation

    if (!name || !surname || !email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "please enter all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "please enter a password at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists.",
      });
    }

    //hash the password

    const salt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash(password, salt);

    //save a new user account to the database

    const newUser = new User({
      name,
      surname,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();

    res.status(201).send("account has been created succesfully");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

//log in

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "please enter all required fields." });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(401).json({ errorMessage: "Wrong email or password" });
    }

    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    // send the token in a http-only cookie

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

router.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(false);

    jwt.verify(token, process.env.JWT_SECRET);

    res.send(true);
  } catch (err) {
    console.error(err);
    res.json(false);
  }
});

router.get("/me", auth, (req, res) => {
  res.send(req.user);
});

router.put("/me", auth, upload.single("image"), async (req, res, next) => {
  try {
    let user = req.user;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);

      const data = {
        name: req.body.name || user.name,
        surname: req.body.surname || user.surname,
        avatar: result.secure_url || user.avatar,
      };

      user = await User.findByIdAndUpdate(user._id, data, { new: true });

      res.json(user);
    } else {
      const otherData = {
        name: req.body.name || user.name,
        surname: req.body.surname || user.surname,
      };
      user = await User.findByIdAndUpdate(user._id, otherData, { new: true });

      res.json(user);
    }
  } catch (err) {
    console.log(err);
  }

  /* try {
    const updates = Object.keys(req.body);

    updates.forEach((u) => (req.user[u] = req.body[u]));

    await req.user.save();

    res.status(201).send(req.user);
  } catch (error) {
    next(error);
  } */
});

router.get("/leaderboard/:type", async (req, res, next) => {
  const quizType = req.params.type;

  const EASY = "easy";
  const NORMAL = "normal";
  const HARD = "hard";

  try {
    if (quizType === EASY) {
      const easyLeaders = await User.find({
        "easyPitches.4": { $exists: true },
      }).sort({ easyAvg: -1 });
      res.status(200).send(easyLeaders.slice(0, 5));
    }
    if (quizType === NORMAL) {
      const normalLeaders = await User.find({
        "normalPitches.2": { $exists: true },
      }).sort({ normalAvg: -1 });
      res.status(200).send(normalLeaders.slice(0, 5));
    }
    if (quizType === HARD) {
      const hardLeaders = await User.find({
        "hardPitches.2": { $exists: true },
      })
        .sort({ hardAvg: -1 })
        .limit();
      res.status(200).send(hardLeaders.slice(0, 5));
    } else res.status(404).send("error");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
