const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//express 미들웨어 설정
app.use(express.json());
app.use(
  cors({
    origin: "*", //임시 설정!
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

//express 라우팅
const signRouter = require("./routers/sign");
const googleSignRouter = require("./routers/google-sign");
const userRouter = require("./routers/user");
const curationRouter = require("./routers/curation");
const curationCardRouter = require("./routers/curation-card");
const curationCardFeedbackRouter = require("./routers/curation-card-feedback");
const planRouter = require("./routers/plan");
const curationRequestRouter = require("./routers/curation-request");

app.use("/sign", signRouter);
app.use("/google-sign", googleSignRouter);
app.use("/user", userRouter);
app.use("/curation", curationRouter);
app.use("/curation-card", curationCardRouter);
app.use("/curation-card-feedback", curationCardFeedbackRouter);
app.use("/plan", planRouter);
app.use("/curation-request", curationRequestRouter);

app.get("/", (req, res) => {
  res.send("Scraplan server connected");
});
app.get("/curations", require("./controllers/curation").get);
app.get(
  "/curation-cards/:curationId",
  require("./controllers/curation-card").get
);
app.get(
  "/curation-card-feedbacks/:curationCardId",
  require("./controllers/curation-card-feedback").get
);
app.get(
  "/plans/:pagenation",
  require("./middlewares/optionalTokenCheck"),
  require("./controllers/plan").get
);
app.get(
  "/plan-cards/:planId",
  require("./middlewares/optionalTokenCheck"),
  require("./controllers/plan-card").get
);
app.get(
  "/curation-requests/:email",
  require("./middlewares/requiredTokenCheck"),
  require("./controllers/curation-request").get
);

//HTTPS 서버 여는 코드
const ca = fs.readFileSync(process.env.SSL_CA);
const key = fs.readFileSync(process.env.SSL_PRIVATE);
const cert = fs.readFileSync(process.env.SSL_CERT);

if (ca && key && cert) {
  https
    .createServer(
      {
        ca,
        key,
        cert,
      },
      app
    )
    .listen(443, () => {
      console.log("server working now");
    });
} else {
  console.log("key's location is not exists");
}
module.exports = app;
