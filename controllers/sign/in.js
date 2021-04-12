const { User } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const userInfo = await User.findOne({
    where: { email },
  });

  if (userInfo && userInfo.validPassword(password)) {
    try {
      const accessToken = jwt.sign(
        { id: userInfo.id, nickname: userInfo.nickname },
        process.env.ACCESS_SECRET,
        { expiresIn: "1H" }
      );

      userInfo.latestToken = accessToken;
      await userInfo.save();

      res.status(200).json({ accessToken });
    } catch (err) {
      console.log(
        "-------------------------------Error occurred in sign/in.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in sign/in.js-------------------------------- \n"
      );
      res.status(500).send();
    }
  } else if (userInfo) {
    //비밀번호가 틀린 경우.
    res.status(401).json({ message: "Wrong password" });
  } else {
    //해당 하는 유저가 없는 경우.
    res.status(400).json({ message: "None exists user" });
  }
};
