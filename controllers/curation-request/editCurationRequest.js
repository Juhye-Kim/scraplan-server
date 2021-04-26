const { CurationRequest } = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  const { authData } = req;
  const { id, status } = req.body;

  if (
    !authData ||
    checkNumberType("required", id) ||
    checkNumberType("required", status)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const target = await CurationRequest.findOne({
      where: { id },
    });

    if (!target) {
      return res.status(400).json({ message: "Insufficient info" });
    }
    if (target.UserId !== authData.id && authData.isAdmin === false) {
      return res.status(403).send();
    }
    if (target.status === status) {
      return res.status(400).json({ message: "Nothing Changed" });
    }

    target.status = status;
    await target.save();

    return res.status(200).json({ message: "successfully updated status" });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation-request/editCurationRequest.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation-request/editCurationRequest.js-------------------------------- \n"
    );
    return res.status(500).send();
  }
};
