const { User } = require("../../models");

module.exports = async (req, res) => {
  if (!req.params.email) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const email = req.params.email;
  const isValid = req.authData ? true : false;

  if (isValid) {
    res.status(200).json({
      isValid,
      email: req.authData.email,
      nickname: req.authData.nickname,
    });
  } else {
    try {
      const userInfo = await User.findOne({
        where: { email },
        raw: true,
      });

      if (userInfo) {
        res.status(200).json({
          isValid,
          email: userInfo.email,
          nickname: userInfo.nickname,
        });
      } else {
        res.status(400).json({ message: "No user with given info" });
      }
    } catch (err) {
      console.log(
        "-------------------------------Error occurred in user/info.js-------------------------------- \n",
        err,
        "\n-------------------------------Error occurred in user/info.js-------------------------------- \n"
      );
      res.status(500).send();
    }
  }
};
