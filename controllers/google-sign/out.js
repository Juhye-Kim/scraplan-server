module.exports = async (req, res) => {
  if (!req.authData) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    await req.authData.update({ latestToken: null });

    res.status(200).json({ message: "Successfully logouted" });
  } catch (err) {
    console.log(
      "---------------------------------Error occurred in google-sign/out.js---------------------------------",
      err,
      "---------------------------------Error occurred in google-sign/out.js---------------------------------"
    );
    res.status(500).send();
  }
};
