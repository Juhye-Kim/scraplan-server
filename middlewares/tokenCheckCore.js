const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next, authorization, email) => {
  const bearer = authorization.split(" ");

  if (bearer[0] === "Bearer") {
    try {
      const authData = jwt.verify(bearer[1], process.env.ACCESS_SECRET);

      if (authData.nickname === undefined || authData.id === undefined) {
        //not our token format
        return res.status(401).send();
      }
      const userInfo = await User.findOne({
        where: {
          email,
        },
      });

      if (
        userInfo &&
        userInfo.nickname === authData.nickname &&
        userInfo.id === authData.id &&
        userInfo.latestToken === bearer[1]
      ) {
        req.authData = userInfo;
        next();
        return;
      } else if (!userInfo) {
        //조회되는 유저가 없는 경우
        return res.status(401).json({ message: "Wrong access" });
      } else if (userInfo.latestToken !== bearer[1]) {
        //다른 곳에서 로그인하여 기존 토큰이 무효화되었을 때 혹은 토큰과 이메일의 정보가 일치하지 않을 떄
        return res
          .status(403)
          .json({ message: "Expired token or Not matched inform" });
      }
    } catch (err) {
      switch (err.message) {
        case "jwt must be provided":
          res.status(400).json({ message: "Insufficient info" });
          break;
        case "jwt malformed":
          res.status(400).json({ message: "Insufficient info" });
          break;
        case "jwt expired":
          res.status(401).json({ message: "Expired token" });
          break;
        case "invalid token":
          res.status(401).json({ message: "Invalid token" });
          break;
        default:
          console.log(
            "---------------------------------Error occurred in tokenCheck.js---------------------------------",
            err,
            "---------------------------------Error occurred in tokenCheck.js---------------------------------"
          );
          res.status(500).json({ message: "Something wrong in server" });
          break;
      }
      return;
    }
  } else {
    return res.status(400).json({ message: "Insufficient info" });
  }
};
