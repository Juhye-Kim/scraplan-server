module.exports = async (req, res) => {
  const { password } = req.body;

  if (!password || !req.authData) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    if (req.authData.validPassword(password)) {
      await req.authData.destroy();

      res.status(200).json({ message: "Successfully processed" });
    } else {
      res.status(401).json({ message: "Password is wrong!" });
    }
  } catch (err) {
    console.log(
      "---------------------------------Error occurred in sign/withdraw.js---------------------------------",
      err,
      "---------------------------------Error occurred in sign/withdraw.js---------------------------------"
    );
    res.status(500).send();
  }
};
