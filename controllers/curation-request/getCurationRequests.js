const { CurationRequest, User, sequelize } = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  const { authData } = req;
  const pagenation = req.query.pagenation || 1;
  let isAdmin;

  switch (req.query.isAdmin) {
    case "true":
      isAdmin = true;
      break;
    case "false":
      isAdmin = false;
      break;
    case undefined:
      isAdmin = false;
      break;
  }

  if (
    !authData ||
    checkNumberType("required", pagenation) ||
    (isAdmin !== false && isAdmin !== true)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  if (isAdmin && !authData.isAdmin) {
    return res.status(403).send();
  }

  try {
    const searchOptions = {};
    const include = [{ model: User, attributes: [], required: true }];
    const attributes = [
      "id",
      [sequelize.col("User.nickname"), "requester"],
      "coordinates",
      "address",
      "requestTitle",
      "requestComment",
      "requestTheme",
      "status",
    ];

    if (!isAdmin) {
      searchOptions.UserId = authData.id;
    } else {
    }

    const curationRequests = await CurationRequest.findAll({
      attributes,
      where: searchOptions,
      include,
      offset: (pagenation - 1) * 10,
      limit: 10,
      raw: true,
    });

    res.status(200).json({ curationRequests });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation-request/getCurationRequests.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation-request/getCurationRequests.js-------------------------------- \n"
    );
    return res.status(500).send();
  }
};
