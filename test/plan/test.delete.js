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
        planCard.origin.PlanId = plans[0].result.id;
        planCard.origin.coordinates = {
          type: "Point",
          coordinates: planCard.origin.coordinates,
        };

        planCard.result = await PlanCard.create(planCard.origin, {
          transaction: t,
        });
      }
    });
  });

  describe("👉check required field", () => {
    //필수값 체크
    const checkRequiredField = (checkFields, done) => {
      const req = {
        planId: plans[0].result.id,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };
      for (const field of checkFields) {
        delete req[field];
      }

      reqFunc(url, "delete", req, (err, res) => {
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
  });

  describe("👉check ignore case", () => {
    //planId 형식 체크
    //미권한 사용자 접근 거절 확인
    it("check ignore wrong data type planId", (done) => {
      const req = {
        planId: "TEST",
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };

      reqFunc(url, "delete", req, (err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("message").eql("Insufficient info");
        done();
      });
    });
    it("check ignore none exists resource", (done) => {
      const req = {
        planId: plans[0].result.id + 1,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };

      reqFunc(url, "delete", req, (err, res) => {
        res.should.have.status(404);
        res.body.should.have
          .property("message")
          .eql("There is no data with given plan id");
        done();
      });
    });
    it("check ignore not owners", (done) => {
      const req = {
        planId: plans[0].result.id,
        accessToken: users[1].result.latestToken,
        email: users[1].result.email,
      };

      reqFunc(url, "delete", req, (err, res) => {
        res.should.have.status(403);
        done();
      });
    });
  });

  describe("👉check resource delete with success request", () => {
    //소유자 삭제 승인 확인
    //DB조회 plan과 plancard모두 삭제된 것 확인
    it("check deleted data", (done) => {
      const req = {
        planId: plans[0].result.id,
        accessToken: users[0].result.latestToken,
        email: users[0].result.email,
      };

      reqFunc(url, "delete", req, (err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("successfully deleted");

        Plan.findOne({ where: { id: plans[0].result.id } })
          .then((resultPlan) => {
            expect(resultPlan).to.be.null;
            PlanCard.findAll({ where: { PlanId: plans[0].result.id } })
              .then((resultPlanCard) => {
                expect(resultPlanCard.length).to.eql(0);
                done();
              })
              .catch((err) => done(err));
          })
          .catch((err) => done(err));
      });
    });
  });
});
