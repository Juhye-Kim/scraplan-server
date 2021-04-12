const { User } = require("../../models");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  const { authData } = req;
  const { nickname, password } = req.body;

  if ((!nickname && !password) || !authData) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    if (nickname) {
      const userInfo = await User.findOne({ where: { nickname }, raw: true });

      if (!userInfo) authData.nickname = nickname;
      else return res.status(409).json({ message: "Already exists nickname" });

      authData.latestToken = jwt.sign(
        { id: authData.id, nickname: authData.nickname },
        process.env.ACCESS_SECRET,
        { expiresIn: "1H" }
      );
    }
    if (password) authData.updatePassword(password);

    await authData.save();

    res.status(200).json({ accessToken: authData.latestToken });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in user/edit-info.js-------------------------------- \n",
      err,
      "\n-------------------------------Error occurred in user/edit-info.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
