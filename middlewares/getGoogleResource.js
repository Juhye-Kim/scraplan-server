const axios = require("axios");

module.exports = (req, res, next) => {
  const { hashData } = req.body;

  let access_token = "";

  try {
    const googleData = hashData.split("#")[1].split("&");

    for (const query of googleData) {
      const splited = query.split("=");
      if (splited[0] === "access_token") {
        access_token = splited[1];
      }
    }
  } catch (err) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  if (access_token === "") {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const googleAPI = `https://people.googleapis.com/v1/people/me?personFields=emailAddresses`;

  axios
    .get(googleAPI, {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })
    .then((res) => {
      req.accessToken = access_token;
      req.email = res.data.emailAddresses[0].value;
      req.googleData = res.data.resourceName;
      next();
    })
    .catch((err) => {
      console.log(
        "---------------------------------Error occurred in getGoogleData.js---------------------------------",
        err,
        "---------------------------------Error occurred in getGoogleData.js---------------------------------"
      );
      res.status(500).send();
    });
};
