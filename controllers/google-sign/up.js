const { User, Sequelize } = require("../../models");

module.exports = async (req, res) => {
  const { email, googleData } = req;
  const { nickname } = req.body;

  //필수 값 체크
  if (!email || !googleData || !nickname) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const userInfo = await User.findOne({
    where: {
      [Sequelize.Op.or]: [{ email }, { nickname }],
    },
  });

  if (userInfo) {
    if (userInfo.email === email) {
      res.status(409).json({ message: "Already exists email" });
    } else if (userInfo.nickname === nickname) {
      res.status(409).json({ message: "Already exists nickname" });
    }
  } else {
    try {
      await User.create({
        email,
        nickname,
        googleData,
        password: "",
      });

      res.status(200).json({ message: "Successfully signedup" });
    } catch (err) {
      console.log(
        "-------------------------------Error occurred in google-sign/up.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in google-sign/up.js-------------------------------- \n"
      );
      res.status(500).send();
    }
  }
};
