const { CurationRequest } = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  const { authData } = req;
  const {
    coordinates,
    address,
    requestTitle,
    requestComment,
    requestTheme,
  } = req.body;

  if (
    !authData ||
    !coordinates ||
    !address ||
    !requestTitle ||
    !requestComment ||
    checkNumberType("required", requestTheme)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  if (
    !(
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    )
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    await CurationRequest.create({
      UserId: authData.id,
      coordinates: { type: "Point", coordinates },
      address,
      requestTitle,
      requestComment,
      requestTheme,
      status: 0,
    });

    return res.status(200).json({ message: "successfully added" });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation-request/createCurationRequests.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation-request/createCurationRequests.js-------------------------------- \n"
    );
    return res.status(500).send();
  }
};
