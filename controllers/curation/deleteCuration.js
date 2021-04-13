const { Curation, Sequelize } = require("../../models");

module.exports = async (req, res) => {
  const { authData } = req;
  const { id } = req.body;

  if (!authData || !id || typeof id !== "number") {
    return res.status(400).json({ message: "Insufficient info" });
  }

  if (!authData.isAdmin) {
    return res.status(403).send();
  }

  try {
    const curationInfo = await Curation.findOne({ where: { id } });

    if (curationInfo) {
      await curationInfo.destroy();
      res.status(200).json({ message: "successfully deleted" });
    } else {
      res.status(404).json({ message: "There is no data with given id" });
    }
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation/deleteCurations.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation/deleteCurations.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
