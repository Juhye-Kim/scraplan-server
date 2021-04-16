const {
  Curation,
  CurationCard,
  sequelize,
  Sequelize,
} = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  const { authData } = req;
  if (!authData.isAdmin) {
    return res.status(403).send();
  }

  const { curationCardId } = req.body;
  if (checkNumberType("required", curationCardId)) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      const curationCard = await CurationCard.findOne({
        where: { id: curationCardId },
        transaction: t,
      });
      if (!curationCard) {
        throw new errorMessage(
          404,
          "There is no data with given curation card id"
        );
      }

      const curation = await Curation.findOne({
        where: { id: curationCard.CurationId },
        transaction: t,
      });

      curation.themeInfo = curation.themeInfo.filter(
        (theme) => theme !== curationCard.theme
      );

      await curation.save({ transaction: t });
      await curationCard.destroy({ transaction: t });
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in curation-card/deleteCurationCard.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in curation-card/deleteCurationCard.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }
  res.status(200).json({ message: "successfully deleted" });
};
