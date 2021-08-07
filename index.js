const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {
  notFoundHandler,
  genericErrorHandler,
  badRequestHandler,
  forbiddenError,
  unauthorizedError,
} = require("./middleware/errors");

dotenv.config();

//set up server

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on ${PORT}`));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// connect to mongoDB

mongoose.connect(
  process.env.MDB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) return console.error(err);
    console.log("connected to mongoDB");
  }
);

// set up routes

app.use("/auth", require("./routers/userRouter"));
app.use("/pp", require("./routers/perfectPitch"));
app.use(unauthorizedError);
app.use(forbiddenError);

app.use(notFoundHandler);
app.use(badRequestHandler);

app.use(genericErrorHandler);
