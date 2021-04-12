const { User } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  const { email, googleData } = req;

  //필수 값 체크
  if (!email || !googleData) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  //유저 조회
  const userInfo = await User.findOne({
    where: { email },
  });

  if (userInfo && userInfo.validGoogleData(googleData)) {
    //googleData기준으로 접근이 가능한 사용자인지 확인
    try {
      const accessToken = jwt.sign(
        { id: userInfo.id, nickname: userInfo.nickname },
        process.env.ACCESS_SECRET,
        { expiresIn: "1H" }
      );

      userInfo.latestToken = accessToken;
      await userInfo.save();

      res.status(200).json({ accessToken, email, nickname: userInfo.nickname });
    } catch (err) {
      console.log(
        "-------------------------------Error occurred in google-sign/in.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in google-sign/in.js-------------------------------- \n"
      );
      res.status(500).send();
    }
  } else if (!userInfo) {
    res.status(400).json({ message: "None exists user" });
  } else {
    res.status(401).json({ message: "Wrong data" });
  }
};
