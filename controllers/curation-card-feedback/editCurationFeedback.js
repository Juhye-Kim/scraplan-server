const {
  CurationCard,
  CurationFeedback,
  sequelize,
  Sequelize,
} = require("../../models");
const checkNumberType = require("../util/checkNumberType");

const calcAvgTime = require("./calcAvgTime");

module.exports = async (req, res) => {
  const { authData } = req;
  const { curationFeedbackId, times, comment, rate } = req.body;

  if (
    !(authData && curationFeedbackId && (times || comment || rate)) ||
    checkNumberType("optional", times) ||
    checkNumberType("optional", rate)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      //SELECT * FROM CurationFeedback WHERE id = curationFeedbacId
      const curationFeedback = await CurationFeedback.findOne({
        where: { id: curationFeedbackId },
        transaction: t,
      });

      if (curationFeedback && curationFeedback.UserId === authData.id) {
        //조회되는 값이 있다면 수정작업 시작

        //값의 변화가 없으면 스킵
        let isChanged = false;

        if (comment && curationFeedback.comment !== comment) {
          curationFeedback.comment = comment;
          isChanged = true;
        }
        if (rate > -1 && curationFeedback.rate !== rate) {
          curationFeedback.rate = rate;
          isChanged = true;
        }
        if (times && curationFeedback.times !== times) {
          //times값이 수정되는 경우 CurationCard의 avgTime, feedbackCnt값도 수정
          curationFeedback.times = times;

          //현재 변경하는 feedback의 시간을 제외하고 나머지 feedback들의 시간 합을 가져옴.
          const feedbackTimesSum = await CurationFeedback.findOne({
            attributes: [
              [sequelize.fn("SUM", sequelize.col("times")), "feedbackSum"],
              [sequelize.fn("COUNT", sequelize.col("times")), "feedbackCnt"],
            ],
            where: {
              [Sequelize.Op.and]: [
                { CurationCardId: curationFeedback.CurationCardId },
                { [Sequelize.Op.not]: { id: curationFeedback.id } },
              ],
            },
            raw: true,
            transaction: t,
          });

          //현재 변경하는 시간 적용
          feedbackTimesSum.feedbackSum += times;
          feedbackTimesSum.feedbackCnt++;

          //평균 값을 계산하여 curationCard에 update
          await CurationCard.update(
            {
              avgTime: calcAvgTime(
                feedbackTimesSum.feedbackSum,
                feedbackTimesSum.feedbackCnt
              ),
            },
            { where: { id: curationFeedback.CurationCardId }, transaction: t }
          );

          isChanged = true;
        }

        if (isChanged) {
          await curationFeedback.save({ transaction: t });
        } else {
          //값 변화가 하나라도 일어나지 않았으면 400 Nothing chagned 반환
          throw new errorMessage(400, "Nothing Changed");
        }
      } else if (!curationFeedback) {
        //curation feedback 조회되는 값이 없다면 400코드 반환
        throw new errorMessage(400, "Insufficient info");
      } else {
        //사용자의 id와 curation feedback의 userid가 다르면 403코드 반환
        throw new errorMessage(403, "");
      }
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in curation-card-feedback/editCurationFeedback.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in curation-card-feedback/editCurationFeedback.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }
  res.status(200).json({ message: "successfully edited" });
};
