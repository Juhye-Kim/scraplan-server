const { CurationCard, CurationFeedback, sequelize } = require("../../models");

const calcAvgTime = require("./calcAvgTime");

module.exports = async (req, res) => {
  const { authData } = req;
  const { curationFeedbackId } = req.body;

  if (!authData || !curationFeedbackId) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      //curationFeedbackID로 curationFeedback이 있는지 확인한다.
      const curationFeedback = await CurationFeedback.findOne({
        where: { id: curationFeedbackId },
        transaction: t,
      });

      if (curationFeedback && curationFeedback.UserId === authData.id) {
        //값이 있으면서 접근한 사용자와 feedback의 소유자가 같다면

        //CurationCardId를 기록해두고 destroy명령을 진행한다.
        const CurationCardId = curationFeedback.CurationCardId;
        await curationFeedback.destroy({ transaction: t });

        //CurationCardId를 이용해 curationFeedback에서 times의 총합과 갯수를 구한다.
        const feedbackTimeSum = await CurationFeedback.findOne({
          attributes: [
            [sequelize.fn("SUM", sequelize.col("times")), "feedbackSum"],
            [sequelize.fn("COUNT", sequelize.col("times")), "feedbackCnt"],
          ],
          where: { CurationCardId },
          raw: true,
          transaction: t,
        });

        //curationFeedback에서 구한 값을 이용해 CurationCard의 평균 시간과 갯수 정보를 업데이트 한다.
        let avgTime = calcAvgTime(
          feedbackTimeSum.feedbackSum,
          feedbackTimeSum.feedbackCnt
        );
        avgTime = isNaN(avgTime) ? 0 : avgTime;
        await CurationCard.update(
          {
            avgTime,
            feedbackCnt: feedbackTimeSum.feedbackCnt,
          },
          { where: { id: CurationCardId }, transaction: t }
        );
      } else if (!curationFeedback) {
        //값이 없는 경우 400코드 반환
        throw new errorMessage(400, "Insufficient info");
      } else {
        //그 외의 경우는 인증정보와 소유자가 불일치하는 것이므로 403코드 반환
        throw new errorMessage(403, "");
      }
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in curation-card-feedback/deleteCurationFeedback.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in curation-card-feedback/deleteCurationFeedback.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }

  res.status(200).json({ message: "successfully deleted" });
};
