const { PlanCard, Plan, sequelize } = require("../../models");
const checkNumberType = require("../util/checkNumberType");

module.exports = async (req, res) => {
  const { authData } = req; //isValid, isMember 값 설정 시 사용
  const { planId } = req.params; //필수 값 숫자 타입.

  if (checkNumberType("required", planId)) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  const isMember = authData && "id" in authData ? true : false;
  let planCards,
    isValid = false,
    mbrs,
    metadata;

  function errorMessage(code, message) {
    this.code = code;
    this.message = message;
  }

  try {
    await sequelize.transaction(async (t) => {
      planCards = await PlanCard.findAll({
        attributes: [
          "day",
          "startTime",
          "endTime",
          "comment",
          "theme",
          "coordinates",
          "address",
        ],
        where: { PlanId: planId },
        raw: true,
      });

      if (planCards.length === 0) {
        throw new errorMessage(404, "There is no data with given plan id");
      }

      //day별로 각 위치들의 mbr을 보내준다.
      const query = `SELECT day, 
      ST_Envelope(ST_GeomFromText(concat('GEOMETRYCOLLECTION(',GROUP_CONCAT('Point(', ST_X(coordinates), ' ', ST_Y(coordinates),')'),')'))) as mbr
      FROM PlanCards WHERE PlanId = ${planId} GROUP BY day`;
      [mbrs, metadata] = await sequelize.query(query, {});

      if (isMember) {
        const checkValid = await Plan.count({
          where: { id: planId, UserId: authData.id },
        });
        if (checkValid === 1) {
          isValid = true;
        }
      }
    });
  } catch (err) {
    if (err instanceof errorMessage) {
      return res.status(err.code).json({ message: err.message });
    } else {
      console.log(
        "-------------------------------Error occurred in plan/getPlanCards.js-------------------------------- \n",
        err,
        "-------------------------------Error occurred in plan/getPlanCards.js-------------------------------- \n"
      );
      return res.status(500).send();
    }
  }

  res.status(200).json({ isMember, isValid, planCards, mbrs });
};
