const { Plan, PlanCard, sequelize, Sequelize } = require("../../models");
const checkNumberType = require("../util/checkNumberType");
module.exports = async (req, res) => {
  const { authData } = req;
  const { planId, title, desc, public, representAddr } = req.body;
  let { planCards } = req.body;

  if (
    !authData || //인증 정보 존재 (accessToken, email)
    checkNumberType("required", planId) || //planId가 숫자값으로 필수값
    !(title || desc || representAddr || planCards || public !== undefined) || //나머지 필드는 옵션값이나 꼭 하나이상은 존재
    ("public" in req.body && !(public === true || public === false)) //public의 경우 무조건 값이 true아니면 false이어야 함
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    let dayCount = -1;

    if (planCards) {
      //planCards의 유효성 검사 및 데이터 다듬기 시작.
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
              !address ||
              Object.keys(planCard).length > 7 //입력값으로 들어오는 planCards의 각각의 값에 예상치 못한 키값이 있는지 검사.
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
            planCard.PlanId = planId;
          } else {
            throw new errorMessage(400, "Insufficient info");
          }
        });
      } else {
        throw new errorMessage(400, "Insufficient info");
      }
      //planCards의 유효성 검사 및 데이터 다듬기 종료.
    }

    await sequelize.transaction(async (t) => {
      //planId를 이용해 plan찾기
      const targetPlan = await Plan.findOne({
        where: { id: planId },
        transaction: t,
      });

      if (!targetPlan) {
        throw new errorMessage(404, "There is no data with given plan id");
      } else if (targetPlan.UserId !== authData.id) {
        throw new errorMessage(403, "");
      }

      //planCards를 제외한 나머지 값들이 변화가 있는지 확인해보고 있으면 적용하기.
      let isChanged = false;
      if (title && title !== targetPlan.title) {
        targetPlan.title = title;
        isChanged = true;
      }
      if (desc && desc !== targetPlan.desc) {
        targetPlan.desc = desc;
        isChanged = true;
      }
      if (public !== undefined && public !== targetPlan.public) {
        targetPlan.public = public;
        isChanged = true;
      }
      if (representAddr && representAddr !== targetPlan.representAddr) {
        targetPlan.representAddr = representAddr;
        isChanged = true;
      }

      if (dayCount > -1) {
        if (dayCount !== targetPlan.dayCount) {
          targetPlan.dayCount = dayCount;
          isChanged = true;
        }
        const originPlanCard = await PlanCard.findAll({
          attributes: [
            "PlanId",
            "day",
            "startTime",
            "endTime",
            "comment",
            "theme",
            "coordinates",
            "address",
          ],
          where: { PlanId: planId },
          transaction: t,
          raw: true,
        });

        function checkSame(origin, target) {
          const originIsArray = Array.isArray(origin);
          const targetIsArray = Array.isArray(target);
          if (originIsArray && targetIsArray) {
            for (const [idx, el] of origin.entries()) {
              if (!checkSame(origin[idx], target[idx])) return false;
            }
            return true;
          } else if (
            typeof origin === "object" &&
            !originIsArray &&
            typeof target === "object" &&
            !targetIsArray
          ) {
            for (const key in origin) {
              if (!checkSame(origin[key], target[key])) return false;
            }
            return true;
          } else if (origin === target) {
            return true;
          }

          return false;
        }

        //요청으로 들어온 planCards를 기준으로 DB에 있는 값과 비교한다.
        //planCards에 임의의 키 값들이 포함된 경우는 55번째 줄의 조건 검사로 걸러질 것이다.
        if (
          !checkSame(planCards, originPlanCard) &&
          !checkSame(originPlanCard, planCards)
        ) {
          //planCard의 planId가 planId인 모든 항목 삭제.
          await PlanCard.destroy({ where: { PlanId: planId }, transaction: t });

          //planCards로 새로 생성.
          await PlanCard.bulkCreate(planCards, { transaction: t });

          isChanged = true;
        }
      }

      if (isChanged) {
        await targetPlan.save({ transaction: t });
      } else {
        throw new errorMessage(400, "Nothing Changed");
      }
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in plan/editPlan.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in plan/editPlan.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }
  res.status(200).json({ message: "successfully edited" });
};
