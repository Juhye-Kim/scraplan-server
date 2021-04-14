const { CurationCard } = require("../../models");

module.exports = async (req, res) => {
  const { curationId } = req.params;
  if (!curationId || isNaN(Number(curationId))) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const curationCards = await CurationCard.findAll({
      where: { CurationId: curationId },
      raw: true,
    });

    res.status(200).json(curationCards);
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation-card/getCurationCards.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation-card/getCurationCards.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
