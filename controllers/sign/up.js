const { User, Sequelize } = require("../../models");

module.exports = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const userInfo = await User.findOne({
    where: {
      [Sequelize.Op.or]: [{ email }, { nickname }],
    },
  });

  if (userInfo) {
    //email이나 nickname이 이미 있는 경우
    if (userInfo.email === email) {
      res.status(409).json({ message: "Already exists email" });
    } else {
      res.status(409).json({ message: "Already exists nickname" });
    }
  } else {
    try {
      await User.create({
        email,
        password,
        nickname,
      });

      return res.status(200).json({ message: "Successfully signedUp" });
    } catch (err) {
      console.log(
        "-------------------------------Error occurred in sign/up.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in sign/up.js-------------------------------- \n"
      );
      res.status(500).send();
    }
  }
};
