const { Plan, User, sequelize } = require("../../models");
const chai = require("chai");
chai.should();
const { expect } = require("chai");
const reqFunc = require("../util/reqFunc");
const jwt = require("jsonwebtoken");

describe("🔥GET /plans", () => {
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
        dayCount: 3,
        representAddr: "서울시",
      },
      result: {},
    },
    {
      origin: {
        title: "비밀글1",
        desc: "비밀글1",
        public: false,
        UserId: "",
        dayCount: 4,
        representAddr: "서울시",
      },
      result: {},
    },
    {
      origin: {
        title: "공개글2",
        desc: "공개글2",
        public: true,
        UserId: "",
        dayCount: 5,
        representAddr: "울산시",
      },
      result: {},
    },
    {
      origin: {
        title: "공개글3",
        desc: "공개글3",
        public: true,
        UserId: "",
        dayCount: 2,
        representAddr: "대구시",
      },
      result: {},
    },
    {
      origin: {
        title: "비밀글2",
        desc: "비밀글2",
        public: false,
        UserId: "",
        dayCount: 3,
        representAddr: "양양군",
      },
      result: {},
    },
  ];
  const url = "/plans/1";
  const checkOriginDataWithRes = (done, query, req, originData) => {
    reqFunc(url + query, "get", req, (err, res) => {
      expect(originData.length).to.eql(res.body.plans.length);

      for (const [idx, result] of originData.entries()) {
        expect(result.title).to.eql(res.body.plans[idx].title);
        expect(result.desc).to.eql(res.body.plans[idx].desc);
        expect(result.public).to.eql(res.body.plans[idx].public ? true : false);
        expect(result.dayCount).to.eql(res.body.plans[idx].dayCount);
        expect(result.writer).to.eql(res.body.plans[idx].writer);
      }

      done();
    });
  };
  before(async () => {
    await sequelize.transaction(async (t) => {
      await User.destroy({ where: {}, transaction: t });
      await Plan.destroy({ where: {}, transaction: t });

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
      plans[2].origin.UserId = users[0].result.id;
      plans[4].origin.UserId = users[0].result.id;

      plans[1].origin.UserId = users[1].result.id;
      plans[3].origin.UserId = users[1].result.id;

      for (const plan of plans) {
        plan.result = await Plan.create(plan.origin, { transaction: t });
      }

      plans[0].origin.writer = users[0].result.nickname;
      plans[2].origin.writer = users[0].result.nickname;
      plans[4].origin.writer = users[0].result.nickname;

      plans[1].origin.writer = users[1].result.nickname;
      plans[3].origin.writer = users[1].result.nickname;
    });
  });

  it("check ignore without pathparameter", (done) => {
    reqFunc("/plans/", "get", {}, (err, res) => {
      res.should.have.status(404);
      done();
    });
  });
  it("check ignore wrong data type pathparameter", (done) => {
    reqFunc(url + "test", "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check ignore wrong data type min-day", (done) => {
    const minDay = "test";
    const query = `?min-day=${minDay}`;

    reqFunc(url + query, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });
  it("check ignore wrong data type max-day", (done) => {
    const minDay = "test";
    const query = `?max-day=${minDay}`;

    reqFunc(url + query, "get", {}, (err, res) => {
      res.should.have.status(400);
      res.body.should.have.property("message").eql("Insufficient info");
      done();
    });
  });

  it("check get all public data", (done) => {
    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true) result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, "", {}, originData);
  });
  it("check get all user1 public data", (done) => {
    const writer = users[0].origin.nickname;
    const query = `?writer=${writer}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true && v.origin.writer === writer)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });
  it("check get all user2 public data", (done) => {
    const writer = users[1].origin.nickname;
    const query = `?writer=${writer}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true && v.origin.writer === writer)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });
  it("check get all min-day filtered data", (done) => {
    const minDay = 4;
    const query = `?min-day=${minDay}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true && v.origin.dayCount >= minDay)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });
  it("check get all max-day filtered data", (done) => {
    const maxDay = 4;
    const query = `?max-day=${maxDay}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true && v.origin.dayCount <= maxDay)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });
  it("check get all min-day and max-day filtered data", (done) => {
    const minDay = 4;
    const maxDay = 5;
    const query = `?min-day=${minDay}&max-day=${maxDay}`;

    const originData = plans.reduce((result, v) => {
      if (
        v.origin.public === true &&
        v.origin.dayCount >= minDay &&
        v.origin.dayCount <= maxDay
      )
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });
  it("check get all addr filtered data", (done) => {
    const addr = "서울";
    const query = `?addr=${encodeURIComponent(addr)}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true && v.origin.representAddr.indexOf(addr) > -1)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, {}, originData);
  });

  it("check get all public data and user1 private data", (done) => {
    const testUser = users[0].result;
    const req = { accessToken: testUser.latestToken };
    const query = `?email=${testUser.email}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true) result.unshift(v.origin);
      else if (v.origin.public === false && v.origin.UserId === testUser.id)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, req, originData);
  });

  it("check get all public data and user2 private data", (done) => {
    const testUser = users[1].result;
    const req = { accessToken: testUser.latestToken };
    const query = `?email=${testUser.email}`;

    const originData = plans.reduce((result, v) => {
      if (v.origin.public === true) result.unshift(v.origin);
      else if (v.origin.public === false && v.origin.UserId === testUser.id)
        result.unshift(v.origin);

      return result;
    }, []);

    checkOriginDataWithRes(done, query, req, originData);
  });
});
