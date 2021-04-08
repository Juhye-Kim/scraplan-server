const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
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

app.get("/", (req, res) => {
  res.send("MySurpin server connected");
});

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
