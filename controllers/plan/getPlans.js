const { Plan, User, sequelize, Sequelize } = require("../../models");
module.exports = async (req, res) => {
  const { authData } = req;
  const { writer, addr } = req.query;
  const pagenation = req.params.pagenation || 1;
  const minDay = req.query["min-day"];
  const maxDay = req.query["max-day"];

  const checkNumberType = require("../util/checkNumberType");

  if (
    checkNumberType("required", pagenation) ||
    checkNumberType("optional", minDay) ||
    checkNumberType("optional", maxDay)
  ) {
    return res.status(400).json({ message: "Insufficient info" });
  }

  try {
    const findOptions = {};

    if (authData) {
      //authData가 있으면 public 값이 false이지만 UserId가 authData와 일치한다면 볼 수 있도록 설정
      findOptions[Sequelize.Op.or] = [
        { public: true },
        { [Sequelize.Op.and]: [{ public: false }, { UserId: authData.id }] },
      ];
    } else {
      //기본값으로 public은 true 인것으로 설정.
      findOptions["public"] = true;
    }

    if (minDay || maxDay) {
      findOptions["dayCount"] = {};
      if (minDay) {
        //minDay가 있으면 dayCount 조건 검사 추가.
        findOptions["dayCount"][Sequelize.Op.gte] = minDay;
      }
      if (maxDay) {
        //maxDay가 있으면 dayCount 조건 검사 추가.
        findOptions["dayCount"][Sequelize.Op.lte] = maxDay;
      }
    }

    if (writer) {
      //writer가 있으면 User.nickname 조건 검사 추가.
      findOptions["$User.nickname$"] = writer;
    }
    if (addr) {
      //addr이 있으면 representAddr 조건 검사 추가.
      findOptions["representAddr"] = {
        [Sequelize.Op.like]: `%${decodeURIComponent(addr)}%`,
      };
    }

    //응답 구문 형식
    /*
      {
        plans : [
            {
                id: 0,
                title : "2박 3일 울산 여행",
                desc : "",
                public: true,
                writer : "tester",
                dayCount : 3,
                representAddr: "울산 광역시"
            },...
        ]
      }
    */
    const plans = await Plan.findAll({
      attributes: [
        "id",
        "title",
        "desc",
        "public",
        [sequelize.col("User.nickname"), "writer"],
        "dayCount",
        "representAddr",
      ],
      include: [{ model: User, attributes: [], required: true }],
      where: findOptions,
      offset: (pagenation - 1) * 10,
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      raw: true,
    });

    res.status(200).json({ plans });
  } catch (err) {
    console.log(
      "-------------------------------Error occurred in plan/getplans.js-------------------------------- \n",
      err,
      "-------------------------------Error occurred in plan/getplans.js-------------------------------- \n"
    );
    res.status(500).send();
  }
};
