const { Plan, PlanCard, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥PATCH /plan", () => {
  const url = "/plan";

  const users = [
    {
      origin: {
        email: "t1@test.com",
        nickname: "user1",
        password: 1234,
      },
      result: {},
    },
    {
      origin: {
        email: "t2@test.com",
        nickname: "user2",
        password: 1234,
      },
      result: {},
    },
  ];
  const newPlan = {
    title: "변경된 제목",
    desc: "변경된 설명",
    public: false,
    planId: "",
    representAddr: "변경된 도시",
  };
  const newPlanCard = [
    {
      day: 4,
      startTime: "14:00",
      endTime: "16:45",
      comment: "변경된 설명",
      theme: 5,
      coordinates: [15, 20],
      address: "변경시 변경동",
    },
  ];
  const plans = [
    {
      origin: {
        title: "공개글1",
        desc: "공개글1",
        public: true,
        UserId: "",
        dayCount: 2,
        representAddr: "서울시",
        planCards: [],
      },
      result: {},
    },
  ];
  before(async () => {
    const planCards = [
      {
        origin: {
          day: 1,
          startTime: "10:00",
          endTime: "10:45",
          comment: "분위기 있는 카페",
          theme: 2,
          coordinates: [5, 10],
          address: "성남시 분당구 ...",
        },
        result: {},
      },
      {
        origin: {
          day: 2,
          startTime: "10:00",
          endTime: "10:45",
          comment: "분위기 있는 카페",
          theme: 2,
          coordinates: [7, 10],
          address: "성남시 분당구 ...",
        },
        result: {},
      },
      {
        origin: {
          day: 2,
          startTime: "12:00",
          endTime: "13:45",
          comment: "분위기 있는 카페",
          theme: 2,
          coordinates: [7, 9],
          address: "성남시 분당구 ...",
        },
        result: {},
      },
    ];

    await sequelize.transaction(async (t) => {
      await User.destroy({ where: {}, transaction: t });
      await Plan.destroy({ where: {}, transaction: t });
      await PlanCard.destroy({ where: {}, transaction: t });

      for (const user of users) {
        user.result = await User.create(user.origin, { transaction: t });

        const accessToken = jwt.sign(
          { id: user.result.id, nickname: user.result.nickname },
          process.env.ACCESS_SECRET,
          { expiresIn: "1H" }
        );

        user.result.latestToken = accessToken;
        await user.result.save({ transaction: t });
      }

      plans[0].origin.UserId = users[0].result.id;

      for (const plan of plans) {
        plan.result = await Plan.create(plan.origin, { transaction: t });
      }

      for (const planCard of planCards) {
        plans[0].origin.planCards.push({
          ...planCard.origin,
          coordinates: planCard.origin.coordinates,
        });

        planCard.origin.PlanId = plans[0].result.id;
        planCard.origin.coordinates = {
          type: "Point",
          coordinates: planCard.origin.coordinates,
        };

        planCard.result = await PlanCard.create(planCard.origin, {
          transaction: t,
        });
      }

      plans[0].origin.planCards = encodeURIComponent(
        JSON.stringify(plans[0].origin.planCards)
      );

      newPlan.planId = plans[0].result.id;
      newPlan.planCards = encodeURIComponent(JSON.stringify(newPlanCard));
    });
  });

  describe("👉check required field", () => {
    const checkRequiredField = (checkFields, done) => {
      const req = {
        ...newPlan,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      for (const field of checkFields) {
        delete req[field];
      }

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    };
    it("check accessToken required", (done) => {
      checkRequiredField(["accessToken"], done);
    });
    it("check email required", (done) => {
      checkRequiredField(["email"], done);
    });
    it("check planId required", (done) => {
      checkRequiredField(["planId"], done);
    });
    it("check at least one optional required", (done) => {
      checkRequiredField(
        ["title", "desc", "public", "representAddr", "planCards"],
        done
      );
    });
  });

  describe("👉check ignore case", () => {
    function checkIgnoreOrignData(checkFields, done) {
      const req = {
        planId: newPlan.planId,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      for (const field of checkFields) {
        req[field] = plans[0].origin[field];
      }

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Nothing Changed");
        done();
      });
    }
    it("check ignore wrong data type public", (done) => {
      const req = {
        ...newPlan,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      req.public = "test";

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore not owners", (done) => {
      const req = {
        ...newPlan,
        accessToken: users[1].result.latestToken,
        email: users[1].result.email,
      };

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(403);
        done();
      });
    });

    it("check ignore nothing changed with original title request", (done) => {
      checkIgnoreOrignData(["title"], done);
    });
    it("check ignore nothing changed with original desc request", (done) => {
      checkIgnoreOrignData(["desc"], done);
    });
    it("check ignore nothing changed with original public request", (done) => {
      checkIgnoreOrignData(["public"], done);
    });
    it("check ignore nothing changed with original representAddr request", (done) => {
      checkIgnoreOrignData(["representAddr"], done);
    });
    it("check ignore nothing changed with original planCards request", (done) => {
      checkIgnoreOrignData(["planCards"], done);
    });
  });

  describe("👉check ignore changed with wrong data type of planCards", () => {
    function checkIgnoreWrongPlanCards(checkFields, valueChangeFiled, done) {
      const planCard = [{ ...newPlanCard[0] }];
      const req = {
        planId: newPlan.planId,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      for (const field of checkFields) {
        delete planCard[0][field];
      }
      for (const field in valueChangeFiled) {
        planCard[0][field] = valueChangeFiled[field];
      }
      req.planCards = encodeURIComponent(JSON.stringify(planCard));

      reqFunc(url, "patch", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    }
    it("check ignore without startTime in planCards", (done) => {
      checkIgnoreWrongPlanCards(["startTime"], {}, done);
    });
    it("check ignore without endTime in planCards", (done) => {
      checkIgnoreWrongPlanCards(["endTime"], {}, done);
    });
    it("check ignore without comment in planCards", (done) => {
      checkIgnoreWrongPlanCards(["comment"], {}, done);
    });
    it("check ignore without coordinates in planCards", (done) => {
      checkIgnoreWrongPlanCards(["coordinates"], {}, done);
    });
    it("check ignore without address in planCards", (done) => {
      checkIgnoreWrongPlanCards(["address"], {}, done);
    });
    it("check ignore without day in planCards", (done) => {
      checkIgnoreWrongPlanCards(["day"], {}, done);
    });
    it("check ignore without theme in planCards", (done) => {
      checkIgnoreWrongPlanCards(["theme"], {}, done);
    });
    it("check ignore wrong planCards-day", (done) => {
      checkIgnoreWrongPlanCards([], { day: "TEST" }, done);
    });
    it("check ignore wrong planCards-theme", (done) => {
      checkIgnoreWrongPlanCards([], { theme: "TEST" }, done);
    });
  });

  describe("👉check value changed with new data", () => {
    const checkChangedValue = (checkFields, done) => {
      const req = {
        planId: newPlan.planId,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      for (const field of checkFields) {
        req[field] = newPlan[field];
      }

      Plan.findOne({
        where: { id: newPlan.planId },
        raw: true,
      })
        .then((originPlan) => {
          reqFunc(url, "patch", req, (err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("message").eql("successfully edited");

            Plan.findOne({
              where: { id: newPlan.planId },
              raw: true,
            })
              .then((resultPlan) => {
                for (let field of checkFields) {
                  if (field === "planCards") {
                    field = "dayCount";
                  }
                  expect(originPlan[field]).to.not.deep.eql(resultPlan[field]);

                  if (field === "public") {
                    expect(resultPlan[field] === 0 ? false : true).to.deep.eql(
                      newPlan[field]
                    );
                  } else if (field === "dayCount") {
                    expect(resultPlan[field]).to.deep.eql(newPlanCard[0].day);
                  } else {
                    expect(resultPlan[field]).to.deep.eql(newPlan[field]);
                  }
                }
                done();
              })
              .catch((err) => done(err));
          });
        })
        .catch((err) => done(err));
    };
    it("check plan title is changed", (done) => {
      checkChangedValue(["title"], done);
    });
    it("check plan desc is changed", (done) => {
      checkChangedValue(["desc"], done);
    });
    it("check plan public is changed", (done) => {
      checkChangedValue(["public"], done);
    });
    it("check plan representAddr is changed", (done) => {
      checkChangedValue(["representAddr"], done);
    });
    it("check plan dayCount is changed by planCards", (done) => {
      checkChangedValue(["planCards"], done);
    });
  });
});
