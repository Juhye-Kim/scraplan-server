const {
  User,
  CurationCard,
  CurationFeedback,
  sequelize,
  Sequelize,
} = require("../../models");

module.exports = async (req, res) => {
  const { curationCardId } = req.params;
  const minTime = req.query["min-Time"];
  const maxTime = req.query["max-Time"];

  if (
    !curationCardId ||
    (minTime && isNaN(Number(minTime))) ||
    (maxTime && isNaN(Number(maxTime)))
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const curationCard = await CurationCard.findOne({
      where: { id: curationCardId },
      raw: true,
    });
    if (!curationCard) {
      return res
        .status(404)
        .json({ message: "There is no data with given curation card id" });
    }

    const findOptions = {};
    const andParams = [];

    if (minTime) {
      andParams.push({ times: { [Sequelize.Op.gte]: minTime } });
    }
    if (maxTime) {
      andParams.push({ times: { [Sequelize.Op.lte]: maxTime } });
    }

    if (andParams.length === 0) {
      findOptions.CurationCardId = curationCardId;
    } else {
      andParams.push({ CurationCardId: curationCardId });
      findOptions[Sequelize.Op.and] = andParams;
    }

    //찾아야하는 정보.
    /*
      curationFeedbackId: 0,
      writer : "testeer", //join으로 찾아야 함
      times : 1.15,
      comment : "편안하고 조용한 곳이어서 ~~",
      rate: 0 //0,1,2 -> 별로에요, 그저그래요, 좋아요
    */
    const feedbacks = await CurationFeedback.findAll({
      attributes: [
        [sequelize.col("CurationFeedback.id"), "curationFeedbackId"],
        [sequelize.col("User.nickname"), "writer"],
        "times",
        "comment",
        "rate",
      ],
      include: [{ model: User, attributes: [], required: true }],
      where: findOptions,
      offset: 0,
      limit: 10, //pagenation적용해야 함.
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in curation-card-feedback/getCurationCardFeedbacks.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in curation-card-feedback/getCurationCardFeedbacks.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
