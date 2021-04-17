const { Plan, PlanCard, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥POST /plan", () => {
  const users = [
    {
      origin: {
        email: "t1@test.com",
        nickname: "user1",
        password: 1234,
      },
      result: {},
    },
  ];
  const plans = {
    email: "",
    title: "추가 테스트",
    desc: "추가 테스트",
    public: true,
    representAddr: "분당구",
  };
  const planCards = [
    {
      day: 1,
      startTime: "10:00",
      endTime: "10:45",
      comment: "분위기 있는 카페",
      theme: 2,
      coordinates: [5, 10],
      address: "성남시 분당구 ...",
    },
    {
      day: 2,
      startTime: "10:00",
      endTime: "10:45",
      comment: "분위기 있는 카페",
      theme: 2,
      coordinates: [7, 10],
      address: "성남시 분당구 ...",
    },
    {
      day: 2,
      startTime: "12:00",
      endTime: "13:45",
      comment: "분위기 있는 카페",
      theme: 2,
      coordinates: [7, 9],
      address: "성남시 분당구 ...",
    },
  ];
  plans.planCards = encodeURIComponent(JSON.stringify(planCards));
  const failPlanCardTemplates = {
    day: 1,
    startTime: "10:00",
    endTime: "15:00",
    comment: "123",
    theme: 2,
    coordinates: [10, 10],
    address: "address",
  };
  const checkPlanCard = (changeObj, done) => {
    const req = {
      accessToken: users[0].result.latestToken,
      ...plans,
    };
    req.planCards = encodeURIComponent(
      JSON.stringify([{ ...failPlanCardTemplates, ...changeObj }])
    );

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  };
  const checkRequiredField = (checkField, done) => {
    const req = {
      accessToken: users[0].result.latestToken,
      ...plans,
    };
    delete req[checkField];

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  };
  const url = "/plan";

  before(async () => {
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
      plans.email = users[0].origin.email;
    });
  });

  it("check accessToken required", (done) => {
    checkRequiredField("accessToken", done);
  });
  it("check email required", (done) => {
    checkRequiredField("email", done);
  });
  it("check title required", (done) => {
    checkRequiredField("title", done);
  });
  it("check public required", (done) => {
    checkRequiredField("public", done);
  });
  it("check representAddr required", (done) => {
    checkRequiredField("representAddr", done);
  });
  it("check planCards required", (done) => {
    checkRequiredField("planCards", done);
  });

  it("check igrnore wrong data type public", (done) => {
    const req = {
      accessToken: users[0].result.latestToken,
      ...plans,
    };
    req.public = "true";

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore wrong data type planCards-day", (done) => {
    checkPlanCard({ day: "TEST" }, done);
  });
  it("check ignore wrong data type planCards-theme", (done) => {
    checkPlanCard({ theme: "TEST" }, done);
  });
  it("check ignore wrong data type planCards-coordinates", (done) => {
    checkPlanCard({ coordinates: ["1", 1] }, done);
  });
  it("check ignore wrong data type planCards-startTime", (done) => {
    checkPlanCard({ startTime: "" }, done);
  });
  it("check ignore wrong data type planCards-endTime", (done) => {
    checkPlanCard({ endTime: "" }, done);
  });
  it("check ignore wrong data type planCards-comment", (done) => {
    checkPlanCard({ comment: "" }, done);
  });
  it("check ignore wrong data type planCards-address", (done) => {
    checkPlanCard({ address: "" }, done);
  });

  it("check created plan and plan cards", (done) => {
    const req = {
      accessToken: users[0].result.latestToken,
      ...plans,
    };
    //public boolean타입 검사를 위해 false로 설정
    req.public = false;
    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");

      Plan.findOne({ where: { UserId: users[0].result.id }, raw: true })
        .then((planResult) => {
          expect(planResult.title).to.eql(req.title);
          expect(planResult.desc).to.eql(req.desc);
          expect(planResult.pulbic).to.eql(req.pulbic);
          expect(planResult.representAddr).to.eql(req.representAddr);

          PlanCard.findAll({
            where: { PlanId: planResult.id },
            raw: true,
          })
            .then((planCardResult) => {
              expect(planCards.length).to.eql(planCardResult.length);

              let dayCount = 0;
              for (const [idx, planCard] of planCards.entries()) {
                expect(planCard.day).to.eql(planCardResult[idx].day);
                expect(planCard.startTime).to.eql(
                  planCardResult[idx].startTime
                );
                expect(planCard.endTime).to.eql(planCardResult[idx].endTime);
                expect(planCard.comment).to.eql(planCardResult[idx].comment);
                expect(planCard.theme).to.eql(planCardResult[idx].theme);
                expect(planCard.coordinates).to.deep.eql(
                  planCardResult[idx].coordinates.coordinates
                );
                expect(planCard.address).to.eql(planCardResult[idx].address);

                dayCount = dayCount > planCard.day ? dayCount : planCard.day;
              }
              expect(planResult.dayCount).to.eql(dayCount);
              done();
            })
            .catch((err) => done(err));
        })
        .catch((err) => done(err));
    });
  });
  it("check desc not required", (done) => {
    const req = {
      accessToken: users[0].result.latestToken,
      ...plans,
    };
    delete req.desc;

    reqFunc(url, "post", req, (err, res) => {
      res.should.have.status(200);
      res.body.should.have.property("message").eql("successfully added");
      done();
    });
  });
});
