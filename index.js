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

app.get("/", (req, res) => {
  res.send("Scraplan server connected");
});
app.use("/sign", signRouter);
app.use("/google-sign", googleSignRouter);
app.use("/user", userRouter);
app.get("/curations", require("./controllers/curation").get);
app.use("/curation", curationRouter);
app.get(
  "/curation-cards/:curationId",
  require("./controllers/curation-card").get
);
app.use("/curation-card", curationCardRouter);

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
