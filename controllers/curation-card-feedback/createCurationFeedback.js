const {
  User,
  CurationCard,
  CurationFeedback,
  sequelize,
  Sequelize,
} = require("../../models");
const checkNumberType = require("../util/checkNumberType");

const calcAvgTime = require("./calcAvgTime");

module.exports = async (req, res) => {
  const { authData } = req;
  const { curationCardId, times, comment, rate } = req.body;

  if (
    !authData ||
    !curationCardId ||
    checkNumberType("required", times) ||
    !comment ||
    checkNumberType("required", rate)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      //curationCard존재 여부 확인 및 인스턴스 저장
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

      //CurationFeedback추가
      await CurationFeedback.create(
        {
          UserId: authData.id,
          CurationCardId: curationCardId,
          times,
          comment,
          rate,
        },
        { transaction: t }
      );

      //CurationCardId를 이용하여 해당 curationCard의 피드백의 총 시간 값과 갯수를 가져온다.
      const curationFeedback = await CurationFeedback.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("times")), "feedbackSum"],
          [sequelize.fn("COUNT", sequelize.col("times")), "feedbackCnt"],
        ],
        where: { CurationCardId: curationCardId },
        raw: true,
        transaction: t,
      });

      //평균 시간 산출 완전한 평균값은 아님. 시간은 정확히 산출되나
      //분은 15분 단위로 반올림(7.5분 기준)하여 표시됨
      curationCard.avgTime = calcAvgTime(
        curationFeedback.feedbackSum,
        curationFeedback.feedbackCnt
      );
      curationCard.feedbackCnt = curationFeedback.feedbackCnt;

      //curationCard에 평균시간과 카드 갯수 적용
      await curationCard.save({ transaction: t });
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in curation-card-feedback/createCurationFeedbacks.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in curation-card-feedback/createCurationFeedbacks.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }

  res.status(200).json({ message: "successfully added" });
};
