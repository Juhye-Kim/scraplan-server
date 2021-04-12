const axios = require("axios");
module.exports = async (req, res) => {
  const { email, googleData, accessToken, authData } = req;
  if (!authData || !email || !googleData || !accessToken) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    if (authData.validGoogleData(googleData)) {
      //google 계정에서 withdraw를 하는 요청
      axios({
        method: "post",
        url: `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
        headers: { "Content-type": "application/x-www-form-urlencoded" },
      });

      await authData.destroy();

      res.status(200).json({ message: "Successfully processed" });
    } else {
      res.status(401).json({ message: "Wrong access" });
    }
  } catch (err) {
    console.log(
      "---------------------------------Error occurred in google-sign/withdraw.js---------------------------------",
      err,
      "---------------------------------Error occurred in google-sign/withdraw.js---------------------------------"
    );
    res.status(500).send();
  }
};
