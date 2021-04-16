const { Plan, PlanCard, sequelize, Sequelize } = require("../../models");
module.exports = async (req, res) => {
  const { authData } = req;
  const { title, desc, public, representAddr } = req.body;
  let { planCards } = req.body;

  if (!authData || !title || !public || !representAddr || !planCards) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      let dayCount = 0;
      //Plan 생성.
      const planResult = await Plan.create(
        { title, desc, public, UserId: authData.id, dayCount, representAddr },
        { transaction: t }
      );

      //planCards의 유효성 검사 및 PlanId값 기록
      /* planCards형식
      [
        {
          day:0,
          startTime: "10:00",
          endTime: "10:45",
          comment: "분위기 있는 카페",
          theme: 2,
          coordinates: [10, 10],
          address: "서울시 강서구 ..."
        }, ...
      ]
      */

      try {
        planCards = JSON.parse(decodeURIComponent(planCards));
      } catch (err) {
        throw new errorMessage(400, "Insufficient info");
      }
      if (Array.isArray(planCards)) {
        const checkNumberType = require("../util/checkNumberType");

        planCards.map((planCard) => {
          if (typeof planCard === "object" && !Array.isArray(planCard)) {
            const {
              day,
              startTime,
              endTime,
              comment,
              theme,
              coordinates,
              address,
            } = planCard;

            if (
              checkNumberType("required", day) ||
              !startTime ||
              !endTime ||
              !comment ||
              checkNumberType("required", theme) ||
              !coordinates ||
              !address
            ) {
              throw new errorMessage(400, "Insufficient info");
            }

            if (
              !Array.isArray(coordinates) ||
              typeof coordinates[0] !== "number" ||
              typeof coordinates[1] !== "number"
            ) {
              throw new errorMessage(400, "Insufficient info");
            }

            planCard.coordinates = { type: "Point", coordinates };
            //dayCount 기록
            dayCount = dayCount > day ? dayCount : day;
            //각 plancard에 PlanId값 기록
            planCard.PlanId = planResult.id;
          } else {
            throw new errorMessage(400, "Insufficient info");
          }
        });
      } else {
        throw new errorMessage(400, "Insufficient info");
      }

      //update된 dayCount를 다시 적용
      planResult.dayCount = dayCount;
      await planResult.save({ transaction: t });

      //planCard 업데이트
      await PlanCard.bulkCreate(planCards, { transaction: t });
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in plan/createPlan.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in plan/createPlan.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }

  res.status(200).json({ message: "successfully added" });
};
